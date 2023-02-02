export type CurrentUser = {
  id: string,
  username: string,
  email: string,
  hash: string,
}

type BrowserVersion = {
  id: number,
  name: string,
  version: number,
  hash: string,
}

declare module '*.png';
declare module '*.jpeg';
declare module '*.jpg';
declare module '*.gif';

// New declaration
declare module '*.svg';
