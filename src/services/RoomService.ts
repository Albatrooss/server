import { Server, Socket } from 'socket.io';
import { Player, RoomAction } from 'types';
import { logger } from '../config';

class Room {
  io: Server;
  socket: Socket;
  store: any;
  username: string;
  roomId: string;

  constructor(io: Server, socket: Socket, roomId: string, username: string) {
    this.io = io;
    this.socket = socket;
    this.username = username;
    this.roomId = roomId;
    this.store = this.io.of('/').adapter;
  }

  async init(action: RoomAction) {
    const clients = await this.io.in(this.roomId).allSockets();
    if (!clients) logger.error('[INTERNAL ERROR] Room creation failed');

    if (action === 'join') {
      this.store = this.store.rooms.get(this.roomId);
      if (clients.size > 0) {
        await this.socket.join(this.roomId);
        this.store.players.push({
          id: this.socket.id,
          username: this.username,
          isReady: false,
        });
        // this.socket.username = this.username;
        this.socket.emit('roomSuccess');
        return true;
      }
      logger.warn(
        `[JOIN FAILED] Client denied join, as roomId ${this.roomId} not created`,
      );
      this.socket.emit('roomFail');
      return false;
    }

    if (action === 'create') {
      if (clients.size === 0) {
        await this.socket.join(this.roomId);
        this.store = this.store.rooms.get(this.roomId);
        // this.host = this.socket.id;
        this.store.players = [
          { id: this.socket.id, username: this.username, isReady: false },
        ];
        this.socket.emit('roomSuccess');
        return true;
      }
      logger.warn(
        `[CREATE FAILED] Client denied create, as roomId ${this.roomId} already present`,
      );
      this.socket.emit('roomFail');
      return false;
    }
    return false;
  }

  showPlayers() {
    const { players } = this.store;
    this.io.to(this.roomId).emit('showPlayers', { players });
  }

  onReady() {
    this.socket.on('ready', () => {
      for (const player of this.store.players) {
        if (player.id === this.socket.id) {
          player.isReady = !player.isReady;
          break;
        }
      }

      this.showPlayers();
    });
  }

  onDisconnect() {
    this.socket.on('disconnect', () => {
      try {
        this.store.players = this.store.players.filter(
          (player: Player) => player.id !== this.socket.id,
        );
        this.showPlayers();
      } catch (err) {
        logger.warn('[ERROR] Error disconnecting', err);
      }
      logger.info('Client Disconnected');
    });
  }
}

export default Room;
