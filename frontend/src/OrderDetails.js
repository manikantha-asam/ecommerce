import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';
import {
  Container, Row, Col, Table, Button, Spinner
} from 'reactstrap';
import { useNavigate } from 'react-router-dom';

const OrderDetails = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const accessToken = localStorage.getItem('access_token');
        const response = await axios.get('${process.env.REACT_APP_API_URL}/api/user-orders/', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        // Sort orders by created_at date in descending order
        const sortedOrders = response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setOrders(sortedOrders);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching orders', error);
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleViewOrder = (orderId) => {
    navigate(`/order/${orderId}`);
  };

  if (loading) {
    return (
      <div className="container text-center mt-5">
        <Spinner color="primary" />
        <h2>Loading...</h2>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="container text-center mt-5">
        <h2>No orders found.</h2>
      </div>
    );
  }

  return (
    <>
      <div className="container mt-4">
        <h2 className="mb-4 text-center">Your Orders</h2>
        <h3 className="mb-4 text-success">Thanks For Ordering!</h3>
        <Table responsive bordered className="mt-3">
          <thead className="thead-success">
            <tr>
              <th>Order Date</th>
              <th>Product Image</th>
              <th>Product Name</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Total Amount</th>
              <th>Shipping Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              order.items.map((item, index) => (
                <tr key={item.product.id}>
                  {index === 0 && (
                    <>
                      <td rowSpan={order.items.length} className="align-middle">{new Date(order.created_at).toLocaleDateString()}</td>
                    </>
                  )}
                  <td className="align-middle">
                    <img src={`${process.env.REACT_APP_API_URL}${item.product.image}`} alt={item.product.name} className="img-fluid" style={{ maxHeight: '100px' }} />
                  </td>
                  <td className="align-middle text-success">{item.product.name}</td>
                  <td className="align-middle text-danger">₹{item.product.price}</td>
                  <td className="align-middle text-warning">{item.quantity}</td>
                  {index === 0 && (
                    <>
                      <td rowSpan={order.items.length} className="align-middle"><b>₹{order.total_amount}</b></td>
                      <td rowSpan={order.items.length} className="align-middle text-warning">{order.shipping_status}</td>
                      <td rowSpan={order.items.length} className="align-middle">
                        <Button onClick={() => handleViewOrder(order.id)} color="success">
                          View Order Details
                        </Button>
                      </td>
                    </>
                  )}
                </tr>
              ))
            ))}
          </tbody>
        </Table>
      </div>
      <footer className="footer bg-dark py-3">
        <Container>
          <Row className="justify-content-center">
            <Col xs="auto" className="text-center text-white">
              <a href="https://www.facebook.com" className="btn btn-outline-light me-3"><FaFacebook /></a>
              <a href="https://www.twitter.com" className="btn btn-outline-light me-3"><FaTwitter /></a>
              <a href="https://www.instagram.com" className="btn btn-outline-light"><FaInstagram /></a>
            </Col>
          </Row>
          <Row className="justify-content-center mt-3">
            <Col xs="auto" className="text-center text-white">
              &copy; {new Date().getFullYear()} Apple Store. All rights reserved.
            </Col>
          </Row>
        </Container>
      </footer>
    </>
  );
};

export default OrderDetails;