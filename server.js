const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();
const routes = require('./routes.json');
const rewriter = jsonServer.rewriter(routes);

server.use(middlewares);
server.use(rewriter);       // permet de faire /api/xxx
server.use(router);

server.listen(8181, () => {
  console.log('🚀 JSON Server est lancé sur http://localhost:8181');
});
