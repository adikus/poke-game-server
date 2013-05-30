var fs = require('fs'),
    Server = require('./server'),
    WsServer = require('./ws_server'),
    DB = require("./database");

function main(config) {
  var wsServer = new WsServer(80,3003),
      server = new Server(wsServer);

  wsServer.onConnect(function(connection) {
    server.connect_callback(connection);
  });
}

main({});