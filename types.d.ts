export type Card =
  '9s' |
  '10s' |
  'js' |
  'qs' |
  'ks' |
  'as' |
  '9d' |
  '10d' |
  'jd' |
  'qd' |
  'kd' |
  'ad' |
  '9h' |
  '10h' |
  'jh' |
  'qh' |
  'kh' |
  'ah' |
  '9c' |
  '10c' |
  'jc' |
  'qc' |
  'kc' |
  'ac' |
  'back';

export type Player = {
  id: string;
  username: string;
  isReady: boolean;
  seat: number;
  hand: Card[];
};

export type RoomAction = 'create' | 'join';

export type InitRoomOptions = {
  roomId: string;
  username: string;
  action: RoomAction;
};
