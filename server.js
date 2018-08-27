const jsonServer = require('json-server');
const path = require('path');
const server = jsonServer.create();
const router = jsonServer.router('db.json');

server.use(router);
server.listen(3000, () => {
  console.log('JSON Server is running');
});
