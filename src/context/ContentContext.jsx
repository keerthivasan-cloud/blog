import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { initialArticles } from '../data/mockArticles';

import API_BASE_URL from '../config';

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
    const fetchArticles = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/articles`);
        setArticles(res.data);
      } catch (error) {
        console.error("Backend Synchronization Failure", error);
        // Fallback to mock if backend is down? 
        // For now, just log.
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
      toggleTheme
    }}>
      {children}
    </ContentContext.Provider>
  );
};
