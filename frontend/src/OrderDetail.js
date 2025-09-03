import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';
import { faArrowLeft, faTruck, faCheckCircle, faTimesCircle, faClock } from '@fortawesome/free-solid-svg-icons';

const OrderDetail = () => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getStatusIndex = (status) => {
    const statuses = ['pending', 'shipped', 'delivered', 'cancelled'];
    return statuses.indexOf(status);
  };

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        const accessToken = localStorage.getItem('access_token');
        const orderId = window.location.pathname.split('/').pop();
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/order/${orderId}/`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setOrder(response.data);
      } catch (error) {
        console.error('Error fetching order details', error);
        setError('Error fetching order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, []);

  const handleBack = () => {
    window.history.back();
  };

  const statuses = [
    { name: 'pending', icon: faClock, text: 'Confirmed Order' },
    { name: 'shipped', icon: faTruck, text: 'Processing Order' },
    { name: 'delivered', icon: faCheckCircle, text: 'Product Delivered' },
  ];
  const currentStatusIndex = getStatusIndex(order?.shipping_status);

  const getStatusClass = (statusIndex) => {
    if (order?.shipping_status === 'cancelled') {
      return 'bg-danger';
    }
    if (statusIndex <= currentStatusIndex) {
      return 'bg-success';
    }
    return 'bg-secondary';
  };

  const getIcon = (statusName) => {
    if (order?.shipping_status === 'cancelled' && statusName === 'pending') {
      return faTimesCircle;
    }
    return statuses.find((s) => s.name === statusName)?.icon;
  };

  if (loading) {
    return <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>Loading...</div>;
  }

  if (error) {
    return <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>{error}</div>;
  }

  if (!order) {
    return <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>Order not found.</div>;
  }

  return (
    <>
      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
        rel="stylesheet"
        crossOrigin="anonymous"
      />

      <div className="container my-5">
        {/* Back Button */}
        <div className="d-flex justify-content-end mb-4">
          <button onClick={handleBack} className="btn btn-dark shadow-sm">
            <FontAwesomeIcon icon={faArrowLeft} /> Back to Orders
          </button>
        </div>

        {/* Order Summary */}
        <div className="card shadow-lg border-0 rounded-4">
          <h5 className="card-header bg-dark text-white rounded-top-4">📦 Order Details</h5>
          <div className="card-body">
            <h5 className="card-title">Order ID: <span className="text-primary">#{order.id}</span></h5>
            <p className="card-text fw-bold text-success">Total Amount: ₹{parseFloat(order.total_amount).toFixed(2)}</p>
            <p className="card-text text-muted">Order Date: {new Date(order.created_at).toLocaleDateString()}</p>
            <hr />

            {/* Shipping Status Timeline */}
            <div className="shipping-status-timeline mb-5">
              <h5 className="text-center mb-4 fw-bold">🚚 Shipping Status</h5>
              <div className="d-flex justify-content-between align-items-center">
                {statuses.map((status, index) => (
                  <React.Fragment key={index}>
                    <div className="status-item text-center position-relative">
                      <div
                        className={`status-icon p-3 rounded-circle text-white shadow ${getStatusClass(index)}`}
                        style={{ width: '60px', height: '60px', margin: '0 auto' }}
                      >
                        <FontAwesomeIcon icon={getIcon(status.name)} size="lg" />
                      </div>
                      <p className="mt-2 mb-0 fw-semibold">{status.text}</p>
                    </div>
                    {index < statuses.length - 1 && (
                      <div
                        className="status-line flex-grow-1 mx-2"
                        style={{
                          height: '4px',
                          backgroundColor: index < currentStatusIndex ? '#28a745' : '#6c757d',
                        }}
                      ></div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <hr />

            {/* Ordered Items */}
            <h5 className="fw-bold mb-3">🛍️ Ordered Items:</h5>
            <div className="row">
              {order.items &&
                order.items.map((item, index) => (
                  <div key={index} className="col-md-6 mb-4">
                    <div className="card h-100 shadow-sm border-0 rounded-4">
                      <div className="card-body">
                        <div className="row">
                          <div className="col-md-4 text-center">
                            {item.product?.image && (
                              <img
                                src={`${process.env.REACT_APP_API_URL}${item.product.image}`}
                                alt={item.product.name}
                                className="img-fluid rounded shadow-sm"
                                style={{ maxHeight: '150px', objectFit: 'cover' }}
                              />
                            )}
                          </div>
                          <div className="col-md-8">
                            <h5 className="card-title text-success">{item.product?.name || 'Product name unavailable'}</h5>
                            <p className="text-dark"><strong>Quantity:</strong> {item.quantity}</p>
                            <p className="text-danger fw-bold"><strong>Price:</strong> ₹{item.product?.price || 'N/A'}</p>
                            <p className="fw-semibold">Description:</p>
                            <ul className="ps-3">
                              {item.product?.description
                                ? item.product.description.split('\r\n').map((line, idx) => <li key={idx}>{line}</li>)
                                : 'No description available'}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer bg-dark py-4 mt-auto shadow-lg">
        <div className="container text-center">
          <div className="mb-3">
            <a href="https://www.facebook.com" className="btn btn-outline-light me-3 rounded-circle shadow-sm">
              <FaFacebook />
            </a>
            <a href="https://www.twitter.com" className="btn btn-outline-light me-3 rounded-circle shadow-sm">
              <FaTwitter />
            </a>
            <a href="https://www.instagram.com" className="btn btn-outline-light rounded-circle shadow-sm">
              <FaInstagram />
            </a>
          </div>
          <div className="text-white-50">
            &copy; {new Date().getFullYear()} Apple Store. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  );
};

export default OrderDetail;