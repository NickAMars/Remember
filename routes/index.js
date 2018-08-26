const Controller = require(`../controllers`);
module.exports = app => {
  app.post('/test', Controller.test);
  app.post('/api',Controller.create);
  app.get('/api',Controller.landing);
  app.get('*',Controller.wildCard );
}
