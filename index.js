const coap = require('coap'),
      coapPacket = require('coap-packet'),
      app = require('express')(),
      http = require('http').Server(app);

function parseCoreFormat(line) {
    var regex = /(<.+>;((ct=\d+|(rt|if|title)=.+);)*)+/;
    var uri_regex = /<.+>/;
    var ct_regex = /ct=(\d)+/;
    var if_regex = /if=".+"/;
    var unit_regex = /rt=".+"/;
    var title_regex = /title=".+"/;
    var coreObject = {};
    var match = regex.exec(line);

    if (match != null) {
        var services = match[0];
        var s_data = services.split(';');
        var i;
        for (i = 0; i < s_data.length; i++) {
            var uri = uri_regex.exec(s_data[i]);
            if (uri != null) {
                coreObject['uri'] = uri[0].slice(1, -1);
            }
            var ct = ct_regex.exec(s_data[i]);
            if (ct != null) {
                coreObject['ct'] = ct[0].slice(-1);
            }
            var info = if_regex.exec(s_data[i]);
            if (info != null) {
                coreObject['if'] = info[0].slice(4, -1);
            }

            var unit = unit_regex.exec(s_data[i]);
            if (unit != null) {
                coreObject['unit'] = unit[0].slice(4, -1);
            }

            var title = title_regex.exec(s_data[i]);
            if (title != null) {
                coreObject['title'] = title[0].slice(7, -1);
            }
        }
    }

    return coreObject;
}

app.get('/:address/resources', function(req, res){
    var coap_req = coap.request("coap://" + req.params.address + "/.well-known/core");
    coap_req.on('response', function(coap_res) {
        stream = coap_res.payload.toString();
        var index;
        var services = []
        var arr = stream.split(',');
        for (index = 0; index < arr.length; index++) {
            services[index] = parseCoreFormat(arr[index]);
        }
        res.send(services);
    });
    coap_req.end();
});

app.get('/:address/:resource', function(req, res){
    console.log("address", req.params.address);
    console.log("resource", req.params.resource);
    var coap_req = coap.request("coap://" + req.params.address + "/" + req.params.resource);
    coap_req.on('response', function(coap_res) {
        res.send(coap_res.payload.toString());
    });
    coap_req.end();
});

http.listen(3000, function(){
      console.log('listening on *:3000');
});
