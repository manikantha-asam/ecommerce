import React, { useState } from 'react';
import axios from 'axios';
import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';
import { Link } from 'react-router-dom';
const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('http://127.0.0.1:8000/api/request-password-reset/', { email })
      .then(response => {
        setMessage('Password reset link has been sent to your email');
      })
      .catch(error => {
        if (error.response) {
          setMessage(error.response.data.detail);
        }
      });
  };

  return (
    <div>
      <section>
        <div className="vh-75" style={{ backgroundColor: '#eee', paddingTop: '75px', paddingBottom: '200px' }}>
          <div className="container h-200">
            <div className="row d-flex justify-content-center align-items-center h-50">
              <div className="col-lg-8 col-xl-7">
                <div className="card text-black" style={{ borderRadius: '100px' }}>
                  <div className="card-body p-md-2">
                    <div className="row justify-content-center">
                      <div className="col-md-12 col-lg-11 col-xl-10 order-2 order-lg-1">
                        <p className="text-center h1 fw-bold mb-2 mx-1 mx-md-4 mt-4">Forgot Password</p>
                        <form className="mx-1 mx-md-4 mb-4" onSubmit={handleSubmit}>
                          <div className="d-flex flex-row align-items-center mb-2">
                            <div className="form-outline flex-fill mb-0">
                              <input
                                type="email"
                                id="form3Example-email"
                                className="form-control form-control-sm"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="EMAIL"
                              />
                            </div>
                          </div>
                          {message && <p className="text-danger">{message}</p>}
                          <div className="d-flex justify-content-center mx-4 mb-3 mb-lg-4">
                            <button type="submit" className="btn btn-success btn-lg">Submit</button>
                          </div>
                        </form>
                        <div className="text-center mt-3">
                          <Link to="/login" style={{ color: 'black' }}>Back to Login</Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <footer className="footer bg-dark py-3 mt-auto">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-auto text-center text-white">
              <a href="https://www.facebook.com" className="btn btn-outline-light me-3"><FaFacebook /></a>
              <a href="https://www.twitter.com" className="btn btn-outline-light me-3"><FaTwitter /></a>
              <a href="https://www.instagram.com" className="btn btn-outline-light"><FaInstagram /></a>
            </div>
          </div>
          <div className="row justify-content-center mt-2">
            <div className="col-auto text-center text-white">
              &copy; 2024 Apple Store. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ForgotPassword;
