import { Server as SocketIOServer } from 'socket.io';
import { Server } from 'http';

let io: SocketIOServer;

export const initSocket = (server: Server) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        const allowedOrigins = [
          "http://localhost:5173", 
          "http://localhost:5174", 
          "http://localhost:5175", 
          "http://localhost:5176", 
          "http://13.232.211.142", 
          "http://13.232.211.142:3000", 
          "http://13.232.211.142:5173", 
          "http://13.232.211.142:9000"
        ];
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
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
