import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import http from 'http';
import { Server } from 'socket.io';
import Room from '../services/RoomService';
import { InitRoomOptions } from '../../types';
import { logger } from '../config';
import { capitalize, clean } from '../util';

const app = (server: http.Server) => {
  const io = new Server(server, {
    cors: {
      origin: '*',
    },
  });
  try {
    const pubClient = new Redis(6379, 'localhost');
    const subClient = pubClient.duplicate();

    io.adapter(createAdapter(pubClient, subClient));
  } catch (err) {
    logger.warn(err);
  }

  io.on('connection', async socket => {
    logger.info(`Connection made: ${socket.id}`);
    socket.emit('connected');

    socket.on('pingRoom', async ({ roomId }) => {
      console.log('ping?')
      const roomExists = Boolean((await io.in(roomId).allSockets()).size);
      socket.emit('pongRoom', { roomExists });
    });

    socket.on(
      'initRoom',
      async ({ roomId, username, action }: InitRoomOptions) => {
        const room = new Room(io, socket, roomId, clean(username));
        const roomSuccess = await room.init(action);
        if (roomSuccess) {
          room.showPlayers();
          room.onReady();
          room.sendChat(`${capitalize(username)} joined the room!`);
          room.onSit();
          room.onStartGame();
          room.onChat();
        }

        room.onDisconnect();
      },
    );

    socket.on('test', () => {
      console.log(io.of('/').adapter.rooms.get('testing!'));
    });

    socket.on('error', err => console.warn('[ERROR]', err));
    socket.on('disconnect', () => {
      logger.warn('Socket closed with no room');
    });
  });
  io.on('error', (err: unknown) => console.warn('[ERROR]', err));
};

export default app;
