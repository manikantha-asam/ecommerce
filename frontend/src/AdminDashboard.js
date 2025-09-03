import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Container, Row, Col, Card, CardHeader, CardBody, Table, Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, Spinner, Alert
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faShippingFast, faUsers, faShoppingCart, faSearch } from '@fortawesome/free-solid-svg-icons';
import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import 'bootstrap/dist/css/bootstrap.min.css';
import { faRupeeSign } from "@fortawesome/free-solid-svg-icons";

const AdminDashboard = () => {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search and filter states
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const [orderFilterStatus, setOrderFilterStatus] = useState('');
  const [orderFilterDate, setOrderFilterDate] = useState('');

  const [productModal, setProductModal] = useState(false);
  const [productFormData, setProductFormData] = useState({
    id: null,
    name: '',
    description: '',
    image: null,
    price: '',
    category: ''
  });
  const [isEditingProduct, setIsEditingProduct] = useState(false);

  const [orderModal, setOrderModal] = useState(false);
  const [orderStatusData, setOrderStatusData] = useState({
    orderId: null,
    shipping_status: ''
  });

  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalRevenue: 0,
    totalOrders: 0
  });
  const [revenueByCategory, setRevenueByCategory] = useState([]);
  const [ordersByStatus, setOrdersByStatus] = useState([]);

  const toggleProductModal = () => {
    setProductModal(!productModal);
    if (!productModal) {
      setProductFormData({
        id: null,
        name: '',
        description: '',
        image: null,
        price: '',
        category: ''
      });
      setIsEditingProduct(false);
    }
  };

  const toggleOrderModal = () => {
    setOrderModal(!orderModal);
  };

  const fetchAllData = async (customerSearch, productSearch, orderSearch, orderStatus, orderDate) => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('Authentication token not found. Please log in as an admin.');
      setLoading(false);
      return;
    }

    try {
      const [customersRes, productsRes, ordersRes] = await Promise.all([
        axios.get(`http://127.0.0.1:8000/api/customers/?search=${customerSearch}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`http://127.0.0.1:8000/api/products/?search=${productSearch}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`http://127.0.0.1:8000/api/all-orders/?search=${orderSearch}&shipping_status=${orderStatus}&created_at=${orderDate}`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setCustomers(customersRes.data);
      setProducts(productsRes.data);
      setOrders(ordersRes.data);

      // Calculate statistics
      const totalCustomers = customersRes.data.length;
      const totalOrders = ordersRes.data.length;
      const totalRevenue = ordersRes.data.reduce((sum, order) => sum + parseFloat(order.total_amount), 0);

      setStats({
        totalCustomers,
        totalOrders,
        totalRevenue
      });

      // Prepare data for charts
      const revenueData = productsRes.data.reduce((acc, product) => {
        if (!acc[product.category]) {
          acc[product.category] = 0;
        }
        acc[product.category] += product.price;
        return acc;
      }, {});

      const formattedRevenueData = Object.keys(revenueData).map(key => ({
        name: key,
        revenue: revenueData[key]
      }));
      setRevenueByCategory(formattedRevenueData);
      
      const statusData = ordersRes.data.reduce((acc, order) => {
        if (!acc[order.shipping_status]) {
          acc[order.shipping_status] = 0;
        }
        acc[order.shipping_status] += 1;
        return acc;
      }, {});

      const formattedStatusData = Object.keys(statusData).map(key => ({
        name: key,
        value: statusData[key]
      }));
      setOrdersByStatus(formattedStatusData);

    } catch (err) {
      console.error('Error fetching admin data:', err);
      setError('Failed to fetch data. Please check console for details.');
    } finally {
      setLoading(false);
    }
  };

  // Debounce function to delay API calls
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
  };

  // Debounced version of fetchAllData
  const debouncedFetchData = useCallback(debounce(fetchAllData, 500), []);

  useEffect(() => {
    debouncedFetchData(customerSearchTerm, productSearchTerm, orderSearchTerm, orderFilterStatus, orderFilterDate);
  }, [customerSearchTerm, productSearchTerm, orderSearchTerm, orderFilterStatus, orderFilterDate, debouncedFetchData]);

  const handleProductFormChange = (e) => {
    const { name, value, files } = e.target;
    setProductFormData({
      ...productFormData,
      [name]: files ? files[0] : value
    });
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');
    const formData = new FormData();
    Object.entries(productFormData).forEach(([key, value]) => {
      if (value !== null && value !== '') {
        formData.append(key, value);
      }
    });

    try {
      if (isEditingProduct) {
        await axios.patch(`http://127.0.0.1:8000/api/products/${productFormData.id}/`, formData, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.post('http://127.0.0.1:8000/api/products/', formData, { headers: { Authorization: `Bearer ${token}` } });
      }
      toggleProductModal();
      fetchAllData(customerSearchTerm, productSearchTerm, orderSearchTerm, orderFilterStatus, orderFilterDate);
    } catch (err) {
      console.error('Error saving product:', err);
      setError('Failed to save product.');
    }
  };

  const handleEditProduct = (product) => {
    setProductFormData({
      id: product.id,
      name: product.name,
      description: product.description,
      image: null,
      price: product.price,
      category: product.category
    });
    setIsEditingProduct(true);
    toggleProductModal();
  };

  const handleDeleteProduct = async (productId) => {
    const token = localStorage.getItem('access_token');
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/products/${productId}/`, { headers: { Authorization: `Bearer ${token}` } });
        fetchAllData(customerSearchTerm, productSearchTerm, orderSearchTerm, orderFilterStatus, orderFilterDate);
      } catch (err) {
        console.error('Error deleting product:', err);
        setError('Failed to delete product.');
      }
    }
  };

  const handleUpdateOrderStatus = (order) => {
    setOrderStatusData({
      orderId: order.id,
      shipping_status: order.shipping_status
    });
    toggleOrderModal();
  };

  const handleOrderStatusSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');
    try {
      await axios.put(`http://127.0.0.1:8000/api/order/${orderStatusData.orderId}/`, {
        shipping_status: orderStatusData.shipping_status
      }, { headers: { Authorization: `Bearer ${token}` } });
      toggleOrderModal();
      fetchAllData(customerSearchTerm, productSearchTerm, orderSearchTerm, orderFilterStatus, orderFilterDate);
    } catch (err) {
      console.error('Error updating order status:', err);
      setError('Failed to update order status.');
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  if (loading) {
    return <div className="container text-center mt-5"><Spinner color="primary" /><h2>Loading Admin Dashboard...</h2></div>;
  }

  if (error) {
    return <div className="container text-center mt-5"><Alert color="danger">{error}</Alert></div>;
  }

  return (
    <div className="d-flex flex-column min-vh-100">
      <Container className="py-5">
        <h1 className="mb-4">Admin Dashboard</h1>

        {/* Key Metrics */}
        <Row className="mb-5">
          <Col md={4}>
            <Card className="text-center bg-primary text-white">
              <CardHeader>Total Customers</CardHeader>
              <CardBody>
                <FontAwesomeIcon icon={faUsers} size="2x" className="mb-2" />
                <h2>{stats.totalCustomers}</h2>
              </CardBody>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="text-center bg-success text-white">
              <CardHeader>Total Revenue</CardHeader>
              <CardBody>
                <FontAwesomeIcon icon={faRupeeSign} size="2x" className="mb-2" />
                <h2>₹{stats.totalRevenue.toFixed(2)}</h2>
              </CardBody>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="text-center bg-info text-white">
              <CardHeader>Total Orders</CardHeader>
              <CardBody>
                <FontAwesomeIcon icon={faShoppingCart} size="2x" className="mb-2" />
                <h2>{stats.totalOrders}</h2>
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* Charts Section */}
        <Row className="mb-5">
          <Col md={6}>
            <Card className="shadow">
              <CardHeader className="bg-dark text-white text-center">Revenue by Category</CardHeader>
              <CardBody>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueByCategory} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="revenue" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="shadow">
              <CardHeader className="bg-dark text-white text-center">Orders by Status</CardHeader>
              <CardBody>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={ordersByStatus}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      label
                    >
                      {ordersByStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* Customers Section */}
        <Card className="mb-5 shadow">
          <CardHeader className="bg-dark text-white d-flex justify-content-between align-items-center">
            <h5>Customers</h5>
            <div className="input-group w-50">
                <Input
                    type="text"
                    placeholder="Search customers..."
                    value={customerSearchTerm}
                    onChange={(e) => setCustomerSearchTerm(e.target.value)}
                />
                <Button color="secondary">
                    <FontAwesomeIcon icon={faSearch} />
                </Button>
            </div>
          </CardHeader>
          <CardBody>
            <Table responsive bordered hover>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>City, State</th>
                  <th>Last Login</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(customer => (
                  <tr key={customer.username}>
                    <td>{customer.username}</td>
                    <td>{customer.customer_name}</td>
                    <td>{customer.email}</td>
                    <td>{customer.phone_number}</td>
                    <td>{customer.city}, {customer.state}</td>
                    <td>{customer.last_login ? new Date(customer.last_login).toLocaleString() : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </CardBody>
        </Card>

        {/* Products Section */}
        <Card className="mb-5 shadow">
          <CardHeader className="bg-dark text-white d-flex justify-content-between align-items-center">
            <h5>Products</h5>
            <div className="input-group w-50">
                <Input
                    type="text"
                    placeholder="Search products..."
                    value={productSearchTerm}
                    onChange={(e) => setProductSearchTerm(e.target.value)}
                />
                <Button color="secondary">
                    <FontAwesomeIcon icon={faSearch} />
                </Button>
                <Button color="success" onClick={toggleProductModal}>
                    <FontAwesomeIcon icon={faPlus} /> Add Product
                </Button>
            </div>
          </CardHeader>
          <CardBody>
            <Table responsive bordered hover>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Category</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id}>
                    <td>{product.id}</td>
                    <td>₹{product.price}</td>
                    <td>{product.category}</td>
                    <td>
                      <Button color="info" size="sm" className="me-2" onClick={() => handleEditProduct(product)}>
                        <FontAwesomeIcon icon={faEdit} /> Edit
                      </Button>
                      <Button color="danger" size="sm" onClick={() => handleDeleteProduct(product.id)}>
                        <FontAwesomeIcon icon={faTrash} /> Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </CardBody>
        </Card>

        {/* Orders Section */}
        <Card className="mb-5 shadow">
          <CardHeader className="bg-dark text-white d-flex justify-content-between align-items-center">
            <h5>Orders</h5>
            <div className="d-flex align-items-center">
              <div className="input-group me-2">
                <Input
                    type="text"
                    placeholder="Search orders..."
                    value={orderSearchTerm}
                    onChange={(e) => setOrderSearchTerm(e.target.value)}
                />
                <Button color="secondary">
                    <FontAwesomeIcon icon={faSearch} />
                </Button>
              </div>
              <Input
                type="select"
                className="me-2"
                value={orderFilterStatus}
                onChange={(e) => setOrderFilterStatus(e.target.value)}
              >
                <option value="">Filter by Status</option>
                <option value="pending">Pending</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </Input>
              <Input
                type="date"
                value={orderFilterDate}
                onChange={(e) => setOrderFilterDate(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardBody>
            <Table responsive bordered hover>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.user}</td>
                    <td>₹{order.total_amount}</td>
                    <td>{order.shipping_status}</td>
                    <td>
                      <Button color="warning" size="sm" onClick={() => handleUpdateOrderStatus(order)}>
                        <FontAwesomeIcon icon={faShippingFast} /> Update Status
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </CardBody>
        </Card>
      </Container>

      {/* Product Modal */}
      <Modal isOpen={productModal} toggle={toggleProductModal}>
        <ModalHeader toggle={toggleProductModal}>{isEditingProduct ? 'Edit Product' : 'Add New Product'}</ModalHeader>
        <Form onSubmit={handleProductSubmit}>
          <ModalBody>
            <FormGroup>
              <Label for="name">Product Name</Label>
              <Input type="text" name="name" id="name" value={productFormData.name} onChange={handleProductFormChange} required />
            </FormGroup>
            <FormGroup>
              <Label for="description">Description</Label>
              <Input type="textarea" name="description" id="description" value={productFormData.description} onChange={handleProductFormChange} />
            </FormGroup>
            <FormGroup>
              <Label for="price">Price</Label>
              <Input type="number" name="price" id="price" value={productFormData.price} onChange={handleProductFormChange} required />
            </FormGroup>
            <FormGroup>
              <Label for="category">Category</Label>
              <Input type="select" name="category" id="category" value={productFormData.category} onChange={handleProductFormChange} required>
                <option value="">Select Category</option>
                <option value="macbook">MacBook</option>
                <option value="iphone">iPhone</option>
                <option value="ipad">iPad</option>
                <option value="watch">Watch</option>
                <option value="airpods">AirPods</option>
                <option value="tvandhome">TvAndHome</option>
                <option value="others">Others</option>
              </Input>
            </FormGroup>
            <FormGroup>
              <Label for="image">Product Image</Label>
              <Input type="file" name="image" id="image" onChange={handleProductFormChange} />
            </FormGroup>
          </ModalBody>
          <ModalFooter>
            <Button color="success" type="submit">Save</Button>
            <Button color="secondary" onClick={toggleProductModal}>Cancel</Button>
          </ModalFooter>
        </Form>
      </Modal>

      {/* Order Status Modal */}
      <Modal isOpen={orderModal} toggle={toggleOrderModal}>
        <ModalHeader toggle={toggleOrderModal}>Update Order Status</ModalHeader>
        <Form onSubmit={handleOrderStatusSubmit}>
          <ModalBody>
            <FormGroup>
              <Label for="shipping_status">Shipping Status</Label>
              <Input
                type="select"
                name="shipping_status"
                id="shipping_status"
                value={orderStatusData.shipping_status}
                onChange={(e) => setOrderStatusData({ ...orderStatusData, shipping_status: e.target.value })}
              >
                <option value="pending">Pending</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </Input>
            </FormGroup>
          </ModalBody>
          <ModalFooter>
            <Button color="success" type="submit">Update</Button>
            <Button color="secondary" onClick={toggleOrderModal}>Cancel</Button>
          </ModalFooter>
        </Form>
      </Modal>

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
    </div>
  );
};

export default AdminDashboard;