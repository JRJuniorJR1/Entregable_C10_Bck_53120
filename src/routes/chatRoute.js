import express from 'express';
import { ChatManager } from '../dao/ChatManager.js';
import { MongoClient } from 'mongodb';

const router = express.Router();

const uri = 'mongodb://localhost:27017/Ecommerce';
const client = new MongoClient(uri);

async function connectToMongoDB() {
    try {
        await client.connect();
        console.log('Conexión exitosa a MongoDB en ChatRoute');
    } catch (error) {
        console.error('Error al conectar a MongoDB en ChatRoute:', error);
    }
}

connectToMongoDB();

const database = client.db('Ecommerce');
const chatManager = new ChatManager(database);

router.post('/message', async (req, res) => {
    const { user, message } = req.body;
    try {
        const result = await chatManager.addMessage(user, message);
        req.app.get('io').emit('mensajeEnviado', result);
        res.status(201).json({ message: 'Mensaje agregado satisfactoriamente', data: result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.delete('/message/:id', async (req, res) => {
    const messageId = req.params.id;
    try {
        await chatManager.deleteMessage(messageId);
        res.status(200).json({ message: 'Mensaje eliminado satisfactoriamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/message/:id', async (req, res) => {
    const messageId = req.params.id;
    const { message } = req.body;
    try {
        await chatManager.updateMessage(messageId, message);
        res.status(200).json({ message: 'Mensaje actualizado satisfactoriamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/messages', async (req, res) => {
    try {
        const messages = await chatManager.getAllMessages();
        res.json(messages);
        req.app.get('io').emit('mensajeRecibido', messages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;