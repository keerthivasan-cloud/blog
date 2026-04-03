import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import News from './pages/News';
import Business from './pages/Business';
import AiUpdate from './pages/AiUpdate';
import MarketNews from './pages/MarketNews';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/news" element={<News />} />
        <Route path="/business" element={<Business />} />
        <Route path="/news/ai-update" element={<AiUpdate />} />
        <Route path="/news/market-news" element={<MarketNews />} />
      </Routes>
    </Router>
  );
}

export default App;
