var cls = require("./lib/class"),
    _ = require("underscore"),
    fs = require("fs");

module.exports = Static = cls.Class.extend({
  init: function(filename, callback) {
    console.log("Serving static/"+filename);
    fs.readFile('./static/'+filename, function read(err, data) {
      if (err)throw err;
      callback(data);
    });
  },
});