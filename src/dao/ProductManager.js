import { MongoClient, ObjectId } from 'mongodb';

export class ProductManager {
  constructor(database) {
    this.collection = database.collection('productos');
  }

  async addProduct(product) {
    try {
      const existingProduct = await this.collection.findOne({ code: product.code });
      if (existingProduct) {
        throw new Error(`El código ${product.code} ya existe en la base de datos.`);
      }
      const result = await this.collection.insertOne(product);
      if (result && result.insertedId) {
        return { message: 'Producto agregado satisfactoriamente', product: result.insertedId };
      } else {
        throw new Error('Resultado de inserción no válido');
      }
    } catch (error) {
      console.error('Error al agregar el producto:', error.message);
      throw new Error('Error al agregar el producto: ' + error.message);
    }
  }

  async getAllProducts() {
    try {
      const products = await this.collection.find({}).toArray();
      return products;
    } catch (error) {
      throw new Error('Error al obtener los productos: ' + error.message);
    }
  }

  async getProductById(id) {
    try {
      const product = await this.collection.findOne({ _id: new ObjectId(id) });
      if (!product) {
        throw new Error("Producto no encontrado.");
      }
      return product;
    } catch (error) {
      throw new Error('Error al obtener el producto: ' + error.message);
    }
  }

  async updateProduct(id, updatedFields) {
    try {
      const result = await this.collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedFields }
      );
      if (result.modifiedCount === 0) {
        throw new Error("Producto no encontrado.");
      }
      return { message: "Producto actualizado con éxito." };
    } catch (error) {
      throw new Error('Error al actualizar el producto: ' + error.message);
    }
  }

  async deleteProduct(id) {
    try {
      const result = await this.collection.deleteOne({ _id: new ObjectId(id) });
      if (result.deletedCount === 0) {
        throw new Error("Producto no encontrado.");
      }
      return { message: "Producto eliminado satisfactoriamente" };
    } catch (error) {
      throw new Error('Error al eliminar el producto: ' + error.message);
    }
  }
}