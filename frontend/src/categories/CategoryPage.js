// src/categories/CategoryPage.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Card, CardBody, CardTitle, CardText, Button } from 'reactstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faIndianRupeeSign } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CategoryPage = ({ isAuthenticated }) => {
    const { category } = useParams();
    const [categoryProducts, setCategoryProducts] = useState({});
    const navigate = useNavigate();

    const handleAddToCart = (productId) => {
    if (isAuthenticated) {
      const token = localStorage.getItem('access_token');

      axios.post(`http://127.0.0.1:8000/api/add-to-cart/`, { product_id: productId }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(response => {
          toast.success('Product added to cart!', {
            position: "top-right"
          });
        })
        .catch(error => {
          console.error('Error adding product to cart:', error);
          toast.error('Failed to add product to cart.', {
            position: "top-right"
          });
        });
    } else {
      navigate('/login');
    }
  };

    useEffect(() => {
        async function fetchProductsByCategory() {
            try {
                const { data } = await axios.get(`http://127.0.0.1:8000/api/getProducts/?category=${category}`);
                const groupedProducts = groupProductsByCategory(data);
                setCategoryProducts(groupedProducts);
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        }
        fetchProductsByCategory();
    }, [category]);

    const groupProductsByCategory = (products) => {
        const grouped = {};
        products.forEach(product => {
            if (grouped[product.category]) {
                grouped[product.category].push(product);
            } else {
                grouped[product.category] = [product];
            }
        });
        return grouped;
    };

    return (
        <div className="d-flex flex-column" style={{ minHeight: "100vh" }}>
            <div className="container py-5">
                {Object.keys(categoryProducts).map((cat, index) => (
                    <div key={index}>
                        <h1 className="mb-4">Apple {cat} Products</h1>
                        <Row>
                            {categoryProducts[cat].map((product, index) => (
                                <Col key={index} md={3} className="mb-4">
                                    <Card style={{ width: "100%" }}>
                                        <img src={`http://127.0.0.1:8000${product.image}`} className="card-img-top" alt={product.name} style={{ maxHeight: "400px", objectFit: "cover" }} />
                                        <CardBody>
                                            <CardTitle tag="h5">{product.name}</CardTitle>
                                            <CardText tag="h5">
                                                <FontAwesomeIcon icon={faIndianRupeeSign} />{product.price}
                                            </CardText>
                                            <Button color="success" className="w-100" onClick={() => handleAddToCart(product.id)}>Add to Cart</Button>
                                        </CardBody>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </div>
                ))}
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
            <ToastContainer />
        </div>
    );
}

export default CategoryPage;
