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

    this.server.onRegister(function(data, callback){
      console.log("New registration received: ",data);
      var check = require('validator').check,
          sanitize = require('validator').sanitize;
      try{
        check(data.email).isEmail();
        check(data.pass,"Please enter password").notEmpty();
        check(data.pass,"Password too short (min: 6)").len(6);
        check(data.name,"Username too short (min: 6)").len(6);
        check(data.pass,"Passwords do not match").equals(data["pass-confirm"]);
      }
      catch(err){
        callback("/register/index.html",{error:err.message, name:data.name, email: data.email});
        return false;
      }
      DB.Player.findOne({"$or":[{n:data.name},{e:data.email}]},function(err, doc){
        if(doc){
          if(doc.n == data.name)msg = "Username already taken";
          else msg = "Accout with this email already exists";
          callback("/register/index.html",{error:msg, name:data.name, email: data.email});
        }
        else{
          var player = new DB.Player({n:data.name,p:data.pass,e:data.email});
          player.save(function(err){
            if(err)console.log(err);
            else callback("/register/success.html",{msg:"Registration successful", name:data.name, email: data.email});
          });
        }
      });
    });
  },

  onPlayerConnect: function(callback) {
    this.connect_callback = callback;
  },
});