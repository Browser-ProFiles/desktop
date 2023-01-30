import Rijndael from 'rijndael-js';

export const decodeHash = (hash: string, userKey: string) => {
  const cipher = new Rijndael(userKey, 'cbc');
  const ciphertext = Buffer.from(
    cipher.decrypt(Buffer.from(hash, 'base64'), '256', userKey)
  );
  return ciphertext.toString();
}

export const encodeHash = (word: string, userKey: string) => {
  const cipher = new Rijndael(userKey, 'cbc');
  const ciphertext = Buffer.from(cipher.encrypt(word, '256', userKey));
  return ciphertext.toString('base64');
}
