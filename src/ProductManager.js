import { promises as fs } from 'fs';

export class ProductManager {
    constructor(filename) {
        this.filename = filename;
        this.products = [];
        this.productIdCounter = 1;
        this.loadProducts();
    }

    async loadProducts() {
        try {
            const data = await fs.readFile(this.filename, 'utf8');
            this.products = JSON.parse(data);
            if (this.products.length > 0) {
                this.productIdCounter = Math.max(...this.products.map(p => p.id)) + 1;
            }
        } catch (error) {
            if (error.code === 'ENOENT') {
                console.log('El archivo de productos no existe. Creando uno nuevo.');
                await this.saveProducts();
            } else {
                console.error('Error al cargar productos:', error);
            }
        }
    }

    async saveProducts() {
        try {
            await fs.writeFile(this.filename, JSON.stringify(this.products, null, 2));
        } catch (error) {
            console.error('Error al guardar productos:', error);
        }
    }

    async addProduct(product) {
        if (!product.title || !product.description || !product.price || !product.thumbnail || !product.code || !product.stock) {
          return { error: "Todos los campos son obligatorios." };
        }
        const codeExists = this.products.some(p => p.code === product.code);
        if (codeExists) {
          return `Ya existe un producto con el código "${product.code}".`;
        }
        product.id = this.productIdCounter++;
        this.products.push(product);
        await this.saveProducts();
      
        return { message: 'Producto agregado satisfactoriamente', product };
      }
      
      getProducts() {
        return this.products;
      }
      
      async getProductById(id) {
        const product = this.products.find(p => parseInt(p.id) === parseInt(id));
        if (!product) {
          throw new Error("Producto no encontrado.");
        }
        return product;
      }

    async updateProduct(id, updatedFields) {
        const index = this.products.findIndex(p => p.id === id);
        if (index === -1) {
            throw new Error("Producto no encontrado.");
        }
    
        const { code } = updatedFields;
        if (code && this.products.some(p => p.code === code && p.id !== id)) {
            throw new Error(`Ya existe un producto con el código "${code}".`);
        }
    
        this.products[index] = { ...this.products[index], ...updatedFields };
        await this.saveProducts();
        return { product: this.products[index], message: "Producto actualizado con éxito." };
    }
    
    

    async deleteProduct(id) {
        const index = this.products.findIndex(p => p.id === id);
        if (index === -1) {
            throw new Error("Producto no encontrado.");
        }
        this.products.splice(index, 1);
        await this.saveProducts();
    }
}

export const productManager = new ProductManager('./src/items/products.json');