// const express = require('express')
// const app = express()
// const port = 3000
const LocationSimulator = require('./location_simulator')
const geolib = require('geolib')

// Setup ---------------------------------------------------------
let data = {
    id: null,
    location: {
        latitude: 1,
        longitude: 1
    },
    nearby_crosswalks: [
        {
            id: 1, 
            latitude: 2, 
            longitude:2
        }
    ],
    nearest_crosswalk: {}
}


// Login ---------------------------------------------------------
// fetch("/welcome/pedestrian")
// .then(response => {
//     data.id = response.json().id
//     console.log(new Date().toISOString() + ": New pedestrian with ID = " + data.id)
// })


let location_simulator = new LocationSimulator()
console.log(new Date().toISOString() + ": " + location_simulator.current_route)

// Evaluate current location -------------------------------------
data.location = location_simulator.getCurrentLocation();
//request('spws - i am near this crosswalk')

function check_nearest_crosswalk() {
    let current_nearest_crosswalk = data.nearest_crosswalk;
    console.log(new Date().toISOString() + ': Calculating nearest crosswalk...');

    data.nearby_crosswalks.forEach( crosswalk => {
        to_new_crosswalk = geolib.getDistance(crosswalk, data.location);
        to_current_crosswalk = geolib.getDistance(data.nearest_crosswalk, data.location);
        
        if(to_new_crosswalk < to_current_crosswalk) data.nearest_crosswalk = crosswalk;
    });

    if (current_nearest_crosswalk != data.nearest_crosswalk) {
        console.log(new Date().toISOString() + `: Closer to ${data.nearest_crosswalk.id}`)
    //     fetch('spws - i am far away id_crosswalk_antiga + localizaçao') ou entao um request e um fetch separados que assim usamos o mesmo endpoint para o fetch
    //     .then(response => {
                    
    // } );
    }
}



// Send periodic location to SPWS --------------------------------
setInterval(() => {
    sendLocation();
}, 2000)

function sendLocation() {
    current_location = location_simulator.getCurrentLocation();
    console.log(new Date().toISOString() + `: Sending location to SPWS - Currently at (${current_location.latitude}, ${current_location.longitude})...`);

    let valid = location_simulator.setNextLocation();
    if(!valid) { 
        console.log(new Date().toISOString() + ": Trip is over. Shutting down..."); 
        process.exit();
        // send that i'm done to server
    }
    check_nearest_crosswalk();
}


// Request nearest crosswalks to SPWS --------------------------------
setInterval(() => {
    requestCrosswalksLocation();
}, 30000)

function requestCrosswalksLocation() {
    // payload = {
    //     id: data.id,
    //     latitude: data.location.latitude,
    //     longitude: data.location.longitude
    // }

    // fetch('url do spws', {
    //     method: 'POST',
    //     headers: {
    //       'Accept': 'application/json',
    //       'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify(payload)
    // })
    // .then(response => {
    //     data.nearby_crosswalks = response.json();
    // });
}
