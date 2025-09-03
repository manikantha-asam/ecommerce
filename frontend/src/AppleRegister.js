import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faLock, faKey, faPhone, faAddressCard, faCity, faMountainCity, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons/faUserCircle';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Registration = () => {
    const [formData, setFormData] = useState({
        username: '',
        customer_name: '',
        email: '',
        phone_number: '',
        address: '',
        city: '',
        state: '',
        password: '',
        confirm_password: '',
    });

    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const validateForm = () => {
        let valid = true;
        const newErrors = {};

        if (!/^[a-zA-Z0-9]{6,}$/.test(formData.username)) {
            newErrors.username = 'Username must be at least 6 characters long and contain only letters and digits.';
            valid = false;
        }

        if (!/^[a-zA-Z ]+$/.test(formData.customer_name)) {
            newErrors.customer_name = 'Customer name must contain only letters.';
            valid = false;
        }

        if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format.';
            valid = false;
        }

        if (!/^\d{10}$/.test(formData.phone_number)) {
            newErrors.phone_number = 'Phone number must be 10 digits.';
            valid = false;
        }

        if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters long.';
            valid = false;
        }

        if (formData.password !== formData.confirm_password) {
            newErrors.confirm_password = 'Passwords do not match.';
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            axios.post('${process.env.REACT_APP_API_URL}/api/register/', formData)
                .then(response => {
                    toast.success('Registration successful! You can now log in.', {
                        position: "top-right"
                    });
                    setFormData({
                        username: '',
                        customer_name: '',
                        email: '',
                        phone_number: '',
                        address: '',
                        city: '',
                        state: '',
                        password: '',
                        confirm_password: '',
                    });
                    setErrors({});
                    setIsRegistered(true);
                })
                .catch(error => {
                    if (error.response) {
                        for (const key in error.response.data) {
                            if (Array.isArray(error.response.data[key])) {
                                error.response.data[key].forEach(message => {
                                    toast.error(`${key}: ${message}`, {
                                        position: "top-right"
                                    });
                                });
                            }
                        }
                    }
                });
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    return (
        <div>
            <section>
                <div className="vh-75" style={{ backgroundColor: '#eee', paddingTop: '75px', paddingBottom: '100px' }}>
                    <div className="container h-200">
                        <div className="row d-flex justify-content-center align-items-center h-50">
                            <div className="col-lg-8 col-xl-7">
                                <div className="card text-black" style={{ borderRadius: '100px' }}>
                                    <div className="card-body p-md-2">
                                        <div className="row justify-content-center">
                                            <div className="col-md-12 col-lg-11 col-xl-10 order-2 order-lg-1">
                                                <p className="text-center h1 fw-bold mb-2 mx-1 mx-md-4 mt-4">Register</p>
                                                <form className="mx-1 mx-md-4 mb-4" onSubmit={handleSubmit}>
                                                    {[
                                                        { field: 'username', icon: faUser },
                                                        { field: 'customer_name', icon: faUserCircle },
                                                        { field: 'email', icon: faEnvelope },
                                                        { field: 'phone_number', icon: faPhone },
                                                        { field: 'address', icon: faAddressCard },
                                                        { field: 'city', icon: faCity },
                                                        { field: 'state', icon: faMountainCity }
                                                    ].map(({ field, icon }) => (
                                                        <div className="d-flex flex-row align-items-center mb-2" key={field}>
                                                            <FontAwesomeIcon icon={icon} className="fa-lg me-3 fa-fw" />
                                                            <div className="form-outline flex-fill mb-0">
                                                                <input
                                                                    type={field === 'email' ? 'email' : 'text'}
                                                                    id={`form3Example-${field}`}
                                                                    className="form-control form-control-sm"
                                                                    name={field}
                                                                    value={formData[field]}
                                                                    onChange={handleChange}
                                                                    required
                                                                    placeholder={field.replace('_', ' ').toUpperCase()}
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {[
                                                        { field: 'password', icon: faLock, show: showPassword, toggle: togglePasswordVisibility },
                                                        { field: 'confirm_password', icon: faKey, show: showConfirmPassword, toggle: toggleConfirmPasswordVisibility }
                                                    ].map(({ field, icon, show, toggle }) => (
                                                        <div className="d-flex flex-row align-items-center mb-2 position-relative" key={field}>
                                                            <FontAwesomeIcon icon={icon} className="fa-lg me-3 fa-fw" />
                                                            <div className="form-outline flex-fill mb-0">
                                                                <input
                                                                    type={show ? 'text' : 'password'}
                                                                    id={`form3Example-${field}`}
                                                                    className="form-control form-control-sm"
                                                                    name={field}
                                                                    value={formData[field]}
                                                                    onChange={handleChange}
                                                                    required
                                                                    placeholder={field.replace('_', ' ').toUpperCase()}
                                                                />
                                                                <FontAwesomeIcon
                                                                    icon={show ? faEyeSlash : faEye}
                                                                    className="fa-lg position-absolute end-0 top-0 mt-2 me-3"
                                                                    style={{ cursor: 'pointer' }}
                                                                    onClick={toggle}
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                    <div className="text-center mt-3">
                                                        <p>ALREADY HAVE AN ACCOUNT? <Link to="/login" style={{ color: 'black' }}>Login here</Link></p>
                                                    </div>
                                                    <div className="d-flex justify-content-center mx-4 mb-3 mb-lg-6">
                                                        <button type="submit" className={`btn btn-lg ${isRegistered ? 'btn-success' : 'btn-primary'}`} disabled={isRegistered}>
                                                            {isRegistered ? 'Registered' : 'Register'}
                                                        </button>
                                                    </div>
                                                </form>
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
            <ToastContainer />
        </div>
    );
};

export default Registration;
