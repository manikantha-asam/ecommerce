// PlaceOrder.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Spinner, Alert, Container, Row, Col } from 'reactstrap';
import { ToastContainer, toast } from 'react-toastify';

const PlaceOrder = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // This is a common practice to call the place order function
    // immediately when this page loads.
    handlePlaceOrder();
  }, []);

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError('');
    
    try {
      const accessToken = localStorage.getItem('access_token');
      const response = await axios.post('${process.env.REACT_APP_API_URL}/api/place-order/', {}, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      console.log('Order placed successfully:', response.data);
      toast.success('Order placed successfully!', { position: "top-right" });
      setTimeout(() => {
        navigate('/orders');
      }, 2000); // Redirect after a delay to show the toast
    } catch (error) {
      setError('Error placing order. Your cart might be empty or a server error occurred.');
      console.error('Error placing order:', error.response ? error.response.data : error.message);
      toast.error('Failed to place order.', { position: "top-right" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <h1 className="mb-4 text-center">Placing Your Order...</h1>
          {loading ? (
            <div className="text-center">
              <Spinner color="primary" />
              <p className="mt-2">Please wait...</p>
            </div>
          ) : error ? (
            <Alert color="danger">{error}</Alert>
          ) : (
            <div className="text-center">
              <p>You will be redirected to your orders page shortly.</p>
            </div>
          )}
        </Col>
      </Row>
      <ToastContainer />
    </Container>
  );
}

export default PlaceOrder;