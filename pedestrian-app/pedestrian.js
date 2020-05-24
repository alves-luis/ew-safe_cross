// const express = require('express')
// const app = express()
// const port = 3000
const LocationSimulator = require('./location_simulator')
const geolib = require('geolib')
const request = require('request');
const colors = require('colors');
const axios = require('axios')

// Setup ---------------------------------------------------------

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
        {
            id: 1,
            latitude: 41.5390993, 
            longitude: -8.4337006
        },
        {
            id: 2, 
            latitude: 41.5445975, 
            longitude: -8.4256079
        },
        
    ],
    nearest_crosswalk: {
        id: 0
        // latitude: 0, 
        // longitude: 0
    }
}

// Parsing args
var args = process.argv.slice(2);
var simulation;
let location_simulator; 

if (args.length !== 0) {
    if (typeof args[0] === 'number'){
        simulation = args[0]
        location_simulator = new LocationSimulator(simulation);
    } 
    else process.exit(1);
}
else {
    location_simulator = new LocationSimulator();
}


// Login ---------------------------------------------------------
function login() {
    // axios.post("http://localhost:3000/api/v1/signup/pedestrian")
    //     .then(response => {
    //         data.id = response.data.id;
    //     })
    //     .catch(error => {
    //         console.log(error.red)
    //     })

    request.post("http://localhost:3000/api/v1/signup/pedestrian", (err, res, body) => {
        if(err) return console.log(err);
        
        data.id = JSON.parse(res.body).id;

        main();
    });
}

login();

function main() {
    console.log(`${new Date().toISOString()}: Registered as Pedestrian with ID = ${data.id}`.blue);

    // Evaluate current location -------------------------------------
    data.current_location = location_simulator.getCurrentLocation();
    requestNearestCrosswalksLocation();
    check_nearest_crosswalk();
    

    // Send periodic location to SPWS --------------------------------
    setInterval(() => {
        sendLocation();
    }, 500)


    // Request nearest crosswalks to SPWS --------------------------------
    setInterval(() => {
        console.log(new Date().toISOString() + ": Request crosswalks");
        requestNearestCrosswalksLocation();
    }, 30000)
}



function check_nearest_crosswalk() {
    let current_nearest_crosswalk = data.nearest_crosswalk;
    console.log(new Date().toISOString() + ': Calculating nearest crosswalk...');

    // Verify if nearest crosswalk is too far away now (>100m)
    let to_current_crosswalk = geolib.getDistance(data.nearest_crosswalk, data.current_location);

    if (to_current_crosswalk > 100 && data.nearest_crosswalk.id !== 0) {
        console.log( `${new Date().toISOString()}: Too far away from crosswalk #${data.nearest_crosswalk.id} now`.green);
        data.nearest_crosswalk.id = 0;
    }


    // Verify for each nearby crosswalk which one is the closest and maximum 100m away
    data.nearby_crosswalks.forEach( crosswalk => {
        let to_new_crosswalk = geolib.getDistance(crosswalk, data.current_location);
        to_current_crosswalk = geolib.getDistance(data.nearest_crosswalk, data.current_location);

        if((to_new_crosswalk < to_current_crosswalk || data.nearest_crosswalk.id === 0) && to_new_crosswalk < 100 ) data.nearest_crosswalk = crosswalk;
    });


    // If nearest crosswalk has changed -> alert SPWS
    if (current_nearest_crosswalk != data.nearest_crosswalk) {
        console.log(`${new Date().toISOString()}: Closer to crosswalk #${data.nearest_crosswalk.id}`.green);

        axios({
            method: 'POST',
            url: `http://localhost:3000/api/v1/pedestrian/${data.id}/near/${data.nearest_crosswalk.id}`,
        }).then( response => {
            console.log(response);
        }).catch( error => {
            console.log(error);
        });
    }
}





function sendLocation() {
    data.last_location  = data.current_location;
    data.current_location = location_simulator.getCurrentLocation();   
    console.log(new Date().toISOString() + `: Sending location to SPWS - Currently at (${data.current_location.latitude}, ${data.current_location.longitude})...`);

    // axios({
    //     method: 'POST',
    //     url: ``,
    //     data: {lon: lon, lat: lat}
    // }).then( response => {
    //     console.log(new Date().toISOString() + `: Got ${response.data.crosswalks.length} new crosswalks near my current location.`);
    //     //data.nearby_crosswalks = response.data.crosswalks
    // }).catch(error => {
    //     console.log(error);
    // });


    let valid = location_simulator.setNextLocation();
    if(!valid) { 
        console.log(`${new Date().toISOString()}: Trip is over. Shutting down...`.blue); 
        process.exit();
        // send that i'm done to server
    }
    
    if(data.nearest_crosswalk.id !== 0) check_crosswalk_crossed();
    check_nearest_crosswalk();
}


function requestNearestCrosswalksLocation() {
    lat = data.current_location.latitude,
    lon = data.current_location.longitude

    axios({
        method: 'POST',
        url: `http://localhost:3000/api/v1/pedestrian/${data.id}/location`,
        data: {lon: lon, lat: lat}
    }).then( response => {
        console.log(new Date().toISOString() + `: Got ${response.data.crosswalks.length} new crosswalks near my current location.`);
        //data.nearby_crosswalks = response.data.crosswalks
    }).catch(error => {
        console.log(error);
    })

}

function check_crosswalk_crossed() {
    center = geolib.getCenter([data.current_location, data.last_location]);
    distance = geolib.getDistance(data.current_location, data.last_location);

    if(geolib.isPointWithinRadius(data.nearest_crosswalk, center, distance/2)){
        console.log(`${new Date().toISOString()}: Crosswalk #${data.nearest_crosswalk.id} crossed`.green)
    }
}

