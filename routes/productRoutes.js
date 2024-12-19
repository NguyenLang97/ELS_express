const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const {
  indexProduct,
  searchProducts,
  deleteProduct,
  getAllProducts,
  updateProduct,
} = require('../services/elasticService');

// Tạo sản phẩm mới và index lên Elasticsearch
router.post('/', async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    await indexProduct(product);
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Tìm kiếm sản phẩm từ Elasticsearch
router.get('/search', async (req, res) => {
  try {
    const results = await searchProducts(req.query);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Lấy tất cả sản phẩm từ MongoDB
router.get('/', async (req, res) => {
  try {
    // const products = await Product.find();
    const products = await getAllProducts();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update product
router.put('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.name = req.body.name || product.name;
    product.price = req.body.price || product.price;
    product.description = req.body.description || product.description;
    product.category = req.body.category || product.category;

    const updatedProduct = await product.save();
    await updateProduct(req.params.id, updatedProduct);
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get sp từ mongodb by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Xóa sản phẩm
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Product.findByIdAndDelete(id);
    await deleteProduct(id);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
