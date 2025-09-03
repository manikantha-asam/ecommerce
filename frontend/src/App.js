import React, { useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import GetProducts from './GetProducts';
import ProductDetailPage from './ProductDetailPage';
import Navbar from './navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import Cart from './Cart';
import Login from './AppleLogin';
import Registration from './AppleRegister';
import Home from './Home';
import ContactUs from './ContactUs';
import CategoryPage from './categories/CategoryPage';
import MacBookPage from './categories/MacBookPage';
import Iphone from './categories/Iphone';
import IPadPage from './categories/IPadPage';
import AirpodPage from './categories/AirpodPage';
import TvAndHomePage from './categories/TvAndHomePage';
import OthersPage from './categories/OthersPage';
import WatchPage from './categories/WatchPage';
import axios from 'axios';
import Profile from './Profile';
import ForgotPassword from './Forgotpassword';
import ResetPassword from './ResetPassword';
import OrderDetails from './OrderDetails';
import PlaceOrder from './PlaceOrder';
import OrderDetail from './OrderDetail';
import AdminDashboard from './AdminDashboard';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [isAdmin, setIsAdmin] = React.useState(false);
  const navigate = useNavigate();

  const fetchUserStatus = async (token) => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/customer/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.is_staff) {
        console.log("User is an admin.");
        setIsAdmin(true);
      } else {
        console.log("User is not an admin.");
        setIsAdmin(false);
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      setIsAuthenticated(true);
      fetchUserStatus(accessToken);
    }
  }, []);

  const handleLogin = (accessToken) => {
    setIsAuthenticated(true);
    fetchUserStatus(accessToken);
    navigate('/home');
  };

  const handleLogout = () => {
    const refreshToken = localStorage.getItem('refresh_token');
    axios.post('http://127.0.0.1:8000/api/logout/', { refresh: refreshToken })
      .then(() => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setIsAuthenticated(false);
        setIsAdmin(false);
        navigate('/login');
      })
      .catch(error => {
        console.error('Error logging out', error);
      });
  };

  return (
    
      <div className="App">
        <Navbar isAuthenticated={isAuthenticated} isAdmin={isAdmin} handleLogout={handleLogout} />
        <Routes>
          <Route exact path="/" element={<GetProducts isAuthenticated={isAuthenticated} />} />
          <Route exact path="/home" element={<Home isAuthenticated={isAuthenticated} />} />
          <Route path="/product/:productId" element={<ProductDetailPage isAuthenticated={isAuthenticated} />} />
          <Route exact path="/cart" element={<Cart />} />
          <Route exact path="/Contact" element={<ContactUs />} />
          <Route exact path="/register" element={<Registration />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
          <Route exact path="/login" element={<Login handleLogin={handleLogin} />} />
          <Route path="/category" element={<CategoryPage isAuthenticated={isAuthenticated} />} />
          <Route path="/MacBook" element={<MacBookPage isAuthenticated={isAuthenticated} />} />
          <Route path="/Iphone" element={<Iphone isAuthenticated={isAuthenticated} />} />
          <Route path="/Ipad" element={<IPadPage isAuthenticated={isAuthenticated} />} />
          <Route path="/Watch" element={<WatchPage isAuthenticated={isAuthenticated} />} />
          <Route path="/Airpods" element={<AirpodPage isAuthenticated={isAuthenticated} />} />
          <Route path="/TvAndHome" element={<TvAndHomePage isAuthenticated={isAuthenticated} />} />
          <Route path="/Others" element={<OthersPage isAuthenticated={isAuthenticated} />} />
          <Route path="/settings" element={<Profile />} />
          <Route path="/orders" element={<OrderDetails />} />
          <Route exact path="/place-order" element={<PlaceOrder />} />
          <Route path="/order/:orderId" element={<OrderDetail />} />
          

          {isAdmin && <Route path="/admin-dashboard" element={<AdminDashboard />} />}
        </Routes>
      </div>
    
  );
}

export default App;