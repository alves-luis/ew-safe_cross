// const express = require('express')
// const app = express()
// const port = 3000
const LocationSimulator = require('./location_simulator')
const geolib = require('geolib')
const request = require('request');
const colors = require('colors');
const axios = require('axios')
require('dotenv').config()

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
        }
        
    ],
    nearest_crosswalk: {
        id: 0,
        latitude: 0, 
        longitude: 0,
        exchange: {}
    }
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



// Login ---------------------------------------------------------
function login() {
    request.post("http://localhost:3000/api/v1/signup/pedestrian", (err, res, body) => {
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
    check_nearest_crosswalk();
    
    // Update current location --------------------------------
    setInterval(() => {
        updateLocation();
    }, UPDATE_LOCATION_RATE);

    // Request nearest crosswalks to SPWS --------------------------------
    setInterval(() => {
        requestNearbyCrosswalks();
    }, REQUEST_NEARBY_CROSSWALKS_RATE);
}



function check_nearest_crosswalk() {
    let current_nearest_crosswalk = data.nearest_crosswalk;
    console.log(`${new Date().toISOString()}: Checking nearest crosswalk (under ${MAX_DISTANCE}m)...`);

    // Verify if nearest crosswalk is too far away now
    let to_current_crosswalk = geolib.getDistance(data.nearest_crosswalk, data.current_location);
    if (to_current_crosswalk > MAX_DISTANCE && data.nearest_crosswalk.id !== 0) {
        console.log( `${new Date().toISOString()}: Too far away from crosswalk #${data.nearest_crosswalk.id} now`.green);
        data.nearest_crosswalk.id = 0;
        // data.nearest_crosswalk.exchange = {};
    }


    // Verify for each nearby crosswalk which one is the closest and max MAX_DISTANCEm away
    data.nearby_crosswalks.forEach( crosswalk => {
        let to_new_crosswalk = geolib.getDistance(crosswalk, data.current_location);
        to_current_crosswalk = geolib.getDistance(data.nearest_crosswalk, data.current_location);

        if((to_new_crosswalk < to_current_crosswalk || data.nearest_crosswalk.id === 0) && to_new_crosswalk < MAX_DISTANCE ){
            data.nearest_crosswalk = crosswalk;
        } 
    });


    // If nearest crosswalk has changed -> alert SPWS
    if (current_nearest_crosswalk != data.nearest_crosswalk) {
        console.log(`${new Date().toISOString()}: Closer to crosswalk #${data.nearest_crosswalk.id}`.green);

        axios({
            method: 'POST',
            url: `http://localhost:3000/api/v1/pedestrian/${data.id}/near/${data.nearest_crosswalk.id}`,
        }).then( response => {
            // console.log(response);
            // update exchange -> data.nearest_crosswalk.exchange = ...
        }).catch( error => {
            //console.log(error);
        });
    }
}



function updateLocation() {
    data.last_location  = data.current_location;
    data.current_location = location_simulator.getCurrentLocation();   

    // Verify if simulation is over
    let valid = location_simulator.setNextLocation();
    if(!valid) shutdown();


    if(data.nearest_crosswalk.id !== 0) {
        check_crosswalk_crossed();
        update_exchange();
    }
    check_nearest_crosswalk();
}



function requestNearbyCrosswalks() {
    console.log(new Date().toISOString() + `: Requesting SPWS for nearby crosswalks - Currently at (${data.current_location.latitude}, ${data.current_location.longitude})...`);

    axios({
        method: 'POST',
        url: `http://localhost:3000/api/v1/pedestrian/${data.id}/location`,
        data: {
            lon: data.current_location.longitude, 
            lat: data.current_location.latitude
        }
    }).then( response => {
        console.log(new Date().toISOString() + `: Got ${response.data.crosswalks.length} new crosswalks near my current location.`);
        //data.nearby_crosswalks = response.data.crosswalks
    }).catch(error => {
        //console.log(error);
    })

}



function check_crosswalk_crossed() {
    center = geolib.getCenter([data.current_location, data.last_location]);
    distance = geolib.getDistance(data.current_location, data.last_location);

    if(geolib.isPointWithinRadius(data.nearest_crosswalk, center, distance/2)){
        console.log(`${new Date().toISOString()}: Crosswalk #${data.nearest_crosswalk.id} crossed`.green)
    }
}



function update_exchange() {
    console.log(`${new Date().toISOString()}: Updating exchange...`.blue);
    // more stuff: push information to exchange
}



function shutdown() {
    console.log(`${new Date().toISOString()}: Trip is over. Shutting down...`.blue); 
    // send that i'm done to server
    process.exit();  
}
