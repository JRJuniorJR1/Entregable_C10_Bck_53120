import express from 'express';
import { MongoClient } from 'mongodb';

const router = express.Router();

const uri = 'mongodb://localhost:27017/Ecommerce';
const client = new MongoClient(uri);

async function connectToMongoDB() {
    try {
        await client.connect();
        console.log('Conexión exitosa a MongoDB ViewRoute');
    } catch (error) {
        console.error('Error al conectar a MongoDB ViewRoute:', error);
    }
}

connectToMongoDB();

const database = client.db('Ecommerce');
const productsCollection = database.collection('productos');
const cartsCollection = database.collection('carritos');

router.get('/', (req, res) => {
    const pageTitle = 'Inicio';
    res.render('pages/index', { title: 'Bienvenidos | 5PHNX' });
});

router.get('/products', async (req, res) => {
    try {
        const products = await productsCollection.find({}).toArray();
        res.render('pages/product', { title: 'Productos | 5PHNX', products });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los productos' });
    }
});

router.get('/carts', async (req, res) => {
    try {
        const cartData = await cartsCollection.find({}).toArray();
        res.render('pages/cart', { title: 'Carrito De Compra | 5PHNX', carts: cartData });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los carritos' });
    }
});

router.get('/realtimeproducts', async (req, res) => {
    try {
        const products = await productsCollection.find({}).toArray();
        const cartData = await cartsCollection.find({}).toArray();
        res.render('pages/vertodo', { title: 'Ver Todo | 5PHNX', productData: products, carts: cartData });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los productos' });
    }
});

router.get('/chat', (req, res) => {
    res.render('pages/messages', { title: 'Chat en línea | 5PHNX' });
});

export default router;
