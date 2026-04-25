import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './utils/axiosSetup';
import { ContentProvider, useContent } from './context/ContentContext';

// Lazy-loaded routes — nothing downloads until the user navigates to it
const Home              = React.lazy(() => import('./pages/Home'));
const ArticleDetail     = React.lazy(() => import('./pages/ArticleDetail'));
const About             = React.lazy(() => import('./pages/About'));
const Contact           = React.lazy(() => import('./pages/Contact'));
const Privacy           = React.lazy(() => import('./pages/Privacy'));
const Terms             = React.lazy(() => import('./pages/Terms'));
const QuickReads        = React.lazy(() => import('./pages/QuickReads'));
const NotFound          = React.lazy(() => import('./pages/NotFound'));

// Category pages
const BusinessIndex     = React.lazy(() => import('./pages/business/index'));
const FinanceIndex      = React.lazy(() => import('./pages/finance/index'));
const GlobalMarketIndex = React.lazy(() => import('./pages/global-market/index'));
const CommoditiesIndex  = React.lazy(() => import('./pages/commodities/index'));
const TechIndex         = React.lazy(() => import('./pages/tech/index'));
const GeneralNewsIndex  = React.lazy(() => import('./pages/general-news/index'));

// Admin pages
const AdminLogin        = React.lazy(() => import('./pages/AdminLogin'));
const Dashboard         = React.lazy(() => import('./admin/pages/Dashboard'));
const Blogs             = React.lazy(() => import('./admin/pages/Blogs'));
const Editor            = React.lazy(() => import('./admin/pages/Editor'));
const AIGenerator       = React.lazy(() => import('./admin/pages/AIGenerator'));
const MediaLibrary      = React.lazy(() => import('./admin/pages/MediaLibrary'));
const Subscribers       = React.lazy(() => import('./admin/pages/Subscribers'));
const Categories        = React.lazy(() => import('./admin/pages/Categories'));
const Notifications     = React.lazy(() => import('./admin/pages/Notifications'));
const Settings          = React.lazy(() => import('./admin/pages/Settings'));

// Dev-only performance overlay — still lazy to keep it out of prod bundle analysis
const PerformanceDashboard = React.lazy(() => import('./components/PerformanceDashboard'));

import API_BASE_URL from './config';

const ProtectedRoute = ({ children }) => {
  const { user } = useContent();
  if (!user) return <Navigate to="/admin/login" replace />;
  return children;
};

const PageShell = () => (
  <div style={{ background: 'var(--bg-main)', minHeight: '100vh' }} />
);

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
          } catch (e) { console.error('AdSense Inject Error', e); }
        }
      })
      .catch(err => console.error('Settings Sync Error', err));
  }, []);

  return (
    <ContentProvider>
      {import.meta.env.DEV && (
        <Suspense fallback={null}>
          <PerformanceDashboard />
        </Suspense>
      )}
      <Suspense fallback={<PageShell />}>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/"              element={<Home />} />
            <Route path="/business"      element={<BusinessIndex />} />
            <Route path="/finance"       element={<FinanceIndex />} />
            <Route path="/global-market" element={<GlobalMarketIndex />} />
            <Route path="/commodities"   element={<CommoditiesIndex />} />
            <Route path="/general-news"  element={<GeneralNewsIndex />} />
            <Route path="/tech"          element={<TechIndex />} />
            <Route path="/quick-reads"   element={<QuickReads />} />
            <Route path="/about"         element={<About />} />
            <Route path="/contact"       element={<Contact />} />
            <Route path="/privacy"       element={<Privacy />} />
            <Route path="/terms"         element={<Terms />} />

            {/* Admin Auth */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Protected Admin Routes */}
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard"    element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/admin/blogs"        element={<ProtectedRoute><Blogs /></ProtectedRoute>} />
            <Route path="/admin/editor/:id"   element={<ProtectedRoute><Editor /></ProtectedRoute>} />
            <Route path="/admin/ai-generator" element={<ProtectedRoute><AIGenerator /></ProtectedRoute>} />
            <Route path="/admin/media"        element={<ProtectedRoute><MediaLibrary /></ProtectedRoute>} />
            <Route path="/admin/subscribers"  element={<ProtectedRoute><Subscribers /></ProtectedRoute>} />
            <Route path="/admin/categories"   element={<ProtectedRoute><Categories /></ProtectedRoute>} />
            <Route path="/admin/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/admin/settings"     element={<ProtectedRoute><Settings /></ProtectedRoute>} />

            {/* Dynamic Editorial Routes (must be below static /admin routes) */}
            <Route path="/:category/:slug" element={<ArticleDetail />} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </Suspense>
    </ContentProvider>
  );
}

export default App;
