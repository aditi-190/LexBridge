const controller = require('./controllers/javaController');

const req = { body: { code: 'int x = y;' } };

const res = {
  statusCode: 200,
  status(code) { this.statusCode = code; return this; },
  json(obj) { console.log('Controller response (status', this.statusCode + '):', JSON.stringify(obj, null, 2)); }
};

controller.compileJavaCode(req, res);
