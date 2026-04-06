import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { initialArticles } from '../data/mockArticles';
import { fetchMarketData } from '../services/marketData';

import API_BASE_URL from '../config';

const ContentContext = createContext();

export const useContent = () => useContext(ContentContext);

export const ContentProvider = ({ children }) => {
  const [articles, setArticles] = useState([]);
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [marketData, setMarketData] = useState([]);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark'; // Default dark
    const isDark = savedTheme === 'dark';
    setDarkMode(isDark);
    document.documentElement.setAttribute('data-theme', savedTheme);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newVal = !darkMode;
    const themeStr = newVal ? 'dark' : 'light';
    setDarkMode(newVal);
    document.documentElement.setAttribute('data-theme', themeStr);
    localStorage.setItem('theme', themeStr);
    
    if (newVal) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Market Data Polling Engine (5s)
  useEffect(() => {
    const updateMarket = async () => {
      const data = await fetchMarketData(import.meta.env.VITE_TWELVEDATA_API_KEY);
      setMarketData(data);
    };

    updateMarket();
    const interval = setInterval(updateMarket, 30000); // 30s for free-tier compatibility
    return () => clearInterval(interval);
  }, []);

  // Initialize articles and user from localStorage
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/articles`);
        setArticles(res.data);
      } catch (error) {
        console.error("Backend Synchronization Failure", error);
      }
    };

    fetchArticles();

    const savedUser = localStorage.getItem('newsforge_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const deleteArticle = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/articles/${id}`);
      setArticles(prev => prev.filter(a => a._id !== id));
    } catch (error) {
      console.error("Archive Purge Failure", error);
    }
  };

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
      deleteArticle,
      darkMode,
      toggleTheme,
      marketData
    }}>
      {children}
    </ContentContext.Provider>
  );
};
