# Flais Granito - Backend Integration Guide

This backend has been completely refactored to support your existing React Admin Panel and Frontend Website. It follows the MVC architecture and provides professional, production-ready REST APIs.

## 1. Setup Instructions

1. **Install Dependencies**
   Navigate to the `backend` folder and run:
   ```bash
   npm install
   ```
   (We have already installed `cloudinary` and `multer-storage-cloudinary` for you).

2. **Environment Variables**
   Create a `.env` file in the `backend` root (if not already present):
   ```env
   PORT=8000
   MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
   JWT_SECRET=your_super_secret_jwt_key_123
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

3. **Start the Server**
   ```bash
   npm start
   # or for development:
   npx nodemon server.js
   ```

## 2. API Endpoints

### Authentication
- `POST /api/admin/login` - Admin login

### Dashboard
- `GET /api/dashboard/stats` - Get overall stats (Requires Auth)

### Products
- `GET /api/products` - Get all products (Public)
- `GET /api/products/:id` - Get single product by ID or Slug (Public)
- `POST /api/products` - Create product (Requires Auth, handles `images` array)
- `PUT /api/products/:id` - Update product (Requires Auth)
- `DELETE /api/products/:id` - Delete product (Requires Auth)

### Blogs
- `GET /api/blogs` - Get all blogs (Public)
- `GET /api/blogs/:id` - Get single blog by ID or Slug (Public)
- `POST /api/blogs` - Create blog (Requires Auth, handles `image` single)
- `PUT /api/blogs/:id` - Update blog (Requires Auth)
- `DELETE /api/blogs/:id` - Delete blog (Requires Auth)

### Categories
- `GET /api/categories` - Get all categories (Public)
- `POST /api/categories` - Create category (Requires Auth)
- `PUT /api/categories/:id` - Update category (Requires Auth)
- `DELETE /api/categories/:id` - Delete category (Requires Auth)

### Contact / Messages
- `POST /api/contact` - Submit a contact message (Public)
- `GET /api/contact` - Get all messages (Requires Auth)
- `PUT /api/contact/:id` - Mark message as read/unread (Requires Auth)
- `DELETE /api/contact/:id` - Delete message (Requires Auth)

---

## 3. Frontend Integration Examples (Axios)

First, set up a global Axios instance in your React apps (`src/api/axios.js`):

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
});

// Intercept requests to add the auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### A. Login API (Admin Panel)
```javascript
const handleLogin = async (email, password) => {
  try {
    const response = await api.post('/admin/login', { email, password });
    if (response.data.success) {
      localStorage.setItem('adminToken', response.data.token);
      // Redirect to Dashboard
    }
  } catch (error) {
    console.error("Login failed", error.response.data.message);
  }
};
```

### B. Add Product (Admin Panel)
```javascript
const handleAddProduct = async (formData) => {
  // formData should be a native FormData object since we are uploading files
  try {
    const response = await api.post('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    console.log("Product Added", response.data.product);
  } catch (error) {
    console.error("Failed to add product", error);
  }
};
```

### C. Fetch Products (Frontend Website & Admin)
```javascript
const fetchProducts = async () => {
  try {
    // Optional params: ?page=1&search=xyz&category=Marble
    const response = await api.get('/products');
    setProducts(response.data.products);
  } catch (error) {
    console.error("Error fetching products", error);
  }
};
```

### D. Delete Product (Admin Panel)
```javascript
const handleDeleteProduct = async (id) => {
  try {
    await api.delete(`/products/${id}`);
    // Refresh product list
  } catch (error) {
    console.error("Error deleting product", error);
  }
};
```

### E. Fetch Dashboard Stats (Admin Panel)
```javascript
const fetchStats = async () => {
  try {
    const response = await api.get('/dashboard/stats');
    setStats(response.data.stats);
    setRecentProducts(response.data.recentData.recentProducts);
  } catch (error) {
    console.error("Error fetching dashboard stats", error);
  }
};
```

### F. Submit Contact Form (Frontend Website)
```javascript
const submitContact = async (data) => {
  try {
    const response = await api.post('/contact', {
      name: data.name,
      email: data.email,
      phone: data.phone,
      message: data.message
    });
    alert("Message sent successfully!");
  } catch (error) {
    console.error("Error sending message", error);
  }
};
```

### G. Add Blog (Admin Panel)
```javascript
const handleAddBlog = async (blogFormData) => {
  try {
    const response = await api.post('/blogs', blogFormData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    console.log("Blog Added", response.data.blog);
  } catch (error) {
    console.error("Failed to add blog", error);
  }
};
```

## MongoDB Cloudinary & Env Setup
Make sure you create an account on [Cloudinary](https://cloudinary.com/) and copy your `cloud_name`, `api_key`, and `api_secret` into the `.env` file. Multer and Cloudinary are pre-configured in `backend/middleware/upload.js` to automatically upload images to a `flais_granito` folder in your Cloudinary account.
