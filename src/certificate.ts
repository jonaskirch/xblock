import fs from 'fs';

// openssl pkcs12 -in certname.pfx -nocerts -out key.pem -nodes
const privateKey = fs.readFileSync('/home/kirch/certoffice/key.pem');

// openssl pkcs12 -in certname.pfx -nokeys -out cert.pem
const publicKey = fs.readFileSync('/home/kirch/certoffice/cert.pem');

const password = '1';

export default {
  key: privateKey,
  cert: publicKey,
  password,
};
