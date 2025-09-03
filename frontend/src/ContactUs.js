import React, { useState } from 'react';
import { FaFacebook, FaTwitter, FaInstagram, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Container, Row, Col } from 'reactstrap';

function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Assuming a new backend endpoint for contact form submission
      const response = await axios.post('http://127.0.0.1:8000/api/contact/', formData);
      console.log('Contact form submission successful:', response.data);
      toast.success('Your message has been sent!', { position: "top-right" });
      setFormData({
        name: '',
        email: '',
        message: ''
      });
    } catch (error) {
      console.error('Error submitting contact form:', error);
      toast.error('Failed to send message. Please try again later.', { position: "top-right" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="d-flex flex-column" style={{ minHeight: "100vh" }}>
      <Container className="py-5">
        <h1 className="mb-4 text-center">Contact Us</h1>
        <Row>
          <Col md={6}>
            <div className="card mb-4">
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3 row">
                    <label htmlFor="name" className="col-sm-2 col-form-label">Name</label>
                    <div className="col-sm-10">
                      <input 
                        type="text" 
                        className="form-control" 
                        id="name" 
                        name="name"
                        placeholder="Your Name" 
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="mb-3 row">
                    <label htmlFor="email" className="col-sm-2 col-form-label">Email</label>
                    <div className="col-sm-10">
                      <input 
                        type="email" 
                        className="form-control" 
                        id="email" 
                        name="email"
                        placeholder="Your Email Address" 
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="mb-3 row">
                    <label htmlFor="message" className="col-sm-2 col-form-label">Message</label>
                    <div className="col-sm-10">
                      <textarea 
                        className="form-control" 
                        id="message" 
                        name="message"
                        rows="4" 
                        placeholder="Your Message Here"
                        value={formData.message}
                        onChange={handleChange}
                        required
                      ></textarea>
                    </div>
                  </div>
                  <div className="text-end">
                    <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </Col>
          <Col md={6}>
            <div className="card" style={{ minHeight: "50vh" }}>
              <div className="card-body">
                <h5 className="card-title">Contact Information</h5>
                <p className="card-text">
                  <FaMapMarkerAlt /> <strong>Address:</strong> <br /> 123 Apple St, Apple Country.
                </p>
                <p className="card-text">
                  <FaPhoneAlt /> <strong>Phone:</strong> <br /> (123) 456-7890
                </p>
                <p className="card-text">
                <FaEnvelope /> <strong>Sales Support:</strong> <br />
                 <a href="mailto:appleproductstore1@gmail.com">appleproductstore1@gmail.com</a>
                </p>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
      <footer className="footer bg-dark py-3 mt-auto">
        <Container>
          <Row className="justify-content-center">
            <Col xs="auto" className="text-center text-white">
              <a href="https://www.facebook.com" className="btn btn-outline-light me-3"><FaFacebook /></a>
              <a href="https://www.twitter.com" className="btn btn-outline-light me-3"><FaTwitter /></a>
              <a href="https://www.instagram.com" className="btn btn-outline-light"><FaInstagram /></a>
            </Col>
          </Row>
          <Row className="justify-content-center mt-2">
            <Col xs="auto" className="text-center text-white">
              &copy; 2024 Apple Store. All rights reserved.
            </Col>
          </Row>
        </Container>
      </footer>
      <ToastContainer />
    </div>
  )
}

export default ContactUs;
