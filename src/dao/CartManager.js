import { MongoClient, ObjectId } from 'mongodb';

export class CartManager {
  constructor(database, productManager) {
    this.collection = database.collection('carritos');
    this.productManager = productManager;
  }

  async getAllCarts() {
    try {
      const carts = await this.collection.find({}).toArray();
      return carts;
    } catch (error) {
      throw new Error('Error al obtener los carritos: ' + error.message);
    }
  }

  async createCart() {
    try {
      const result = await this.collection.insertOne({ products: [] });
      if (result.insertedId) {
        return { message: 'Carrito creado satisfactoriamente', cart: result.insertedId };
      } else {
        throw new Error('Error al crear el carrito.');
      }
    } catch (error) {
      throw new Error('Error al crear el carrito: ' + error.message);
    }
  }

  async updateProduct(cid, pid, updatedFields) {
    try {
        const result = await this.collection.updateOne(
            { _id: new ObjectId(cid), "products.productId": new ObjectId(pid) },
            { $set: { "products.$[element].quantity": updatedFields.quantity } },
            { arrayFilters: [{ "element.productId": new ObjectId(pid) }] }
        );

        if (result.modifiedCount === 0) {
            throw new Error("Producto no encontrado.");
        }
        const cart = await this.collection.findOne({ _id: new ObjectId(cid) });
        const updatedProduct = cart.products.find(p => p.productId.toString() === pid);

        return {
            message: "Producto actualizado con éxito.",
            updatedProduct
        };
    } catch (error) {
        throw new Error('Error al actualizar el producto: ' + error.message);
    }
}

  async getCartById(id) {
    try {
      const cart = await this.collection.findOne({ _id: new ObjectId(id) });
      if (!cart) {
        throw new Error("Carrito no encontrado.");
      }
      return cart;
    } catch (error) {
      throw new Error('Error al obtener el carrito: ' + error.message);
    }
  }
  
  async addProductToCart(cid, pid, productDetails) {
    try {
        const { title, thumbnail, price, quantity } = productDetails; 
        const product = await this.productManager.getProductById(pid);
        if (!product) {
            throw new Error(`El producto con ID ${pid} no existe.`);
        }
        const cart = await this.collection.findOne({ _id: new ObjectId(cid) });
        if (!cart) {
            throw new Error("Carrito no encontrado.");
        }
        const productIndex = cart.products.findIndex(p => p.productId.toString() === pid);
        if (productIndex !== -1) {
            const updatedProduct = {
                ...cart.products[productIndex],
                quantity: parseInt(cart.products[productIndex].quantity) + parseInt(quantity)
            };

            await this.collection.updateOne(
                { _id: new ObjectId(cid), "products.productId": new ObjectId(pid) },
                { $set: { "products.$[element]": updatedProduct } },
                { arrayFilters: [{ "element.productId": new ObjectId(pid) }] }
            );
        } else {
            await this.collection.updateOne(
                { _id: new ObjectId(cid) },
                { $push: { products: { productId: new ObjectId(pid), title, thumbnail, price, quantity } } } 
            );
        }

        return { message: 'Producto agregado al carrito satisfactoriamente' };
    } catch (error) {
        throw new Error('Error al agregar el producto al carrito: ' + error.message);
    }
}
  async deleteCart(cid) {
    try {
      const result = await this.collection.deleteOne({ _id: new ObjectId(cid) });
      if (result.deletedCount === 0) {
        throw new Error("Carrito no encontrado.");
      }
      return { message: 'Carrito eliminado satisfactoriamente' };
    } catch (error) {
      throw new Error('Error al eliminar el carrito: ' + error.message);
    }
  }

  async deleteProductFromCart(cid, pid) {
    try {
        const result = await this.collection.updateOne(
            { _id: new ObjectId(cid) },
            { $pull: { products: { productId: new ObjectId(pid) } } }
        );
        if (result.modifiedCount === 0) {
            throw new Error("Producto no encontrado en el carrito.");
        }
        return { message: "Producto eliminado del carrito con éxito." };
    } catch (error) {
        throw new Error('Error al eliminar el producto del carrito: ' + error.message);
    }
}

}

