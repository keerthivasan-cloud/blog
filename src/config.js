const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? `http://localhost:5001/api`
    : `${window.location.protocol}//${window.location.hostname}:5001/api`);

const ADMIN_SECRET = import.meta.env.VITE_ADMIN_SECRET || 'admin123';

export { API_BASE_URL, ADMIN_SECRET };
export default API_BASE_URL;
