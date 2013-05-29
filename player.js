var cls = require("./lib/class"),
    _ = require("underscore");

module.exports = Player = cls.Class.extend({
  init: function(connection) {
    var self = this;

    this.connection = connection;

    this.authenticated = false;

    this.connection.listen(function(message) {
      var action = parseInt(message[0]);

      console.log("Received: "+message);

      if(action === 0){
        message.shift();
        self.authenticate(message,function(message){
          self.send([1,message]);
          console.log(self.name+" - auth. successful.");
        },function(message){
          self.send([0,message]);
        });
      }else if(!self.authenticated)return false;

      if(action === 1){
        message.shift();
        self.send([2,self.saves]);
      }else if(action === 2){
        var saveId = message[1];
        if(saveId === -1){
          self.newSave();
        }else if(saveId){
          self.loadSave(saveId);
        }else send([0,"Bad message."]);
      }
    });

    this.connection.onClose(function() {
      if(self.exit_callback) {
        self.exit_callback();
      }
    });
        
    this.send([0]);
  },

  send: function(message) {
    this.connection.sendUTF8(JSON.stringify(message));
  },

  authenticate: function(data,success,fail){
    if(this.authenticated){
      if(fail)fail("Already authenticated.");
      return false;
    }
    var name = data[0],
        pass = data[1],
        self = this;

    DB.Player.findOne({n:name,p:pass},function(err,doc){
      if(doc){
        self.name = name;
        self.saves = doc.s?doc.s:[];
        self.authenticated = true;
        if(success)success("Authentication successful.");
      }else if(fail)fail("Authentication unsuccessful.");
    });
  },

  newSave: function(){
    console.log("Gen. new save file.");
  },

  loadSave: function(id){
    console.log("Load save file with id "+id);
  },
});