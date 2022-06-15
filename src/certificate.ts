import fs from 'fs';

// remove informations before -----BEGIN PRIVATE KEY-----

// openssl pkcs12 -in certname.pfx -nocerts --clcerts -out key.pem -nodes
const privateKey = fs.readFileSync('/home/kirch/cert/key.pem');

// openssl pkcs12 -in certname.pfx -nokeys --clcerts -out cert.pem
const publicKey = fs.readFileSync('/home/kirch/cert/cert.pem');

const password = '1';

export default {
  key: privateKey,
  cert: publicKey,
  password,
};
