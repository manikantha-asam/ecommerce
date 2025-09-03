import React, { useEffect, useState } from 'react';
import {
  Container, Row, Col, Button, Card, CardBody, CardTitle, CardText,
  Carousel, CarouselItem, CarouselControl, CarouselIndicators, Modal, ModalHeader, ModalBody, ModalFooter
} from 'reactstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import { FaFacebook, FaTwitter, FaInstagram, FaQuoteLeft } from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faIndianRupeeSign } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Home.css';

const Home = ({ isAuthenticated }) => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [modal, setModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const navigate = useNavigate();

  const handleAddToCart = (productId) => {
    if (isAuthenticated) {
      const token = localStorage.getItem('access_token');
      axios.post(`${process.env.REACT_APP_API_URL}/api/add-to-cart/`, { product_id: productId }, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(() => toast.success('Product added to cart!'))
        .catch(() => toast.error('Failed to add product to cart.'));
    } else {
      navigate('/register');
    }
  };

  const handleBuyNow = (productId) => {
    if (isAuthenticated) {
      const token = localStorage.getItem('access_token');
      axios.post(`${process.env.REACT_APP_API_URL}/api/add-to-cart/`, { product_id: productId }, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(() => {
          toast.success('Product added to cart! Redirecting to checkout...');
          navigate('/place-order');
      })
      .catch(() => toast.error('Failed to add product to cart.'));
    } else {
      navigate('/register');
    }
  };

  const toggleModal = () => setModal(!modal);

  const next = () => {
    if (animating) return;
    const nextIndex = activeIndex === Math.ceil(featuredProducts.length / 4) - 1 ? 0 : activeIndex + 1;
    setActiveIndex(nextIndex);
  };

  const previous = () => {
    if (animating) return;
    const nextIndex = activeIndex === 0 ? Math.ceil(featuredProducts.length / 4) - 1 : activeIndex - 1;
    setActiveIndex(nextIndex);
  };

  const goToIndex = (newIndex) => {
    if (animating) return;
    setActiveIndex(newIndex);
  };

  useEffect(() => {
    async function fetchFeaturedProducts() {
      try {
        const { data } = await axios.get("${process.env.REACT_APP_API_URL}/api/getProducts/");
        setFeaturedProducts(data);
      } catch (error) {
        console.error("Error fetching featured products:", error);
      }
    }
    fetchFeaturedProducts();
  }, []);

  useEffect(() => {
    const interval = setInterval(next, 5000);
    return () => clearInterval(interval);
  }, [activeIndex]);

  const openProductModal = (product) => {
    setSelectedProduct(product);
    toggleModal();
  };

  const slides = [];
  for (let i = 0; i < Math.ceil(featuredProducts.length / 4); i++) {
    const slideItems = featuredProducts.slice(i * 4, (i + 1) * 4).map((product, index) => (
      <Col sm={3} key={index}>
        <Card className="mb-4 product-card shadow-effect" onClick={() => openProductModal(product)}>
          <img src={`${process.env.REACT_APP_API_URL}${product.image}`} alt="Product" className="img-fluid mx-auto d-block" />
          <CardBody className="text-center">
            <CardTitle tag="h5">{product.name}</CardTitle>
            <CardText tag="h5">
              <FontAwesomeIcon icon={faIndianRupeeSign} /> {product.price}
            </CardText>
          </CardBody>
        </Card>
      </Col>
    ));
    slides.push(
      <CarouselItem
        onExiting={() => setAnimating(true)}
        onExited={() => setAnimating(false)}
        key={i}
      >
        <Row>{slideItems}</Row>
      </CarouselItem>
    );
  }

  return (
    <div className="home-wrapper">
      {/* Hero Section */}
      <section className="hero-section d-flex align-items-center justify-content-center text-center">
        <div>
          <h1 className="display-3 fw-bold mb-3 animate-text">Welcome to the Apple Store</h1>
          <p className="lead mb-4">Experience innovation. Shop the latest iPhones, MacBooks, and more.</p>
          <Link to="/" className="btn btn-danger me-3">Shop Now</Link>
          <Link to="/contact" className="btn btn-outline-success">Contact Us</Link>
        </div>
      </section>

      <Container className="pt-3 pb-4">
        {/* Featured Products */}
        <Row>
          <Col>
            <h2 className="mb-4 text-center featured-title">Featured Products</h2>
            <Carousel activeIndex={activeIndex} next={next} previous={previous}>
              {slides}
              <CarouselControl direction="prev" directionText="Previous" onClickHandler={previous} />
              <CarouselControl direction="next" directionText="Next" onClickHandler={next} />
              <CarouselIndicators items={slides} activeIndex={activeIndex} onClickHandler={(index) => goToIndex(index)} />
            </Carousel>
          </Col>
        </Row>

        {/* Testimonials */}
        <Row className="mt-5">
          <Col>
            <h2 className="mb-4 text-center">What Our Customers Say</h2>
            <div className="testimonial text-center">
              <FaQuoteLeft className="quote-icon" />
              <p className="lead">"The Apple Store experience was amazing. Super smooth checkout and authentic products!"</p>
              <h5>- Manikantha Asam</h5>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Product Modal */}
      <Modal isOpen={modal} toggle={toggleModal}>
        <ModalHeader toggle={toggleModal}>{selectedProduct?.name}</ModalHeader>
        <ModalBody>
          <Row>
            <Col md={6}>
              <img src={`${process.env.REACT_APP_API_URL}${selectedProduct?.image}`} alt="Product" className="img-fluid" />
            </Col>
            <Col md={6}>
              <h5>Description:</h5>
              <ul>
                {selectedProduct?.description.split('\n').map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
              <h5><FontAwesomeIcon icon={faIndianRupeeSign} /> {selectedProduct?.price}</h5>
              <Button color="success me-3" onClick={() => handleAddToCart(selectedProduct.id)}>Add to Cart</Button>
              <Button color="warning" onClick={() => handleBuyNow(selectedProduct.id)}>Buy Now</Button>
            </Col>
          </Row>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" onClick={toggleModal}>Close</Button>
        </ModalFooter>
      </Modal>

      {/* Footer */}
      <footer className="footer bg-dark py-4">
        <Container>
          <Row className="justify-content-center">
            <Col xs="auto" className="text-center text-white">
              <a href="https://www.facebook.com" className="btn btn-outline-light me-3 social-icon"><FaFacebook /></a>
              <a href="https://www.twitter.com" className="btn btn-outline-light me-3 social-icon"><FaTwitter /></a>
              <a href="https://www.instagram.com" className="btn btn-outline-light social-icon"><FaInstagram /></a>
            </Col>
          </Row>
          <Row className="justify-content-center mt-3">
            <Col xs="auto" className="text-center text-white">
              &copy; {new Date().getFullYear()} Apple Store. All rights reserved.
            </Col>
          </Row>
        </Container>
      </footer>
      <ToastContainer />
    </div>
  );
};

export default Home;