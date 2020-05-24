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

    constructor(simulation) {
        if (simulation === undefined) simulation = Math.floor(Math.random() * routes.length);
        console.log(new Date().toISOString() + ": Chosen route = " + simulation)
        this.current_route = routes[simulation];
        this.index = 0;
    }

};


routes = [
    [   // Aptiv -> Hotel Joao XXI - Simulação veículo 1
        { latitude: 41.53453 , longitude: -8.43728 },
        { latitude: 41.53461 , longitude: -8.43737 },
        { latitude: 41.53472 , longitude: -8.43733 },
        { latitude: 41.53501 , longitude: -8.43715 },
        { latitude: 41.53543 , longitude: -8.43679 },
        { latitude: 41.53562 , longitude: -8.43662 },
        { latitude: 41.53588 , longitude: -8.4364 },
        { latitude: 41.53632 , longitude: -8.43602 },
        { latitude: 41.53644 , longitude: -8.43592 },
        { latitude: 41.53684 , longitude: -8.43557 },
        { latitude: 41.53704 , longitude: -8.4354 },
        { latitude: 41.53731 , longitude: -8.43517 },
        { latitude: 41.53752 , longitude: -8.43498 },
        { latitude: 41.53792 , longitude: -8.43463 },
        { latitude: 41.53831 , longitude: -8.43431 },
        { latitude: 41.53851 , longitude: -8.43415 },
        { latitude: 41.53871 , longitude: -8.43398 },
        { latitude: 41.53931 , longitude: -8.43358 },
        { latitude: 41.53944 , longitude: -8.43342 },
        { latitude: 41.53975 , longitude: -8.43319 },
        { latitude: 41.54014 , longitude: -8.43296 },
        { latitude: 41.54046 , longitude: -8.43275 },
        { latitude: 41.54077 , longitude: -8.43254 },
        { latitude: 41.54096 , longitude: -8.4324 },
        { latitude: 41.54142 , longitude: -8.43202 },
        { latitude: 41.54176 , longitude: -8.43175 },
        { latitude: 41.54221 , longitude: -8.43143 },
        { latitude: 41.54242 , longitude: -8.43104 },
        { latitude: 41.54267 , longitude: -8.43059 },
        { latitude: 41.5429 , longitude: -8.43009 },
        { latitude: 41.54322 , longitude: -8.42935 },
        { latitude: 41.54342 , longitude: -8.42885 },
        { latitude: 41.54358 , longitude: -8.42847 },
        { latitude: 41.54382 , longitude: -8.42789 },
        { latitude: 41.54413 , longitude: -8.42713 },
        { latitude: 41.54432 , longitude: -8.42653 },
        { latitude: 41.54447 , longitude: -8.42586 },
        { latitude: 41.5445 , longitude: -8.42567 },
        { latitude: 41.54464 , longitude: -8.42506 },
        { latitude: 41.54478 , longitude: -8.42444 },
        { latitude: 41.54491 , longitude: -8.42383 },
        { latitude: 41.54513 , longitude: -8.4229 },
        { latitude: 41.54531 , longitude: -8.42214 },
        { latitude: 41.54543 , longitude: -8.42167 },
        { latitude: 41.54554 , longitude: -8.42118 },
        { latitude: 41.54582 , longitude: -8.42005 },
        { latitude: 41.54612 , longitude: -8.41924 }

    ],
    [ // Gostinho da Manha -> SuperDecor Braga - Simulação pedestre 1
        { latitude: 41.54788, longitude: -8.40729 },
        { latitude: 41.54785, longitude: -8.40727 },
        { latitude: 41.54780, longitude: -8.40724 },
        { latitude: 41.54775, longitude: -8.40722 },
        { latitude: 41.54770, longitude: -8.40718 },
        { latitude: 41.54766, longitude: -8.40714 },
        { latitude: 41.54767, longitude: -8.40709 },
        { latitude: 41.54770, longitude: -8.40701 },
        { latitude: 41.54773, longitude: -8.40693 },
        { latitude: 41.54768, longitude: -8.40688 },
        { latitude: 41.54769, longitude: -8.40680 },
        { latitude: 41.54772, longitude: -8.40673 },
        { latitude: 41.54774, longitude: -8.40666 },
        { latitude: 41.54776, longitude: -8.40655 },
        { latitude: 41.54777, longitude: -8.40645 },
        { latitude: 41.54778, longitude: -8.40637 },
        { latitude: 41.54776, longitude: -8.40626 },
        { latitude: 41.54773, longitude: -8.40619 }        
    ]
];