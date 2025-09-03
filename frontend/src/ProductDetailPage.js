// In ProductDetailPage.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Row, Col, Card, CardBody, CardText,
  Button, Spinner, Alert, Badge
} from 'reactstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faIndianRupeeSign, faArrowLeft, faCartPlus } from '@fortawesome/free-solid-svg-icons';
import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ProductDetailPage = ({ isAuthenticated }) => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/product/${productId}/`);
        setProduct(data);
      } catch (err) {
        console.error("Error fetching product details:", err);
        setError("Product not found or an error occurred.");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  const handleAddToCart = () => {
    if (isAuthenticated) {
      const token = localStorage.getItem('access_token');
      axios.post(`${process.env.REACT_APP_API_URL}/api/add-to-cart/`, { product_id: productId }, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(() => {
          toast.success('Product added to cart!', { position: "top-right" });
        })
        .catch(err => {
          console.error('Error adding product to cart:', err);
          toast.error('Failed to add product to cart.', { position: "top-right" });
        });
    } else {
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Spinner color="primary" />
      </div>
    );
  }

  if (error) {
    return <Container className="py-5"><Alert color="danger">{error}</Alert></Container>;
  }

  return (
    <div className="d-flex flex-column" style={{ minHeight: "100vh" }}>
      <Container className="py-5 flex-grow-1">
        <div className="d-flex justify-content-between mb-4">
          <Button color="dark" onClick={() => navigate(-1)}>
            <FontAwesomeIcon icon={faArrowLeft} /> Back
          </Button>
          <Badge color="success" pill className="fs-6 px-3 py-2 shadow">
            In Stock
          </Badge>
        </div>
        <Row className="align-items-center">
          <Col md={6} className="text-center">
            <img
              src={`${process.env.REACT_APP_API_URL}${product.image}`}
              alt={product.name}
              className="img-fluid rounded shadow-lg"
              style={{
                maxHeight: '450px',
                objectFit: 'cover',
                transition: 'transform 0.3s ease-in-out'
              }}
              onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
            />
          </Col>
          <Col md={6}>
            <Card className="shadow-lg border-0 rounded-4">
              <CardBody>
                <h1 className="card-title fw-bold">{product.name}</h1>
                <hr />
                <h3 className="text-danger fw-bold">
                  <FontAwesomeIcon icon={faIndianRupeeSign} /> {product.price}
                </h3>
                <CardText className="mt-4">
                  <h5 className="fw-bold">Description:</h5>
                  <ul className="list-unstyled mt-2">
                    {product.description.split('\n').map((line, idx) => (
                      <li key={idx} className="mb-2">
                        {line.trim()}
                      </li>
                    ))}
                  </ul>
                </CardText>
                <div className="mt-4">
                  <Button
                    color="success"
                    size="lg"
                    className="w-100 d-flex align-items-center justify-content-center gap-2 shadow-lg"
                    onClick={handleAddToCart}
                    style={{
                      background: "linear-gradient(135deg, #28a745, #218838)",
                      border: "none"
                    }}
                  >
                    <FontAwesomeIcon icon={faCartPlus} /> Add to Cart
                  </Button>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>

      <footer className="footer bg-dark py-4 mt-auto shadow-lg">
        <div className="container text-center">
          <div className="mb-3">
            <a href="https://www.facebook.com" className="btn btn-outline-light me-3 rounded-circle">
              <FaFacebook />
            </a>
            <a href="https://www.twitter.com" className="btn btn-outline-light me-3 rounded-circle">
              <FaTwitter />
            </a>
            <a href="https://www.instagram.com" className="btn btn-outline-light rounded-circle">
              <FaInstagram />
            </a>
          </div>
          <div className="text-white-50">
            &copy; 2025 Apple Store. All rights reserved.
          </div>
        </div>
      </footer>
      <ToastContainer />
    </div>
  );
};

export default ProductDetailPage;