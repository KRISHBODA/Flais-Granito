const express = require('express');
const cors = require('cors');

const app = express();

const allowedOrigins = new Set(["https://www.flaisgranito.com"]);

app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true);
      if (allowedOrigins.has(origin)) return cb(null, true);
      return cb(null, false);
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token", "X-Requested-With"],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

app.use((req, res, next) => {
  res.status(400).json({ msg: "fake 400 error" });
});

const request = require('http').request;
const server = app.listen(0, () => {
  const port = server.address().port;
  
  const options = {
    hostname: 'localhost',
    port: port,
    path: '/api/admin/users',
    method: 'OPTIONS',
    headers: {
      'Origin': 'https://www.flaisgranito.com',
      'Access-Control-Request-Method': 'GET',
      'Access-Control-Request-Headers': 'authorization'
    }
  };

  const req = request(options, (res) => {
    console.log("OPTIONS status:", res.statusCode);
    console.log("OPTIONS headers:", res.headers);
    
    // Test GET
    const getOptions = {
      hostname: 'localhost',
      port: port,
      path: '/api/admin/users',
      method: 'GET',
      headers: {
        'Origin': 'https://www.flaisgranito.com',
        'Authorization': 'Bearer test'
      }
    };
    
    request(getOptions, (res2) => {
      console.log("GET status:", res2.statusCode);
      console.log("GET headers:", res2.headers);
      server.close();
    }).end();
  });
  
  req.end();
});
