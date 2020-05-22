module.exports = class LocationSimulator{


    getCurrentLocation() {        
        return this.current_route[this.index]          
    }

    setNextLocation() {
        this.index += 1;

        if(this.index >= this.current_route.length) {
            return false;
        }
             
        return true;
    }

    constructor() {
        var random = Math.floor(Math.random() * routes.length);
        this.current_route = routes[random];
        this.index = 0;
    }
};


routes = [
    [
        { latitude: 41.54958, longitude: -8.43351 },
        { latitude: 41.54973, longitude: -8.43338 },
        { latitude: 41.54986, longitude: -8.43309 },
        { latitude: 41.55005, longitude: -8.43291 },
        { latitude: 41.55024, longitude: -8.43291 },
        { latitude: 41.55051, longitude: -8.43272 },
        { latitude: 41.55076, longitude: -8.43252 },
        { latitude: 41.55099, longitude: -8.4324 },
        { latitude: 41.55137, longitude: -8.43209 },
        { latitude: 41.5519, longitude: -8.43169 },
        { latitude: 41.55248, longitude: -8.43124 },
        { latitude: 41.55302, longitude: -8.43083 },
        { latitude: 41.55375, longitude: -8.43026 },
        { latitude: 41.55425, longitude: -8.42988 },
        { latitude: 41.55481, longitude: -8.42945 },
        { latitude: 41.55553, longitude: -8.4289 }
    ],
    [
        { latitude: 41.55639, longitude: -8.42819 },
        { latitude: 41.55689, longitude: -8.42729 },
        { latitude: 41.55713, longitude: -8.42622 },
        { latitude: 41.55744, longitude: -8.42481 },
        { latitude: 41.55773, longitude: -8.42381 },
        { latitude: 41.55816, longitude: -8.42298 },
        { latitude: 41.55858, longitude: -8.42234 },
        { latitude: 41.55897, longitude: -8.42176 },
        { latitude: 41.55965, longitude: -8.4207 },
        { latitude: 41.56012, longitude: -8.41998 } 
    ]
];