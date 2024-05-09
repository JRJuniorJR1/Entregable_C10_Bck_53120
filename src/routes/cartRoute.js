import express from 'express';
import { CartManager } from '../dao/CartManager.js';
import { ProductManager } from '../dao/ProductManager.js';
import { MongoClient, ObjectId } from 'mongodb';

const router = express.Router();

const uri = 'mongodb://localhost:27017/Ecommerce';
const client = new MongoClient(uri);

async function connectToMongoDB() {
    try {
        await client.connect();
        console.log('Conexión exitosa a MongoDB CartRoute');
    } catch (error) {
        console.error('Error al conectar a MongoDB CartRoute:', error);
    }
}

connectToMongoDB();

const database = client.db('Ecommerce');
const productManager = new ProductManager(database);
const cartManager = new CartManager(database, productManager);

router.get('/', async (req, res) => {
    try {
        const carts = await cartManager.getAllCarts();
        res.json(carts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:cid', async (req, res) => {
    const cid = req.params.cid;
    try {
        const cart = await cartManager.getCartById(cid);
        const populatedCart = await cartManager.populateCart(cart);
        res.json(populatedCart);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const result = await cartManager.createCart();
        res.status(201).json(result);
        req.app.get('io').emit('carritoAgregado', result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/:cid/product/:pid', async (req, res) => {
    const cid = req.params.cid;
    const pid = req.params.pid;
    const { title, thumbnail, price, quantity } = req.body;
    try {
        const result = await cartManager.addProductToCart(cid, pid, { title, thumbnail, price, quantity });
        req.app.get('io').emit('productoAgregadoEnCarrito');
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.put('/:cid/products/:pid', async (req, res) => {
    try {
        req.app.get('io').emit('carritoActualizado');
        const cid = req.params.cid;
        const pid = req.params.pid;
        const updatedQuantity = req.body.quantity;

        const cart = await cartManager.getCartById(cid);
        if (!cart) {
            return res.status(404).json({ message: 'Carrito no encontrado' });
        }

        const updatedFields = { quantity: updatedQuantity };
        const result = await cartManager.updateProduct(cid, pid, updatedFields);

        res.json(result);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Error al actualizar la cantidad de producto' });
    }
});

router.delete('/:cid/products/:pid', async (req, res) => {
    const cid = req.params.cid;
    const pid = req.params.pid;
    try {
        const result = await cartManager.deleteProductFromCart(cid, pid);
        req.app.get('io').emit('productoEliminadoDelCarrito');
        res.json(result);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

router.delete('/:cid', async (req, res) => {
    const cid = req.params.cid;
    try {
        const result = await cartManager.deleteCart(cid);
        req.app.get('io').emit('carritoEliminado');
        res.json(result);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

export default router;
