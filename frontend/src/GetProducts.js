// GetProducts.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Row, Col, Card, CardBody, CardTitle, CardText, Button } from 'reactstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faIndianRupeeSign } from '@fortawesome/free-solid-svg-icons';
import { useNavigate, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const GetProducts = ({ isAuthenticated }) => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  const handleAddToCart = (productId) => {
    if (isAuthenticated) {
      const token = localStorage.getItem('access_token');

      axios.post(`${process.env.REACT_APP_API_URL}/api/add-to-cart/`, { product_id: productId }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(response => {
          toast.success('Product added to cart!', { position: "top-right" });
        })
        .catch(error => {
          console.error('Error adding product to cart:', error);
          toast.error('Failed to add product to cart.', { position: "top-right" });
        });
    } else {
      navigate('/login');
    }
  };

  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data } = await axios.get("${process.env.REACT_APP_API_URL}/api/getProducts/");
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    }
    fetchProducts();
  }, []);

  return (
    <div className="d-flex flex-column" style={{ minHeight: "100vh" }}>
      <div className="container py-5">
        <h1 className="mb-4 text-center fw-bold">Apple Products</h1>
        <Row>
          {products.map((product, index) => (
            <Col key={index} md={3} className="mb-4 d-flex">
              <Card className="w-100 d-flex flex-column shadow-sm rounded-3">
                
                {/* Image wrapper */}
                <Link to={`/product/${product.id}`} className="text-decoration-none text-dark">
                  <div
                    className="d-flex justify-content-center align-items-center"
                    style={{ height: "220px", overflow: "hidden" }}
                  >
                    <img
                      src={`${process.env.REACT_APP_API_URL}${product.image}`}
                      alt={product.name}
                      style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }}
                    />
                  </div>

                  {/* Product details */}
                  <CardBody className="d-flex flex-column flex-grow-1 text-center">
                    <CardTitle
                      tag="h6"
                      className="fw-bold text-truncate"
                      title={product.name}
                    >
                      {product.name}
                    </CardTitle>
                    <CardText tag="h5" className="text-success mb-3">
                      <FontAwesomeIcon icon={faIndianRupeeSign} /> {product.price}
                    </CardText>
                  </CardBody>
                </Link>

                {/* Add to Cart button always at bottom */}
                <div className="p-2">
                  <Button
                    color="success"
                    className="w-100"
                    onClick={() => handleAddToCart(product.id)}
                  >
                    Add to Cart
                  </Button>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* Footer */}
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

export default GetProducts;
