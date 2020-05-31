const Stomp = require('stompjs')
const WebSocket = require('ws')

var crossalk = {
    id: 3
}

// WebApp ------------------

// Init
const ws = new WebSocket('ws://localhost:15674/ws');
const client = Stomp.over(ws);


var on_connect = function() {
    console.log('connected');
};

var on_error =  function() {
    console.log('error--');
};

client.connect('guest', 'guest', on_connect, on_error);

receiveMessage = function(message){
    console.log(JSON.parse(message.body));
}

setTimeout(() => {
    var subscription = client.subscribe(`/exchange/public/${crossalk.id}.pedestrian.location`, receiveMessage)
    console.log(subscription)
    
}, 2000)

// Subscribing



// End
// subscription.unsubscribe();

// client.disconnect(function() {
//     alert("See you next time!");
// });

// Pedestrian ------------------
// var ws = new WebSocket('ws://127.0.0.1:15674/ws');
// var client = Stomp.over(ws);

// var on_connect = function() {
//     console.log('connected');
// };

// var on_error =  function() {
//     console.log('error');
// };

// client.connect('guest', 'guest', on_connect, on_error, '/');


// body = {
//     id: 0,
//     latitude: 0,
//     longitude: 0
// }

// client.send(`/exchange/${crossalk.id}.pedestrian.location`, {}, body);