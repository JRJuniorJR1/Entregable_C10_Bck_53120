import { promises as fs } from 'fs';
import { ProductManager } from './ProductManager.js';

export class CartManager {
    constructor(filename, productManager) {
        this.filename = filename;
        this.productManager = productManager;
        this.carts = [];
        this.cartIdCounter = 1;
        this.loadCarts();
    }

    async loadCarts() {
        try {
            const data = await fs.readFile(this.filename, 'utf8');
            this.carts = JSON.parse(data);
            if (this.carts.length > 0) {
                const maxId = Math.max(...this.carts.map(cart => cart.id));
                this.cartIdCounter = maxId + 1;
            }
        } catch (error) {
            if (error.code === 'ENOENT') {
                console.log('El archivo de carritos no existe. Creando uno nuevo.');
                await this.saveCarts();
            } else {
                throw error;
            }
        }
    }
    

    async saveCarts() {
        try {
            await fs.writeFile(this.filename, JSON.stringify(this.carts, null, 2));
        } catch (error) {
            throw error;
        }
    }

    async createCart() {
        try {
            const cart = { id: this.cartIdCounter++, products: [] };
            this.carts.push(cart);
            await this.saveCarts();
            return { cart, message: 'Carrito creado satisfactoriamente' };
        } catch (error) {
            throw new Error('Error al crear el carrito: ' + error.message);
        }
    }
    
    

    getCartById(cid) {
        const cart = this.carts.find(cart => cart.id === cid);
        if (!cart) {
            throw new Error('Carrito no encontrado');
        }
        return cart;
    }

    getAllCarts() {
        return this.carts;
    }

    async deleteCart(cid) {
        const index = this.carts.findIndex(cart => cart.id === cid);
        if (index === -1) {
            throw new Error('Carrito no encontrado');
        }
        this.carts.splice(index, 1);
        await this.saveCarts();
    }
    
    async addProductToCart(cid, pid, quantity) {
        const cart = this.getCartById(cid);
        const product = await productManager.getProductById(pid);
        
        if (!product) {
            throw new Error(`El producto con ID ${pid} no existe.`);
        }
        
        const productIndex = cart.products.findIndex(item => item.productId === pid);
        if (productIndex !== -1) {
            cart.products[productIndex].quantity += quantity;
        } else {
            const newQuantity = quantity;
            cart.products.push({ productId: pid, quantity: newQuantity });
        }
        await this.saveCarts();
    }   
    
    
}
