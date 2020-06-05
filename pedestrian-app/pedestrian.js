const LocationSimulator = require('./location_simulator')
const geolib = require('geolib')
const request = require('request')
const colors = require('colors')
const axios = require('axios')
require('dotenv').config()
const Stomp = require('stompjs')
const WebSocket = require('ws')

// Setup ---------------------------------------------------------

// Environment variables
MAX_DISTANCE = process.env.MAX_DISTANCE || 20  // m
UPDATE_LOCATION_RATE = process.env.UPDATE_LOCATION_RATE || 2000 // ms
REQUEST_NEARBY_CROSSWALKS_RATE = process.env.REQUEST_NEARBY_CROSSWALKS_RATE || 30000 // ms

// Information
let data = {
    id: 0,
    current_location: {
        latitude: 41.54958, 
        longitude: -8.43351
    },
    last_location: {
        latitude: 0, 
        longitude: 0
    },
    nearby_crosswalks: [
        { // simulação veiculo 1
            id: 1,
            latitude: 41.5390993, 
            longitude: -8.4337006
        },
        {
            id: 2, 
            latitude: 41.5445975, 
            longitude: -8.4256079
        },
        {   // simulação pedestre 1
            id: 3,
            latitude: 41.5476900,
            longitude: -8.4069275
        },
        {   // simulação pedestre 1
            id: 4,
            latitude: 41.5476850,
            longitude: -8.4067275
        }
        
    ],
    nearest_crosswalks: new Map()
}

// Parsing args
var args = process.argv.slice(2);
var simulation;
let location_simulator; 

if (args.length !== 0) {
    if (parseInt(args[0]) !== NaN && (parseInt(args[0]) === 0 || parseInt(args[0]) === 1)){
        simulation = parseInt(args[0]);
        location_simulator = new LocationSimulator(simulation);
    } 
    else { 
        console.log("Please, choose '0' or '1' as parameter.".red)
        process.exit(1); 
    }
}
else {
    location_simulator = new LocationSimulator();
}


// STOMP
const ws = new WebSocket('ws://localhost:15674/ws');
const client = Stomp.over(ws);

client.connect('guest', 'guest', () => console.log('Connected.'), () => console.log('Error.'.red));


// Login ---------------------------------------------------------
function login() {
    request.post("http://localhost:3000/api/v1/pedestrian/signup", (err, res, body) => {
        if(err) {
            console.log(err);
        }
        else {
            data.id = JSON.parse(res.body).id;
            main();
        }
    });
}

login();

function main() {
    console.log(`${new Date().toISOString()}: Registered as Pedestrian with ID = ${data.id}`.blue);

    // Evaluate current location -------------------------------------
    data.current_location = location_simulator.getCurrentLocation();
    requestNearbyCrosswalks();
    checkNearestCrosswalks();
    
    // Update current location --------------------------------
    setInterval(() => {
        updateLocation();
    }, UPDATE_LOCATION_RATE);

    // Request nearest crosswalks to SPWS --------------------------------
    setInterval(() => {
        requestNearbyCrosswalks();
    }, REQUEST_NEARBY_CROSSWALKS_RATE);
}



function checkNearestCrosswalks() {
    //let current_nearest_crosswalk = data.nearest_crosswalk;
    console.log(`${new Date().toISOString()}: Checking nearest crosswalk (under ${MAX_DISTANCE}m)...`);

    // Verify if nearest crosswalks are too far away now
    data.nearest_crosswalks.forEach(crosswalk => {
        let to_crosswalk = geolib.getDistance(crosswalk, data.current_location);
        if (to_crosswalk > MAX_DISTANCE) {
            console.log(`${new Date().toISOString()}: Too far away from crosswalk #${crosswalk.id} now`.green);
            sendCrosswalkFarExchange(crosswalk.id)
            data.nearest_crosswalks.delete(crosswalk.id);
        }
    })
    

    // Verify for each nearby crosswalk which ones are closer than MAX_DISTANCE
    data.nearby_crosswalks.forEach( crosswalk => {
        let to_new_crosswalk = geolib.getDistance(crosswalk, data.current_location);
        //to_current_crosswalk = geolib.getDistance(data.nearest_crosswalk, data.current_location);

        if(to_new_crosswalk < MAX_DISTANCE && data.nearest_crosswalks.get(crosswalk.id) === undefined) {
            console.log(`${new Date().toISOString()}: Close to crosswalk #${crosswalk.id}`.green);               

            data.nearest_crosswalks.set(crosswalk.id, crosswalk);
            subscribeCrosswalkExchange(crosswalk.id); // tem que subscrever a crosswalk primeiro
            sendCrosswalkNearExchange(crosswalk.id);
        } 
    });

    // If nearest crosswalk has changed -> alert SPWS
    // if (current_nearest_crosswalk != data.nearest_crosswalk) {
    //     console.log(`${new Date().toISOString()}: Close to crosswalk #${data.nearest_crosswalk.id}`.green);
        
    //     if(current_nearest_crosswalk.id != 0) sendCrosswalkFarExchange(current_nearest_crosswalk.id); // tem que estar aqui? para apenas uma nearest acho que sim
    //     subscribeCrosswalkExchange(data.nearest_crosswalk.id); // tem que subscrever a crosswalk primeiro
    //     sendCrosswalkNearExchange(data.nearest_crosswalk.id);
    // }
}



function updateLocation() {
    data.last_location  = data.current_location;
    data.current_location = location_simulator.getCurrentLocation();   

    // Verify if simulation is over
    let valid = location_simulator.setNextLocation();
    if(!valid) shutdown();

    data.nearest_crosswalks.forEach( (crosswalk, id) => {
        checkCrosswalkCrossed(crosswalk);
        sendLocationExchange(id);
    });
    
    checkNearestCrosswalks();
}



function requestNearbyCrosswalks() {
    lon = data.current_location.longitude;
    lat = data.current_location.latitude;

    console.log(`${new Date().toISOString()}: Requesting SPWS for nearby crosswalks - Currently at (${lat}, ${lon})...`);
      
    axios({
        method: 'GET',
        url: `http://localhost:3000/api/v1/crosswalks?lat=${lat}&lon=${lon}&range=${5000}`,
    }).then( response => {
        console.log(new Date().toISOString() + `: Got ${response.data.crosswalks.length} new crosswalks near my current location.`);
        //data.nearby_crosswalks = response.data.crosswalks
    }).catch(error => {
        console.log(error);
    })
}



function checkCrosswalkCrossed(crosswalk) {
    center = geolib.getCenter([data.current_location, data.last_location]);
    distance = geolib.getDistance(data.current_location, data.last_location);

    if(geolib.isPointWithinRadius(crosswalk, center, distance/2)){
        // TODO: Prettier feedback
        console.log(`${new Date().toISOString()}: Crosswalk #${crosswalk.id} crossed with ${crosswalk.light} light.`.green)
    }
}



function sendLocationExchange(crosswalk_id) {
    console.log(`${new Date().toISOString()}: Updating #${crosswalk_id} exchange...`.blue);
    
    body = {
        id: data.id,
        latitude: data.current_location.latitude,
        longitude: data.current_location.longitude
    }
    
    client.send(`/exchange/public/${crosswalk_id}.pedestrian.location`, {}, JSON.stringify(body));
}


function sendCrosswalkNearExchange(crosswalk_id) {
    console.log(`${new Date().toISOString()}: Saying I'm near to crosswalk #${crosswalk_id} exchange...`.blue);
    
    body = { 
        ped_id: data.id, 
        crosswalk_id: crosswalk_id 
    }

    client.send(`/exchange/private/${crosswalk_id}.pedestrian.near`, {}, JSON.stringify(body));
}


function sendCrosswalkFarExchange(crosswalk_id) {
    console.log(`${new Date().toISOString()}: Saying I'm far from crosswalk #${crosswalk_id} exchange...`.blue);
    
    body = { 
        ped_id: data.id, 
        crosswalk_id: crosswalk_id 
    }

    client.send(`/exchange/private/${crosswalk_id}.pedestrian.far`, {}, JSON.stringify(body));
    data.nearest_crosswalks.get(crosswalk_id).exchange_id.unsubscribe();
}

function subscribeCrosswalkExchange(crosswalk_id) {
    let crosswalk = data.nearest_crosswalks.get(crosswalk_id)
    
    crosswalk.exchange_id = client.subscribe(`/exchange/public/${crosswalk_id}.status.short`, (msg) => {
        var json = JSON.parse(msg.body);
        crosswalk.light = json.light;
        data.nearest_crosswalks.set(crosswalk_id, crosswalk)
    }, (error) => {
        console.log(error);
    });
}

function shutdown() {
    console.log(`${new Date().toISOString()}: Trip is over. Shutting down...`.blue); 
    // send that i'm done to server
    process.exit();  
}

