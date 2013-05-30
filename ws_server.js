var cls = require("./lib/class"),
    _ = require("underscore"),
    WebSocketServer = require('websocket').server,
    http = require('http'),
    https = require('https'),
    WWW = require('./www'),
    fs = require('fs'),
    querystring = require('querystring');

var Connection = cls.Class.extend({
  init: function(id, connection, server) {
    this._connection = connection;
    this._server = server;
    this.id = id;

    var self = this;

    this._connection.on("message", function(message) {
      if(self.listen_callback) {
        self.listen_callback(JSON.parse(message.utf8Data));
      }
    });
    
    this._connection.on('close', function(connection) {
      if(self.close_callback) {
          self.close_callback();
      }
      delete self._server.removeConnection(self.id);
    });
  },
  
  onClose: function(callback) {
    this.close_callback = callback;
  },
  
  listen: function(callback) {
    this.listen_callback = callback;
  },
  
  close: function(logError) {
    log.info("Closing connection to "+this._connection.remoteAddress+". Error: "+logError);
    this._connection.close();
  },

  send: function(message) {
    this.sendUTF8(JSON.stringify(message));
  },
  
  sendUTF8: function(data) {
      this._connection.send(data);
  }
});

module.exports = WsServer = cls.Class.extend({
  _connections: {},
  _counter: 0,
  init: function(port,sport) {
    var self = this,
        options = {
          key: fs.readFileSync('privatekey.pem'),
          cert: fs.readFileSync('certificate.pem')
        },
        server = http.createServer(function(request, response) {
          self.processRequest(request, response);
        }),
        sserver = https.createServer(options,function(request, response) {
          self.processRequest(request, response);
        });
    sserver.listen(sport, function() {
        console.log('Secure server is listening on port '+sport);
    });
    server.listen(port, function() {
        console.log('Server is listening on port '+port);
    });

    var config = {
          httpServer: server,
          autoAcceptConnections: false,
          maxReceivedFrameSize: 0x10000,
          maxReceivedMessageSize: 0x100000,
          fragmentOutgoingMessages: true,
          fragmentationThreshold: 0x4000,
          keepalive: true,
          keepaliveInterval: 20000,
          assembleFragments: true,
          disableNagleAlgorithm: true,
          closeTimeout: 5000
        };

    this.wsServer = new WebSocketServer(config);
    config.httpServer = sserver;
    this.wssServer = new WebSocketServer(config);

    this.wsServer.on('request', function(request) {
      self.handleConnection(request);
    });
    this.wssServer.on('request', function(request) {
      self.handleConnection(request);
    });
  },

  processRequest: function(request, response) {
    console.log('Received request for ' + request.url);
    var path = request.url,
        subdomain = request.headers.host.split('.')[0],
        self = this;
    console.log(subdomain,path);
    if(subdomain != 'localhost' || subdomain != 'poke-alpha')
      path = '/'+subdomain+path;
    if(request.method == 'POST'){
      var data = "";
      request.on('data', function(chunk) {
        data += chunk.toString();
      });
      request.on('end', function(chunk) {
        if(chunk)data += chunk.toString();
        self.register_callback(querystring.parse(data),function(path,responseData){
          new WWW(path,function(data){
            response.end(data);
          },responseData);
        });
      });
    }else{
      new WWW(path,function(data){
        response.end(data);
      });
    }
  },

  handleConnection: function(request) {
    var self = this,
        connection = new Connection(self._createId(),request.accept(request.requestedProtocols[0], request.origin),self);
    if(self.connection_callback) {
      self.connection_callback(connection);
    }
    self.addConnection(connection);
  },
    
  _createId: function() {
    return 'c' + (this._counter++);
    console.log(this._connections);
  },
  
  onConnect: function(callback) {
    this.connection_callback = callback;
  },

  onRegister: function(callback) {
    this.register_callback = callback;
  },
  
  onError: function(callback) {
    this.error_callback = callback;
  },
  
  forEachConnection: function(callback) {
    _.each(this._connections, callback);
  },
  
  addConnection: function(connection) {
    this._connections[connection.id] = connection;
  },
  
  removeConnection: function(id){
    delete this._connections[id];
  },
  
  getConnection: function(id) {
    return this._connections[id];
  }
});