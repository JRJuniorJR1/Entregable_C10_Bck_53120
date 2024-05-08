import { ObjectId } from 'mongodb';

export class ChatManager {
  constructor(database) {
    this.collection = database.collection('messages');
  }

  async addMessage(user, message) {
    try {
      const result = await this.collection.insertOne({ user, message });
      if (result && result.insertedId) {
       
        return { message: 'Mensaje agregado satisfactoriamente', messageId: result.insertedId };
      } else {
        throw new Error('Resultado de inserción no válido');
      }
    } catch (error) {
      console.error('Error al agregar el mensaje:', error.message);
      throw new Error('Error al agregar el mensaje: ' + error.message);
    }
  }

  async getAllMessages() {
    try {
      const messages = await this.collection.find({}).toArray();
      return messages;
    } catch (error) {
      throw new Error('Error al obtener los mensajes: ' + error.message);
    }
  }

  async getMessageById(messageId) {
    try {
      const message = await this.collection.findOne({ _id: ObjectId(messageId) });
      return message;
    } catch (error) {
      throw new Error('Error al obtener el mensaje por ID: ' + error.message);
    }
  }

  async deleteMessage(messageId) {
    try {
      const result = await this.collection.deleteOne({ _id: ObjectId(messageId) });
      if (result.deletedCount === 1) {
        return { message: 'Mensaje eliminado satisfactoriamente' };
      } else {
        throw new Error('El mensaje no fue eliminado');
      }
    } catch (error) {
      console.error('Error al eliminar el mensaje:', error.message);
      throw new Error('Error al eliminar el mensaje: ' + error.message);
    }
  }

  async updateMessage(messageId, newMessage) {
    try {
      const result = await this.collection.updateOne(
        { _id: ObjectId(messageId) },
        { $set: { message: newMessage } }
      );
      if (result.modifiedCount === 1) {
        return { message: 'Mensaje actualizado satisfactoriamente' };
      } else {
        throw new Error('El mensaje no fue actualizado');
      }
    } catch (error) {
      console.error('Error al actualizar el mensaje:', error.message);
      throw new Error('Error al actualizar el mensaje: ' + error.message);
    }
  }
}