import express from 'express';
import path from 'path';
import { productManager } from '../ProductManager.js';
import fs from 'fs';

const router = express.Router();

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const checkUserAgent = (req, res, next) => {
  const userAgent = req.headers['user-agent'];
  req.isPostman = userAgent.includes('Postman');
  next();
};

router.get('/', checkUserAgent, (req, res) => {
  try {
    const products = productManager.getProducts();
    if (req.isPostman) {
      res.json(products);
    } else {
      res.render('pages/product', { title: 'Productos | 5PHNX', productData: products });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los productos' });
  }
});

router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const product = await productManager.getProductById(id);
    res.json(product);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  const product = req.body;
  const result = await productManager.addProduct(product);

  if (result.message) {
    req.app.get('io').emit('productoAgregado');
    res.status(201).json({ product: result.product, message: result.message });
  } else if (typeof result === 'string') {
    res.status(400).json({ error: result });
  } else {
    res.status(500).json({ error: 'Error al agregar el producto' });
  }
});

router.put('/:id', async (req, res) => {
  req.app.get('io').emit('productoModificado');
  const id = parseInt(req.params.id);
  try {
    const { product, message } = await productManager.updateProduct(id, req.body);
    res.json({ product, message });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  req.app.get('io').emit('productoEliminado');
  const id = parseInt(req.params.id);
  try {
    const product = await productManager.getProductById(id);
    await productManager.deleteProduct(id);
    res.json({ product, message: 'Producto eliminado satisfactoriamente' });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

export default router;
