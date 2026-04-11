import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ContentProvider, useContent } from './context/ContentContext';
import Home from './pages/Home';
import ArticleDetail from './pages/ArticleDetail';
import About from './pages/About';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminEditor from './pages/AdminEditor';
import Admin from './pages/Admin';
import QuickReads from './pages/QuickReads';

// Category Pages
import BusinessIndex from './pages/business/index';
import FinanceIndex from './pages/finance/index';
import GlobalMarketIndex from './pages/global-market/index';
import CommoditiesIndex from './pages/commodities/index';
import TechIndex from './pages/tech/index';
import Write from './pages/Write';

// Protected Route — redirects to /admin/login if not authenticated
const ProtectedRoute = ({ children }) => {
  const { user } = useContent();
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

function App() {
  return (
    <ContentProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/business" element={<BusinessIndex />} />
          <Route path="/finance" element={<FinanceIndex />} />
          <Route path="/global-market" element={<GlobalMarketIndex />} />
          <Route path="/commodities" element={<CommoditiesIndex />} />
          <Route path="/tech" element={<TechIndex />} />
          <Route path="/quick-reads" element={<QuickReads />} />
          <Route path="/:category/:slug" element={<ArticleDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />

          {/* Admin Auth */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Protected Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
          <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/editor/:id" element={<ProtectedRoute><AdminEditor /></ProtectedRoute>} />
          <Route path="/admin/write" element={<ProtectedRoute><Write /></ProtectedRoute>} />
        </Routes>
      </Router>
    </ContentProvider>
  );
}

export default App;
