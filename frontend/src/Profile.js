import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';

const Profile = () => {
    const [customerData, setCustomerData] = useState({
        username: '',
        customer_name: '',
        email: '',
        phone_number: '',
        address: '',
        city: '',
        state: '',
        profile_picture: ''
    });
    const [originalData, setOriginalData] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const fetchData = async () => {
        const accessToken = localStorage.getItem('access_token');
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/customer/', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            setCustomerData(response.data);
            setOriginalData(response.data);
        } catch (error) {
            console.error('Error fetching customer data', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCustomerData({ ...customerData, [name]: value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCustomerData({ ...customerData, profile_picture: file });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const accessToken = localStorage.getItem('access_token');
        const formData = new FormData();
        
        Object.entries(customerData).forEach(([key, value]) => {
            if (value !== originalData[key]) {
                formData.append(key, value);
            }
        });

        try {
            const response = await axios.patch('http://127.0.0.1:8000/api/customer/', formData, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            setCustomerData(response.data);
            setOriginalData(response.data);
            setIsEditing(false);
            setSuccessMessage('Profile updated successfully');
            setErrorMessage('');
        } catch (error) {
            console.error('Error updating profile', error);
            setErrorMessage('Error updating profile');
            setSuccessMessage('');
        }
    };

    return (
        <div className="d-flex flex-column min-vh-100">
            <div className="container mt-5">
                <div className="row">
                    <div className="col-md-4">
                        <div className="card">
                            <div className="card-body text-center">
                                {customerData.profile_picture ? (
                                    <img
                                        src={typeof customerData.profile_picture === 'string' ? customerData.profile_picture : URL.createObjectURL(customerData.profile_picture)}
                                        alt="Profile"
                                        className="rounded-circle img-fluid"
                                        style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                                    />
                                ) : (
                                    <div className="rounded-circle img-fluid bg-secondary d-flex align-items-center justify-content-center" style={{ width: '150px', height: '150px' }}>
                                        No Image
                                    </div>
                                )}
                                <h5 className="card-title mt-3">{customerData.customer_name}</h5>
                                <p className="card-text text-muted">{customerData.email}</p>
                                <p className="card-text text-muted">{customerData.phone_number}</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-8">
                        <div className="card">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h5 className="card-title">Profile Information</h5>
                                    <button className="btn btn-outline-primary" onClick={() => setIsEditing(!isEditing)}>
                                        <FaEdit /> {isEditing ? 'Cancel' : 'Edit'}
                                    </button>
                                </div>
                                {successMessage && <div className="alert alert-success">{successMessage}</div>}
                                {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
                                <form onSubmit={handleSubmit}>
                                    <div className="form-group mb-3">
                                        <label htmlFor="username">Username</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="username"
                                            name="username"
                                            value={customerData.username}
                                            disabled
                                        />
                                    </div>
                                    <div className="form-group mb-3">
                                        <label htmlFor="customer_name">Customer Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="customer_name"
                                            name="customer_name"
                                            value={customerData.customer_name}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                    <div className="form-group mb-3">
                                        <label htmlFor="email">Email</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            id="email"
                                            name="email"
                                            value={customerData.email}
                                            disabled
                                        />
                                    </div>
                                    <div className="form-group mb-3">
                                        <label htmlFor="phone_number">Phone Number</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="phone_number"
                                            name="phone_number"
                                            value={customerData.phone_number}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                    <div className="form-group mb-3">
                                        <label htmlFor="address">Address</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="address"
                                            name="address"
                                            value={customerData.address}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                    <div className="form-group mb-3">
                                        <label htmlFor="city">City</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="city"
                                            name="city"
                                            value={customerData.city}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                    <div className="form-group mb-3">
                                        <label htmlFor="state">State</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="state"
                                            name="state"
                                            value={customerData.state}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                    {isEditing && (
                                        <div className="form-group mb-3">
                                            <label htmlFor="profile_picture">Profile Picture</label>
                                            <input
                                                type="file"
                                                className="form-control"
                                                id="profile_picture"
                                                name="profile_picture"
                                                onChange={handleFileChange}
                                            />
                                        </div>
                                    )}
                                    {isEditing && (
                                        <button type="submit" className="btn btn-success">
                                            Save Changes
                                        </button>
                                    )}
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
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

export default Profile;
