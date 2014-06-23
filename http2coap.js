var app = require('express')();
var http = require('http').Server(app);
const coap = require('coap'),
      coapPacket = require('coap-packet'),
      address = "coap://coap.me/";

app.get('/', function(req, res){
      res.sendfile('index.html');
});

app.get('/.well-known/core', function(req, res){
    var coap_req = coap.request(address + ".well-known/core");
    coap_req.on('response', function(coap_res) {
        res.send(coap_res.payload.toString());
    });
    coap_req.end();
});

app.get('/:who', function(req, res){
    var coap_req = coap.request(address + req.params.who);
    coap_req.on('response', function(coap_res) {
        res.send(coap_res.payload.toString());
    });
    coap_req.end();
});

http.listen(3000, function(){
      console.log('listening on *:3000');
});
