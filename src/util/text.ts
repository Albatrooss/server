export const capitalize = (text: string) =>
  text[0].toUpperCase() + text.slice(1);

export const clean = (text: string) => text.trim().toLowerCase();
