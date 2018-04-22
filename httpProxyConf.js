var fs = require('fs');
var httpProxyLocations = require('./httpProxyLocations');

function httpProxyConf(){
    this.confFolder = "./conf/";
    this.conf=null;
  }
  
  httpProxyConf.prototype.load = function() {
      var serverConfigs = [];
      let configFolder = this.confFolder;
      fs.readdirSync(configFolder).forEach(file => {
          if(file.endsWith(".json")){
              console.log("Loading config from " + file);
              let confJson = fs.readFileSync(configFolder + file, "utf8");
              let config =  JSON.parse(confJson);
              config.server_name.forEach(servername => {
                serverConfigs[servername] = new httpProxyLocations({
                    hostname:servername,
                    locations : config.locations,
                    default : config.default
                });
              });
            }
        });
    return serverConfigs;
  }

  module.exports = httpProxyConf;