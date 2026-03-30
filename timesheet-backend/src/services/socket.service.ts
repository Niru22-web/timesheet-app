import { Server as SocketIOServer } from 'socket.io';
import { Server } from 'http';

let io: SocketIOServer;

export const initSocket = (server: Server) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [
        "http://localhost:5173", 
        "http://localhost:5174", 
        "http://13.232.211.142", 
        "http://13.232.211.142:5173"
      ],
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('🔗 Client connected to notification channel:', socket.id);

    // Join personal room
    socket.on('join_user_room', (userId: string) => {
      if (userId) {
        socket.join(userId);
        console.log(`👤 Authorized User ${userId} joined personal socket room.`);
      }
    });

    socket.on('disconnect', () => {
      console.log('🔴 Client disconnected from notification channel:', socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    console.warn('Socket.io has not been initialized yet.');
  }
  return io;
};
