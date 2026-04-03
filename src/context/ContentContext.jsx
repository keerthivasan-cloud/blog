import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialArticles } from '../data/mockArticles';

const ContentContext = createContext();

export const useContent = () => useContext(ContentContext);

export const ContentProvider = ({ children }) => {
  const [articles, setArticles] = useState([]);
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('newsforge_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && (prefersDark && !savedTheme))) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newVal = !darkMode;
    setDarkMode(newVal);
    if (newVal) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('newsforge_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('newsforge_theme', 'light');
    }
  };

  // Initialize articles and user from localStorage
  useEffect(() => {
    const savedArticles = localStorage.getItem('newsforge_articles_v2');
    if (savedArticles) {
      setArticles(JSON.parse(savedArticles));
    } else {
      const enhancedArticles = initialArticles.map(art => ({
        ...art,
        status: 'published',
        excerpt: art.content.substring(0, 150) + '...',
        tags: [art.category, 'NewsForge']
      }));
      setArticles(enhancedArticles);
      localStorage.setItem('newsforge_articles_v2', JSON.stringify(enhancedArticles));
    }

    const savedUser = localStorage.getItem('newsforge_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = (username, password) => {
    if (username === 'admin' && password === 'admin123') {
      const userData = { username: 'admin', role: 'admin' };
      setUser(userData);
      localStorage.setItem('newsforge_user', JSON.stringify(userData));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('newsforge_user');
  };

  return (
    <ContentContext.Provider value={{ 
      articles, 
      user,
      login,
      logout,
      darkMode,
      toggleTheme
    }}>
      {children}
    </ContentContext.Provider>
  );
};
