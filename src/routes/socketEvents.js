import { Server } from 'socket.io';
import { server } from '../server.js';

export const initializeSocketEvents = () => {
  
  const io = new Server(server);

  io.on('connection', (socket) => {
    socket.on('pageConnected', (pageTitle) => {
      console.log(`Cliente conectado desde la página: ${pageTitle}`);
    });

    socket.on('pageDisconnected', (pageTitle) => {
      console.log(`Cliente desconectado desde la página: ${pageTitle}`);
    });
  });

  return io;
};
