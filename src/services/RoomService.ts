import { Server, Socket } from 'socket.io';
import { capitalize, firstAvailableSeat, getFullDeck } from '../util';
import { ChatData, Player, RoomAction } from 'types';
import { logger } from '../config';
import { stringify } from 'querystring';

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
        if (Object.keys(this.store.players).length >= 4) {
          logger.warn(
            `[JOIN FAILED] Client denied join, as roomId ${this.roomId} is full`,
            );
            this.socket.emit('roomFail', {msg: `Room ${capitalize(this.roomId)} is full.`});
          return;
        }
        await this.socket.join(this.roomId);
        this.store.players[this.socket.id] = {
          id: this.socket.id,
          username: this.username, 
          isReady: false,
          seat: firstAvailableSeat(new Set(Object.values(this.store.players).map((p: any) => p.seat))),
          hand: [],
        };
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
        this.store.players= {
          [this.socket.id]: { id: this.socket.id, username: this.username, isReady: false, seat: 0, hand: [] },
        };
        this.store.gameData = {
          host: this.socket.id,
          red: 3,
          blue: 4,
          dealer: 0,
          gameOn: false,
          turn: 1
        }
        this.store.chat = [];
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
    const { players, gameData } = this.store;
    this.io.to(this.roomId).emit('showPlayers', { players, gameData });
  }

  onReady() {
    this.socket.on('ready', () => {
      this.store.players[this.socket.id].isReady = true;

      this.showPlayers();
    });
  }

  onStartGame() {
    this.socket.on('startGame', () => {
      this.io.to(this.roomId).emit('startGame', {deck: getFullDeck()})
    })
  }

  onSit() {
    this.socket.on('sit', ({seat}) => {
      console.log('SITTING', seat)
      this.store.players[this.socket.id].seat = seat;
      this.showPlayers();
    })
  }

  onChat() {
    this.socket.on('sendChat', (chatData: ChatData) => {
      this.store.chat.unshift(chatData);
      this.sendChat();
    });
  }

  sendChat(adminMsg?: string) {
    if (adminMsg) this.store.chat.unshift({ username: '-', text: adminMsg });
    this.io.to(this.roomId).emit('sendChat', { chatData: this.store.chat });
  }

  onDisconnect() {
    this.socket.on('disconnect', () => {
      try {
        delete this.store.players[this.socket.id]
        if (this.socket.id === this.store.gameData.host)
          this.store.gameData.host = Object.values(this.store.players as any[])[0].id
        this.showPlayers();
        this.sendChat(`${capitalize(this.username)} left the room :(`);
      } catch (err) {
        logger.warn('[ERROR] Error disconnecting', err);
      }
      logger.info('Client Disconnected');
    });
  }
}

export default Room;
