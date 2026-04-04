const mongoose = require("mongoose");
const Article = require("../models/Article");
require("dotenv").config({ path: "../.env" });

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/newsforge";

async function migrate() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to database for migration...");

    const articles = await Article.find({});
    let updatedCount = 0;

    for (const article of articles) {
      // If content is a string instead of an array, convert it
      if (typeof article.content === 'string') {
        console.log(`Migrating: ${article.title}`);
        
        // Convert HTML-ish string to a simple paragraph block
        const newContent = [
          {
            id: Date.now() + Math.random(),
            type: 'paragraph',
            content: article.content.replace(/<[^>]*>?/gm, '') // Strip basic HTML tags
          }
        ];

        article.content = newContent;
        await article.save();
        updatedCount++;
      }
    }

    console.log(`Migration complete. ${updatedCount} articles updated.`);
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrate();
