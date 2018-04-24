var http = require('http'),
    httpProxy = require('http-proxy');
var fs = require('fs');
var httpProxyLocations = require('./httpProxyLocations'); 
var httpProxyConf = require('./httpProxyConf');
var port = process.env.PORT||5050;
var port2 = process.env.PORT2||5051;

var serverConfigs = new httpProxyConf().load();
//
// Create a proxy server with custom application logic
//
var proxy = httpProxy.createProxyServer({});

// To modify the proxy connection before data is sent, you can listen
// for the 'proxyReq' event. When the event is fired, you will receive
// the following arguments:
// (http.ClientRequest proxyReq, http.IncomingMessage req,
//  http.ServerResponse res, Object options). This mechanism is useful when
// you need to modify the proxy request before the proxy connection
// is made to the target.
//
proxy.on('proxyReq', function(proxyReq, req, res, options) {
  proxyReq.setHeader('X-Special-Proxy-Header', 'foobar');
});

proxy.on('proxyRes', function(proxyRes, req, res, options) {
  console.log("Got response: " + res.statusCode);
  proxyRes.on('data' , function(dataBuffer){
    var data = dataBuffer.toString('utf8');
    console.log("This is the data from target server : "+ data);
  });
});

proxy.on('error', function (err, req, res) {
  res.writeHead(500, {'Content-Type': 'text/plain'});
  res.end('Something went wrong. And we are reporting a custom error message.');
});

var server = http.createServer(function(req, res) {
  let hostname = req.headers["host"];
  console.log("Url: "+ hostname + req.url);
  try {
    var config = serverConfigs[hostname];
    if(config != null) {
      var configTarget = config.match(req);
      if(configTarget != null){
        //target: 'http://127.0.0.1:7800' //target: 'http://127.0.0.1:5060'
        return proxy.web(req, res, {target: configTarget});
      }
    }
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Could not find the requested url and path!');
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('An error has occured :' + error);
  }
});

console.log("listening on port " + port)
server.listen(port);


var setupServer = http.createServer(function(req, res) {
  console.log("Url: "+ req.url);
  serverConfigs = new httpProxyConf().load();
  res.write("Url: "+ req.url);
  res.write('successfully reloaded configs!');
  res.end();
});

console.log("setup Server listening on port "+ port2)
setupServer.listen(port2);



