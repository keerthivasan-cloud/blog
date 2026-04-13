import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { fetchMarketData } from '../services/marketData';

import { API_BASE_URL, ADMIN_SECRET } from '../config';

const ContentContext = createContext();

export const useContent = () => useContext(ContentContext);

const CACHE_KEY = 'nf_articles_v1';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const getCachedArticles = () => {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { articles, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) { sessionStorage.removeItem(CACHE_KEY); return null; }
    return articles;
  } catch { return null; }
};

const setCachedArticles = (articles) => {
  try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ articles, ts: Date.now() })); } catch {}
};

export const ContentProvider = ({ children }) => {
  const [articles, setArticles] = useState(() => getCachedArticles() || []);
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [marketData, setMarketData] = useState([]);
  const [settings, setSettings] = useState({
    siteName: 'NewsForge',
    themeColor: '#000000',
    adsenseScript: '',
    adsensePublisherId: '',
    logoUrl: ''
  });

  // Fetch initial settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/settings`);
        if (res.data) setSettings(res.data);
      } catch (err) {
        console.error("Settings Synchronization Failure", err);
      }
    };
    fetchSettings();
  }, []);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
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

  // Market data — 30s polling
  useEffect(() => {
    const updateMarket = async () => {
      const data = await fetchMarketData(import.meta.env.VITE_TWELVEDATA_API_KEY);
      setMarketData(data);
    };

    updateMarket();
    const interval = setInterval(updateMarket, 30000);
    return () => clearInterval(interval);
  }, []);

  // Articles: stale-while-revalidate
  // - Seed state from sessionStorage immediately (zero-latency first paint)
  // - Then fetch fresh data in background; update cache + state on success
  // - No polling — pages manage their own paginated fetches
  useEffect(() => {
    const savedUser = localStorage.getItem('newsforge_user');
    if (savedUser) setUser(JSON.parse(savedUser));

    // Only background-fetch if cache was empty on mount
    if (getCachedArticles()) return;

    const fetchArticles = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/articles?page=1&limit=6`);
        const fetched = res.data.articles || [];
        setArticles(fetched);
        setCachedArticles(fetched);
      } catch (error) {
        console.error("Backend Synchronization Failure", error);
      }
    };

    fetchArticles();
  }, []);

  const refreshArticles = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/articles?page=1&limit=6`);
      const fetched = res.data.articles || [];
      setArticles(fetched);
      setCachedArticles(fetched);
    } catch (error) {
      console.error("Manual Refresh Failure", error);
    }
  };

  const deleteArticle = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/articles/${id}`, {
        headers: { Authorization: `Bearer ${ADMIN_SECRET}` }
      });
      setArticles(prev => prev.filter(a => (a.id || a._id) !== id));
      sessionStorage.removeItem(CACHE_KEY);
    } catch (error) {
      console.error("Archive Purge Failure", error);
    }
  };

  const login = (username, password) => {
    if (username === 'admin' && password === ADMIN_SECRET) {
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
      refreshArticles,
      darkMode,
      toggleTheme,
      marketData,
      settings,
      refreshSettings: async () => {
        const res = await axios.get(`${API_BASE_URL}/settings`);
        if (res.data) setSettings(res.data);
      }
    }}>
      {children}
    </ContentContext.Provider>
  );
};
