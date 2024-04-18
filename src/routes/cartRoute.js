import express from 'express';
import path from 'path';
import { CartManager } from '../CartManager.js';
import { ProductManager } from '../ProductManager.js';
import fs from 'fs';

const router = express.Router();
const productManager = new ProductManager('./src/items/products.json');

const cartManager = new CartManager('./src/items/carts.json', productManager);

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const checkUserAgent = (req, res, next) => {
  const userAgent = req.headers['user-agent'];
  req.isPostman = userAgent.includes('Postman');
  next();
};

router.get('/', checkUserAgent, (req, res) => {
  try {
    const carts = cartManager.getAllCarts();
    if (req.isPostman) {
      res.json(carts);
    } else {
      res.render('pages/cart', { title: 'Carritos | 5PHNX', cartData: carts });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los carritos' });
  }
});

router.get('/:cid', async (req, res) => {

  const cid = parseInt(req.params.cid);
  try {
    const cart = await cartManager.getCartById(cid);
    res.json(cart);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
    try {
        const result = await cartManager.createCart();
        req.app.get('io').emit('carritoAgregado', result);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



router.post('/:cid/product/:pid', async (req, res) => {
  const cid = parseInt(req.params.cid);
  const pid = parseInt(req.params.pid);
  const quantity = parseInt(req.body.quantity || 1);

  try {
    await cartManager.addProductToCart(cid, pid, quantity);
    req.app.get('io').emit('productoAgregadoEnCarrito');
    res.json({ message: 'Producto agregado al carrito satisfactoriamente' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:cid', async (req, res) => {
  const cid = parseInt(req.params.cid);
  try {
    await cartManager.deleteCart(cid);
    req.app.get('io').emit('carritoEliminado');
    res.json({ message: 'Carrito eliminado satisfactoriamente' });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

export default router;
