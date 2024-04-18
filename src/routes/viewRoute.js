import express from 'express';
import fs from 'fs';
import path from 'path';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const router = express.Router();

router.get('/', (req, res) => {
  const pageTitle = 'Inicio';
  res.render('pages/index', { title: 'Bienvenidos | 5PHNX' });
});

router.get('/products', (req, res) => {
  try {
    const products = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../items/products.json'), 'utf8'));
    res.render('pages/product', { title: 'Productos | 5PHNX', productData: products });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los productos' });
  }
});

router.get('/carts', (req, res) => {
  try {
    const cartData = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../items/carts.json'), 'utf8'));
    res.render('pages/cart', { title: 'Carrito De Compra | 5PHNX', carts: cartData });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los productos' });
  }
});


router.get('/realtimeproducts', (req, res) => {
  try {
    const products = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../items/products.json'), 'utf8'));
    const cartData = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../items/carts.json'), 'utf8'));
    res.render('pages/vertodo', { title: 'Ver Todo | 5PHNX', productData: products, carts: cartData });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los productos' });
  }
});

export default router;
