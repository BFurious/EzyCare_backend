import { Server } from 'http';
import app from "./app";
import config from './config';
import { Server as socketServer } from 'socket.io';
import { createClient } from "redis";
import { createAdapter } from "@socket.io/redis-adapter";

async function bootstrap() {
  // Store users and rooms
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
    console.log(' pubClient Connected to Redis successfully!', config.redis_url);
  });
  // Listen for any errors that occur
  pubClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
  });

  try {
    await Promise.all([
      pubClient.connect(),
      subClient.connect()
    ]);
    console.log('Redis clients connected successfully');

    const io = new socketServer(server, {
      adapter: createAdapter(pubClient, subClient, {
        requestsTimeout: 5000
      }) as any,
      pingTimeout: 10000,  // 30 seconds
      pingInterval: 10000, // 10 seconds
      cors: {
        origin: "*", // For testing purposes only
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type"],
        credentials: true,
      }
    });

    io.on('connection', (socket) => {
      console.log('User connected:', socket.id);
      socket.emit("message", { sender: socket.id, message: "hello sir, how may i help u?" });

      // Create a new room with a unique ID`

      socket.on('createRoom', (callback) => {
        const roomId = (Date.now().toString(36)).slice(-5); // Create unique room ID
        if (rooms[roomId]) {
          rooms[roomId].push(socket.id); // Store room details
        }
        rooms[roomId] = [socket.id];

        socket.join(roomId); // Host joins the room
        console.log(`Room created: ${roomId}`);
        callback({ roomId }); // Send the roomId to the client
      });

      // Allow a guest to join the room if they have the correct roomId
      socket.on('joinRoom', ({ roomId }, callback) => {
        const room = rooms[roomId];

        if (!room) {
          return callback({ error: 'Room not found' });
        }

        if (room.length >= 2) {
          return callback({ error: 'Room is full' });
        }

        socket.join(roomId); // Guest joins the room
        rooms[roomId].push(socket.id);

        //send status or meessage to single user
        callback({ success: true });

        //send message to the group members
        socket.to(roomId).emit("message", { notification: `${socket.id} joined room` })
        console.log(`User ${socket.id} joined room ${roomId}`);
      });

      // Handle messages within the room
      socket.on('message', ({ roomId, message }) => {
        if (roomId) {
          if (!rooms[roomId]?.includes(socket.id)) {
            socket.join(roomId);
            rooms[roomId].push(socket.id);
          }
          io.to(roomId).emit('message', { sender: socket.id, message: message });
        }
        else
          socket.emit("message", { sender: socket.id, message: "please create room first and share code with whom u want to connect,\n HAPPY CHATTING 😏😏" });

      });

      socket.on('leaveRoom', ({ roomId }, callback) => {
        if (rooms[roomId]) {
          rooms[roomId] = rooms[roomId]?.filter((socketId: string) => socketId !== socket.id);
          socket.leave(roomId);
          console.log(`Room left by: ${socket.id}`);
          if (rooms[roomId].length == 0) {
            delete rooms[roomId];
            console.log(`Room deleted as no one here: ${roomId}`);
          }
          socket.to(roomId).emit('message', { notification: `${socket.id} left room` });
          callback({ success: true });
        } else {
          callback({ message: "room doesnt exist" });
        }
      })

      socket.on("end-video-call", (data, callback) => {
        socket.to(data.roomId).emit('message', { notification: `${socket.id} left video call` });
        return callback({ success: true })
      })

      socket.on('offer', (data) => {
        socket.to(data.roomId).emit('offer', data.offer);
        socket.to(data.roomId).emit('message', { notification: `offer recieved from ${socket.id} and reverted` });
        console.log(`Offer received from sender in room ${data.roomId}`);
      });

      socket.on('answer', (data) => {
        socket.to(data.roomId).emit('answer', data.answer);
        socket.to(data.roomId).emit('message', { notification: `Answer recieved from ${socket.id} and reverted` });
        console.log(`Answer received from sender in room ${data.roomId}`);
      });

      socket.on('ice-candidate', (data) => {
        socket.to(data.roomId).emit('ice-candidate', data.candidate);
        socket.to(data.roomId).emit('message', { notification: `ice-candidate recieved from ${socket.id} and reverted` });
        console.log(`ice-candidate received from sender in room ${data.roomId}`);
      });

      // Handle user disconnecting
      socket.on('disconnect', (reason) => {
        const roomId = Object.keys(rooms).find((id) => {
          rooms[id].includes(socket.id);
        })
        if (roomId) {
          socket.to(roomId).emit('message', { sender: socket.id, notification: `${socket.id} Disconnected` });
          rooms[roomId] = rooms[roomId].filter((socketId: string) => socketId !== socket.id);
          console.log(`User disconnected itself: ${socket.id} reason:${reason}`);
          if (rooms[roomId].length == 0) {
            delete rooms[roomId];
            console.log(`Room deleted as no one here: ${roomId}`);
          }
        } else {
          io.emit('message', { sender: socket.id, notification: "u got disconnected" });
        }
      });
    });

  } catch (error: any) {
    console.error(error.message);
    // You can also perform any additional error handling or retry logic here
  }


  app.use((err: any, req: any, res: any, next: any) => {
    console.error(err.stack); // Log the error stack trace
    res.status(500).send({ error: err.message });
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