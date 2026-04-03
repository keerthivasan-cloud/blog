import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ContentProvider } from './context/ContentContext';
import Home from './pages/Home';
import ArticleDetail from './pages/ArticleDetail';
import About from './pages/About';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminEditor from './pages/AdminEditor';
import Admin from './pages/Admin';

// Category Pages
import BusinessIndex from './pages/business/index';
import FinanceIndex from './pages/finance/index';
import GlobalMarketIndex from './pages/global-market/index';
import CommoditiesIndex from './pages/commodities/index';
import TechIndex from './pages/tech/index';

function App() {
  return (
    <ContentProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/business" element={<BusinessIndex />} />
          <Route path="/finance" element={<FinanceIndex />} />
          <Route path="/global-market" element={<GlobalMarketIndex />} />
          <Route path="/commodities" element={<CommoditiesIndex />} />
          <Route path="/tech" element={<TechIndex />} />
          
          <Route path="/:category/:slug" element={<ArticleDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/editor/:id" element={<AdminEditor />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Router>
    </ContentProvider>
  );
}

export default App;
