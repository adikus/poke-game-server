var mongoose = require('mongoose');

var connection = mongoose.createConnection(process.env.POKE_GAME_DB || "mongodb://localhost/poke",function(err){
  if (err){
    console.log("Error connecting to DB.");
    throw err;
  }else console.log("Connected to database.");
});

var playerSchema = mongoose.Schema({
  n: 'string',
  p: 'string',
  s: 'mixed'
});

module.exports = DB = {
  Player: connection.model('Player', playerSchema),
};