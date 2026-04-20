import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './utils/axiosSetup'; // Global request deduplication
import { ContentProvider, useContent } from './context/ContentContext';
import PerformanceDashboard from './components/PerformanceDashboard';
import Home from './pages/Home';
import ArticleDetail from './pages/ArticleDetail';
import About from './pages/About';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import AdminLogin from './pages/AdminLogin';
import Dashboard from './admin/pages/Dashboard';
import Blogs from './admin/pages/Blogs';
import Editor from './admin/pages/Editor';
import AIGenerator from './admin/pages/AIGenerator';
import MediaLibrary from './admin/pages/MediaLibrary';
import Subscribers from './admin/pages/Subscribers';
import Categories from './admin/pages/Categories';
import Notifications from './admin/pages/Notifications';
import Settings from './admin/pages/Settings';
import QuickReads from './pages/QuickReads';
import Terms from './pages/Terms';
import NotFound from './pages/NotFound';

// Category Pages
import BusinessIndex from './pages/business/index';
import FinanceIndex from './pages/finance/index';
import GlobalMarketIndex from './pages/global-market/index';
import CommoditiesIndex from './pages/commodities/index';
import TechIndex from './pages/tech/index';
import GeneralNewsIndex from './pages/general-news/index';

import API_BASE_URL from './config';

// Protected Route — redirects to /admin/login if not authenticated
const ProtectedRoute = ({ children }) => {
  const { user } = useContent();
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

function App() {
  React.useEffect(() => {
    fetch(`${API_BASE_URL}/settings`)
      .then(res => res.json())
      .then(data => {
        if (data.themeColor) {
           document.documentElement.style.setProperty('--primary', data.themeColor);
        }
        if (data.adsenseScript && !document.querySelector('script[src*="adsbygoogle"]')) {
           try {
             const temp = document.createElement('div');
             temp.innerHTML = data.adsenseScript.trim();
             const originalScript = temp.querySelector('script');
             if (originalScript) {
               const script = document.createElement('script');
               Array.from(originalScript.attributes).forEach(attr => script.setAttribute(attr.name, attr.value));
               script.innerHTML = originalScript.innerHTML;
               document.head.appendChild(script);
             }
           } catch(e) { console.error('AdSense Inject Error', e); }
        }
      })
      .catch(err => console.error('Settings Sync Error', err));
  }, []);

  return (
    <ContentProvider>
      {import.meta.env.DEV && <PerformanceDashboard />}
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/business" element={<BusinessIndex />} />
          <Route path="/finance" element={<FinanceIndex />} />
          <Route path="/global-market" element={<GlobalMarketIndex />} />
          <Route path="/commodities" element={<CommoditiesIndex />} />
          <Route path="/general-news" element={<GeneralNewsIndex />} />
          <Route path="/tech" element={<TechIndex />} />
          <Route path="/quick-reads" element={<QuickReads />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />

          {/* Admin Auth */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Protected Admin Routes */}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/admin/blogs" element={<ProtectedRoute><Blogs /></ProtectedRoute>} />
          <Route path="/admin/editor/:id" element={<ProtectedRoute><Editor /></ProtectedRoute>} />
          <Route path="/admin/ai-generator" element={<ProtectedRoute><AIGenerator /></ProtectedRoute>} />
          <Route path="/admin/media" element={<ProtectedRoute><MediaLibrary /></ProtectedRoute>} />
          <Route path="/admin/subscribers" element={<ProtectedRoute><Subscribers /></ProtectedRoute>} />
          <Route path="/admin/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
          <Route path="/admin/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

          {/* Dynamic Editorial Routes (must be below static /admin routes) */}
          <Route path="/:category/:slug" element={<ArticleDetail />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </ContentProvider>
  );
}

export default App;
