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
MAX_DISTANCE = process.env.MAX_DISTANCE || 40  // m
UPDATE_LOCATION_RATE = process.env.UPDATE_LOCATION_RATE || 1000 // ms
REQUEST_NEARBY_CROSSWALKS_RATE = process.env.REQUEST_NEARBY_CROSSWALKS_RATE || 30000 // ms
WS_URL = process.env.WS_URL
WS_PORT = process.env.WS_PORT
WS_PATH = process.env.WS_PATH
RMQ_USERNAME = process.env.RMQ_USERNAME
RMQ_PASSWORD = process.env.RMQ_PASSWORD

// Information
let data = {
    id: 0,
    current_location: {
        latitude: 0, 
        longitude: 0
    },
    last_location: {
        latitude: 0, 
        longitude: 0
    },
    nearby_crosswalks: [],
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
const ws = new WebSocket(`ws://${WS_URL}:${WS_PORT}/${WS_PATH}`);
const client = Stomp.over(ws);

client.connect(RMQ_USERNAME, RMQ_PASSWORD, () => console.log('Connected.'), () => console.log('Error.'.red));


// Functions -------------------------------


function checkNearestCrosswalks() {
    console.log(`${new Date().toISOString()}: Checking nearest crosswalks (under ${MAX_DISTANCE}m)...`);

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

        if(to_new_crosswalk < MAX_DISTANCE && data.nearest_crosswalks.get(crosswalk.id) === undefined) {
            console.log(`${new Date().toISOString()}: Close to crosswalk #${crosswalk.id}`.green);               

            data.nearest_crosswalks.set(crosswalk.id, crosswalk);
            subscribeCrosswalkExchange(crosswalk.id); // tem que subscrever a crosswalk primeiro
            sendCrosswalkNearExchange(crosswalk.id);
        } 
    });
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
        url: `http://localhost:3000/api/v1/crosswalks?lat=${lat}&lon=${lon}&range=${2000}`,
    }).then( response => {
        console.log(new Date().toISOString() + `: Got ${response.data.crosswalks.length} new crosswalks near my current location.`);
        data.nearby_crosswalks = response.data.crosswalks
    }).catch(error => {
        console.log(error);
    })
}



function checkCrosswalkCrossed(crosswalk) {
    center = geolib.getCenter([data.current_location, data.last_location]);
    distance = geolib.getDistance(data.current_location, data.last_location);
    
    if(geolib.isPointWithinRadius(crosswalk, center, distance/2)){
        console.log(`${new Date().toISOString()}: \nCrosswalk #${crosswalk.id} crossed.`.green)
        if(crosswalk.light === 'yellow') console.log(`\tTry to be more careful, the light was yellow!`.yellow)
        else if(crosswalk.light === 'red') console.log(`\tSTOP! Pay attention to traffic light! Real lives are at stake!`.red)
        if(crosswalk.nearby_pedestrians > 0) console.log(`\tPedestrians nearby. Pay attention to your surroundings!`.red)        
    }
}



function sendLocationExchange(crosswalk_id) {
    console.log(`${new Date().toISOString()}: Updating #${crosswalk_id} exchange...`.blue);
    
    body = {
        id: data.id,
        latitude: data.current_location.latitude,
        longitude: data.current_location.longitude
    }
    
    client.send(`/exchange/public/${crosswalk_id}.vehicle.location`, {}, JSON.stringify(body));
}



function sendCrosswalkNearExchange(crosswalk_id) {
    console.log(`${new Date().toISOString()}: Saying I'm near to crosswalk #${crosswalk_id} exchange...`.blue);
    
    body = { 
        veh_id: data.id, 
        crosswalk_id: crosswalk_id 
    }

    client.send(`/exchange/private/${crosswalk_id}.vehicle.near`, {}, JSON.stringify(body));
}



function sendCrosswalkFarExchange(crosswalk_id) {
    console.log(`${new Date().toISOString()}: Saying I'm far from crosswalk #${crosswalk_id} exchange...`.blue);
    
    body = { 
        veh_id: data.id, 
        crosswalk_id: crosswalk_id 
    }

    client.send(`/exchange/private/${crosswalk_id}.vehicle.far`, {}, JSON.stringify(body));
    data.nearest_crosswalks.get(crosswalk_id).exchange_id.unsubscribe();
}



function subscribeCrosswalkExchange(crosswalk_id) {
    let crosswalk = data.nearest_crosswalks.get(crosswalk_id)
    
    crosswalk.exchange_id = client.subscribe(`/exchange/public/${crosswalk_id}.status.short`, (msg) => {
        var json = JSON.parse(msg.body);

        crosswalk.light = json.light;
        crosswalk.nearby_vehicles = json.num_vehs;
        crosswalk.nearby_pedestrians = json.num_peds;

        data.nearest_crosswalks.set(crosswalk_id, crosswalk)

        console.log(`${new Date().toISOString()}:\nCrosswalk #${crosswalk_id} status:`.green)
        console.log(`\tLight: ${crosswalk.light}`.green)
        console.log(`\tNearby pedestrians: ${crosswalk.nearby_pedestrians}`.green)
        if(crosswalk.nearby_pedestrians > 0) console.log(`\tTake care!`.red)
    }, (error) => {
        console.log(error);
    });
}



function shutdown() {
    console.log(`${new Date().toISOString()}: Trip is over. Shutting down...`.blue); 
    
    data.nearest_crosswalks.forEach( crosswalk => {
        sendCrosswalkFarExchange(crosswalk.id)
    });
    process.exit();  
}




// MAIN ---------------------------------------------------------

function login() {
    request.post("http://localhost:3000/api/v1/vehicle/signup", (err, res, body) => {
        if(err) {
            console.log(err);
        }
        else {
            data.id = JSON.parse(res.body).id;
            main();
        }
    });
}



function main() {
    console.log(`${new Date().toISOString()}: Registered as Vehicle with ID = ${data.id}`.blue);

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


login();