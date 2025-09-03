import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';

const Login = ({ handleLogin }) => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });

    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post('http://127.0.0.1:8000/api/login/', formData)
            .then(response => {
                const { access, refresh } = response.data;
                localStorage.setItem('access_token', access);
                localStorage.setItem('refresh_token', refresh);
                handleLogin(access); // Pass the access token to the parent handler
                navigate('/home');
            })
            .catch(error => {
                if (error.response) {
                    setErrors(error.response.data);
                }
            });
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
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
                                                <p className="text-center h1 fw-bold mb-2 mx-1 mx-md-4 mt-4">Login</p>
                                                <form className="mx-1 mx-md-4 mb-4" onSubmit={handleSubmit}>
                                                    <div className="d-flex flex-row align-items-center mb-2">
                                                        <FontAwesomeIcon icon={faUser} className="fa-lg me-3 fa-fw" />
                                                        <div className="form-outline flex-fill mb-0">
                                                            <input
                                                                type="text"
                                                                id="form3Example-username"
                                                                className="form-control form-control-sm"
                                                                name="username"
                                                                value={formData.username}
                                                                onChange={handleChange}
                                                                required
                                                                placeholder="USERNAME"
                                                            />
                                                            {errors.username && <p className="text-danger">{errors.username}</p>}
                                                        </div>
                                                    </div>
                                                    <div className="d-flex flex-row align-items-center mb-2 position-relative">
                                                        <FontAwesomeIcon icon={faLock} className="fa-lg me-3 fa-fw" />
                                                        <div className="form-outline flex-fill mb-0">
                                                            <input
                                                                type={showPassword ? 'text' : 'password'}
                                                                id="form3Example-password"
                                                                className="form-control form-control-sm"
                                                                name="password"
                                                                value={formData.password}
                                                                onChange={handleChange}
                                                                required
                                                                placeholder="PASSWORD"
                                                            />
                                                            <FontAwesomeIcon
                                                                icon={showPassword ? faEyeSlash : faEye}
                                                                className="fa-lg position-absolute end-0 top-0 mt-2 me-3"
                                                                style={{ cursor: 'pointer' }}
                                                                onClick={togglePasswordVisibility}
                                                            />
                                                            {errors.password && <p className="text-danger">{errors.password}</p>}
                                                        </div>
                                                    </div>
                                                    {errors.detail && <p className="text-danger">{errors.detail}</p>}
                                                    <div className="d-flex justify-content-center mx-4 mb-3 mb-lg-4">
                                                        <button type="submit" className="btn btn-success btn-lg">Login</button>
                                                    </div>
                                                    <div className="text-center">
                                                     <Link to="/forgot-password" style={{ color: 'black' }}>Forgot Password?</Link>
                                                    </div>
                                                </form>
                                                <div className="text-center mt-3">
                                                    <p>Don't have an account? <Link to="/register" style={{ color: 'black' }}>Register here</Link></p>
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

export default Login;
