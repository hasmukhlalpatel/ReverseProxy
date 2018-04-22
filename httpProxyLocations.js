var fs = require('fs');

function httpProxyLocations(options){
    this.hostname = options.hostname
    this.locations = options.locations;
    this.default = options.default || null;
  
    return this;
  }
  
  httpProxyLocations.prototype.match = function match(req) {
    for(var loc in this.locations){
        var location = this.locations[loc];
        
        if(location.rule == req.url){
            if(location.rewriteUrl != null){
                req.url = location.rewriteUrl;
            }
            return location.target;
        }

        if(location.rule.endsWith("*")){
            let virtualDirName = location.rule.replace("*","");
            if(req.url.startsWith(virtualDirName)){
                if(location.rewriteUrl != null){
                let queryParams =  req.url.replace(virtualDirName,"");
                    req.url = location.rewriteUrl.replace("*", queryParams);
                }
                return location.target;
            }
        }

        var testRegExMatch = req.url.match(location.rule);
        if(testRegExMatch != null){
            if(location.rewriteUrl != null){
                let target = location.rewriteUrl;
                for (var i = 1; i < testRegExMatch.length; i++) {
                    target = target.replace('$' + i, testRegExMatch[i]);
                  }
                req.url = target;
            }
            return location.target;
        }
    }

    if(this.default  != null){
        return this.default.target;
    }

    return null;
  }

  module.exports = httpProxyLocations;