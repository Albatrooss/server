import { rmSync } from "fs";

const FULL_DECK = [
  '9s',
  '10s',
  'js',
  'qs',
  'ks',
  'as',
  '9d',
  '10d',
  'jd',
  'qd',
  'kd',
  'ad',
  '9h',
  '10h',
  'jh',
  'qh',
  'kh',
  'ah',
  '9c',
  '10c',
  'jc',
  'qc',
  'kc',
  'ac',
];

export const getFullDeck = () => shuffle(FULL_DECK);

const shuffle = (deck: string[]) => {
  let current = deck.length;
  while (current !== 0) {
    const random = Math.floor(Math.random() * current);
    current--;

    const temp = deck[current];
    deck[current] = deck[random];
    deck[random] = temp;
  }
  return deck;
};

export const firstAvailableSeat = (taken: Set<number>) => {
  let res = 0;
  console.log(taken);
  [0, 1, 2, 3].some(num => {
    console.log(num);
    console.log(taken.has(num));
    if (taken.has(num)) {
      return false;
    }rmSync
    res = Number(num);
    return true;
  });
  console.log('taking seat', res);
  return res;
};
