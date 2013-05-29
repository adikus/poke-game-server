var cls = require("./lib/class"),
    _ = require("underscore"),
    Player = require('./player');

module.exports = Server = cls.Class.extend({
  init: function(wsServer) {
    this.server = wsServer;
    this.players = {};

    this.onPlayerConnect(function(connection){
      console.log("Player connected. "+connection.id);
      this.players[connection.id] = new Player(connection);
    });
  },

  onPlayerConnect: function(callback) {
    this.connect_callback = callback;
  },
});