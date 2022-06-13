import fs from 'fs';

const privateKey = fs.readFileSync('/home/kirch/bicisporte/key.pem');
const publicKey = fs.readFileSync('/home/kirch/bicisporte/cert.pem');
const password = '1';

export default {
  key: privateKey,
  cert: publicKey,
  password,
};
