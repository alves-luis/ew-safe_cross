// const express = require('express')
// const app = express()
// const port = 3000
const LocationSimulator = require('./location_simulator')
const geolib = require('geolib')
const request = require('request');
const colors = require('colors');

// Setup ---------------------------------------------------------
let data = {
    id: null,
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


// Login ---------------------------------------------------------
request.post("http://localhost:3000/v1/welcome/pedestrian", (err, res, body) => { // mudar para spws
    if(err) return console.log(err)
    
    console.log(new Date().toISOString() + ': Registered as Pedestrian with ID = ' + JSON.parse(res.body).id);
    data.id = JSON.parse(res.body).id
});



let location_simulator = new LocationSimulator()
console.log(new Date().toISOString() + ": Route calculated")



// Evaluate current location -------------------------------------
data.current_location = location_simulator.getCurrentLocation();

requestCrosswalksLocation();
check_nearest_crosswalk();

//request('spws - i am near this crosswalk')



function check_nearest_crosswalk() {
    let current_nearest_crosswalk = data.nearest_crosswalk;
    console.log(new Date().toISOString() + ': Calculating nearest crosswalk...');

    // Verify if nearest crosswalk is too far away now (>100m)
    let to_current_crosswalk = geolib.getDistance(data.nearest_crosswalk, data.current_location);

    if (to_current_crosswalk > 100 && data.nearest_crosswalk.id !== 0) {
        console.log(new Date().toISOString() + `: Too far away from crosswalk #${data.nearest_crosswalk.id} now`);
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
        console.log(new Date().toISOString() + `: Closer to crosswalk #${data.nearest_crosswalk.id}`);
        // Teste:
        // if(data.nearest_crosswalk.id == 2) {
        //     data.state = 'red';
        //     console.log(new Date().toISOString() + `: State changed to '${data.state}'`);
        // }

        // request.post(`http://localhost:3000/api/v1/pedestrian/${data.id}/near/${data.nearest_crosswalk.id}`, (err, res, body) => {
        //     if(err) return console.log(err)

        //     // falta ver o res
        // });
    }
}



// Send periodic location to SPWS --------------------------------
setInterval(() => {
    sendLocation();
}, 500)

function sendLocation() {
    data.last_location  = data.current_location;
    data.current_location = location_simulator.getCurrentLocation();   
    console.log(new Date().toISOString() + `: Sending location to SPWS - Currently at (${data.current_location.latitude}, ${data.current_location.longitude})...`);

    // request({
    //         method: 'POST',
    //         url: `http://localhost:3000/api/v1/pedestrian/${data.id}/near/${data.nearest_crosswalk.id}`, 
    //         body: {
    //             lat: data.current_location.latitude,
    //             lon: data.current_location.longitude
    //         }
    //     }, 
    //     (err, res, body) => {
    //         if(err) return console.log(err)

    //         // falta ver o res
    //     }
    // );

    let valid = location_simulator.setNextLocation();
    if(!valid) { 
        console.log(new Date().toISOString() + ": Trip is over. Shutting down..."); 
        process.exit();
        // send that i'm done to server
    }
    
    if(data.nearest_crosswalk.id !== 0) check_crosswalk_crossed();
    check_nearest_crosswalk();
}


// Request nearest crosswalks to SPWS --------------------------------
setInterval(() => {
    console.log(new Date().toISOString() + ": Request crosswalks");
    requestCrosswalksLocation();
}, 30000)


function requestCrosswalksLocation() {

    lat = data.current_location.latitude,
    lon = data.current_location.longitude

    request.get(`http://localhost:3001/v1/crosswalks/?lon=${lon}&lat=${lat}`, (err, res, body) => {
        if(err) return console.log(err)
        
        console.log(new Date().toISOString() + `: Got ${JSON.parse(res.body).crosswalks.length} new crosswalks`);
        //data.nearby_crosswalks = JSON.parse(res.body).crosswalks
    });
}

function check_crosswalk_crossed() {
    center = geolib.getCenter([data.current_location, data.last_location]);
    distance = geolib.getDistance(data.current_location, data.last_location);

    if(geolib.isPointWithinRadius(data.nearest_crosswalk, center, distance/2)){
        console.log(`${new Date().toISOString()}: Crosswalk #${data.nearest_crosswalk.id} crossed`.green)
    }
}

