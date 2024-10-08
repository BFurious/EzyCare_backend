import { Server } from 'http';
import app from "./app";
import config from './config';
import { Server as socketServer } from 'socket.io';
import { createClient } from "redis";
import { createAdapter } from "@socket.io/redis-adapter";

async function bootstrap() {
  // Store users and rooms
  let users: { [userId: string]: string } = {}; // Example: { userId: socketId }
  let rooms: { [key: string]: any } = {};
  const server: Server = app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
  });
  // to do :bufferutil: Allows to efficiently perform operations such as masking and unmasking the data payload of the WebSocket frames.
  // utf-8-validate: Allows to efficiently check if a message contains valid UTF-8 as required by the spec.
  const pubClient = createClient({ url: config.redis_url });
  const subClient = pubClient.duplicate();
  // Listen for the 'connect' event
  pubClient.on('connect', () => {
    console.log(' pubClient Connected to Redis successfully!',  config.redis_url);
  });
  // Listen for any errors that occur
  pubClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
  });

  await Promise.all([
    pubClient.connect(),
    subClient.connect()
  ]);
  
  const io = new socketServer(server, {
    adapter: createAdapter(pubClient, subClient) as any,
    pingTimeout: 60000,
    cors: {
      origin: "http://localhost:3000",
    }
  });
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    socket.emit("message", "hello sir, how may i help u?");
    // Create a new room with a unique ID
    socket.on('createRoom', (data, callback) => {
      const roomId = (Date.now().toString(36)).slice(-5); // Create unique room ID
      rooms[roomId] = { host: socket.id, guest: null }; // Store room details

      socket.join(roomId); // Host joins the room
      callback({ roomId }); // Send the roomId to the client

      console.log(`Room created: ${roomId}`);
    });

    // Allow a guest to join the room if they have the correct roomId
    socket.on('joinRoom', ({ roomId}, callback) => {
      const room = rooms[roomId];

      if (!room) {
        return callback({ error: 'Room not found' });
      }

      if (room.guest !== null) {
        return callback({ error: 'Room is full' });
      }

      if (socket.id != room.host) {
        room.guest = socket.id; // Assign guest to the room
        socket.join(roomId); // Guest joins the room
        callback({ success: true });

        console.log(`User ${socket.id} joined room ${roomId}`);
      } else {
        callback({ error: 'Not authorized to join the room' });
      }
    });

    // Handle messages within the room
    socket.on('message', ({ roomId, message }) => {
      io.to(roomId).emit('message', { sender: socket.id, message });
    });

    // Handle user disconnecting
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
      // Remove user from rooms, handle cleanup, etc.
      Object.keys(rooms).forEach((roomId) => {
        const room = rooms[roomId];
        if (room.host === socket.id || room.guest === socket.id) {
          io.to(roomId).emit('message', { message: 'User disconnected' });
          delete rooms[roomId]; // Delete room when any participant leaves
          console.log(`Room ${roomId} deleted`);
        }
      });
    });
  });

  const exitHandler = () => {
    if (server) {
      server.close(() => {
        console.log('Server Close')
      })
    }
  };

  const unexpectedHandler = () => {
    console.log('Handler Error');
    exitHandler();
  }
  process.on('uncaughtException', unexpectedHandler);
  process.on('unhandledRejection', unexpectedHandler);

  process.on('SIGTERM', () => {
    console.log('Sigterm Recieved');
    if (server) {
      server.close();
    }
  })
}

bootstrap();