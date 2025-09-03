import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Nav } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faShoppingCart, faUser, faPhone, faThLarge, faCog } from '@fortawesome/free-solid-svg-icons';
import { faApple } from '@fortawesome/free-brands-svg-icons';

const Navbar = ({ isAuthenticated, isAdmin, handleLogout }) => {
  const [customerData, setCustomerData] = useState({
    customer_name: '',
    profile_picture: ''
  });

  const fetchData = async () => {
    const accessToken = localStorage.getItem('access_token');
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/customer/', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      setCustomerData(response.data);
    } catch (error) {
      console.error('Error fetching customer data', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  return (
    <nav className="navbar navbar-expand-lg bg-dark" data-bs-theme="dark">
      <div className="container-fluid">
        <Link to="/home" className="navbar-brand me-3">APPLE STORE</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarColor01" aria-controls="navbarColor01" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarColor01">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item me-3">
              <LinkContainer to="/home">
                <Nav.Link><FontAwesomeIcon icon={faHome} /> Home</Nav.Link>
              </LinkContainer>
            </li>
            <li className="nav-item me-3">
              <LinkContainer to="/">
                <Nav.Link><FontAwesomeIcon icon={faApple} /> Products</Nav.Link>
              </LinkContainer>
            </li>
            <li className="nav-item me-3">
              <LinkContainer to="/cart">
                <Nav.Link><FontAwesomeIcon icon={faShoppingCart} /> Cart</Nav.Link>
              </LinkContainer>
            </li>
            <li className="nav-item me-3">
              <LinkContainer to="/Contact">
                <Nav.Link><FontAwesomeIcon icon={faPhone} /> Contact Us</Nav.Link>
              </LinkContainer>
            </li>
            <li className="nav-item dropdown me-3">
              <Nav.Link className="nav-link dropdown-toggle" href="/" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                <FontAwesomeIcon icon={faThLarge} /> Categories
              </Nav.Link>
              <div className="dropdown-menu" aria-labelledby="navbarDropdown">
                <LinkContainer to="/category">
                  <Nav.Link className="dropdown-item">All Products</Nav.Link>
                </LinkContainer>
                <div className="dropdown-divider"></div>
                <LinkContainer to="/MacBook">
                  <Nav.Link className="dropdown-item">MacBook</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/Iphone">
                  <Nav.Link className="dropdown-item">iPhone</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/Ipad">
                  <Nav.Link className="dropdown-item">iPad</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/Watch">
                  <Nav.Link className="dropdown-item">Watch</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/Airpods">
                  <Nav.Link className="dropdown-item">AirPods</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/TvAndHome">
                  <Nav.Link className="dropdown-item">TV & Home</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/Others">
                  <Nav.Link className="dropdown-item">Others</Nav.Link>
                </LinkContainer>
              </div>
            </li>
          </ul>
          {isAuthenticated ? (
            <ul className="navbar-nav d-flex align-items-center ms-auto mb-2 mb-lg-0">
              {isAdmin && (
                <li className="nav-item me-3">
                    <LinkContainer to="/admin-dashboard">
                      <Nav.Link><FontAwesomeIcon icon={faCog} /> Admin Dashboard</Nav.Link>
                    </LinkContainer>
                </li>
              )}
              <li className="nav-item dropdown me-3">
                <Nav.Link className="nav-link dropdown-toggle d-flex align-items-center" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  {customerData.profile_picture ? (
                    <img
                      src={customerData.profile_picture}
                      alt="Profile"
                      className="rounded-circle"
                      style={{ width: '30px', height: '30px', marginRight: '10px' }}
                    />
                  ) : (
                    <div
                      className="rounded-circle bg-secondary"
                      style={{ width: '30px', height: '30px', marginRight: '10px' }}
                    />
                  )}
                  Welcome, {customerData.customer_name}
                </Nav.Link>
                <div className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                  <LinkContainer to="/settings">
                    <Nav.Link className="dropdown-item">Profile</Nav.Link>
                  </LinkContainer>
                  <LinkContainer to="/orders">
                    <Nav.Link className="dropdown-item">My Orders</Nav.Link>
                  </LinkContainer>
                  <Nav.Link className="dropdown-item" onClick={handleLogout}>Logout</Nav.Link>
                </div>
              </li>
            </ul>
          ) : (
            <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
              <li className="nav-item dropdown me-3">
                <Nav.Link className="nav-link dropdown-toggle" href="/login" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  <FontAwesomeIcon icon={faUser} /> Register/Login
                </Nav.Link>
                <div className="dropdown-menu" aria-labelledby="navbarDropdown">
                  <LinkContainer to="/register">
                    <Nav.Link className="dropdown-item">Register</Nav.Link>
                  </LinkContainer>
                  <LinkContainer to="/login">
                    <Nav.Link className="dropdown-item">Login</Nav.Link>
                  </LinkContainer>
                </div>
              </li>
            </ul>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
