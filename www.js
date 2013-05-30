var cls = require("./lib/class"),
    _ = require("underscore"),
    fs = require("fs");

module.exports = WWW = cls.Class.extend({
  init: function(filename, callback, responseData) {
    var self = this;

    fs.readFile('./static'+filename, function read(err1, data) {
      if (err1){
        fs.readFile('./static'+filename+'/index.html', function read(err2, data) {
          if (err2){
            console.log("Serving error for: "+filename);
            callback("Error");
          }else{
            self.serveFile(filename+'/index.html',data,responseData,callback);
          }
        });
      }else{
        self.serveFile(filename,data,responseData,callback);
      }
    });
  },

  serveFile: function(filename, fileContent, responseData, callback){
    console.log("Serving static"+filename);
    responseData = responseData || {};
    while(result = /<%=(.*?)%>/g.exec(fileContent)){
      fileContent = fileContent.toString().replace("<%="+result[1]+"%>",responseData[result[1]] || "");
    }
    callback(fileContent);
  },
});