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
    [   // Cantina -> Gym UM - Veículo 0
        {latitude: 41.56168, longitude: -8.39880},
        {latitude: 41.56169, longitude: -8.39876},
        {latitude: 41.56170, longitude: -8.39868},
        {latitude: 41.56171, longitude: -8.39864},
        {latitude: 41.56171, longitude: -8.39860},
        {latitude: 41.56172, longitude: -8.39856},
        {latitude: 41.56173, longitude: -8.39846},
        {latitude: 41.56174, longitude: -8.39841},
        {latitude: 41.56175, longitude: -8.39836},
        {latitude: 41.56176, longitude: -8.39830},
        {latitude: 41.56176, longitude: -8.39824},
        {latitude: 41.56177, longitude: -8.39821},
        {latitude: 41.56178, longitude: -8.39816},
        {latitude: 41.56178, longitude: -8.39811},
        {latitude: 41.56179, longitude: -8.39806},
        {latitude: 41.56179, longitude: -8.39801},
        {latitude: 41.56181, longitude: -8.39794},
        {latitude: 41.56182, longitude: -8.39789},
        {latitude: 41.56182, longitude: -8.39783},
        {latitude: 41.56183, longitude: -8.39777},
        {latitude: 41.56184, longitude: -8.39771},
        {latitude: 41.56184, longitude: -8.39768},
        {latitude: 41.56185, longitude: -8.39761},
        {latitude: 41.56186, longitude: -8.39753},
        {latitude: 41.56187, longitude: -8.39749},
        {latitude: 41.56188, longitude: -8.39745},
        {latitude: 41.56188, longitude: -8.39740},
        {latitude: 41.56189, longitude: -8.39732},
        {latitude: 41.56190, longitude: -8.39728},
        {latitude: 41.56190, longitude: -8.39723},
        {latitude: 41.56191, longitude: -8.39718}
    ],
    [   // Aptiv -> Hotel Joao XXI - Random 1
        { latitude: 41.53453 , longitude: -8.43728 },
        { latitude: 41.53461 , longitude: -8.43737 },
        { latitude: 41.53472 , longitude: -8.43733 },
        { latitude: 41.53501 , longitude: -8.43715 },
        { latitude: 41.53543 , longitude: -8.43679 },
        { latitude: 41.53562 , longitude: -8.43662 },
        { latitude: 41.53588 , longitude: -8.4364 },
        { latitude: 41.53562 , longitude: -8.43662 },
        { latitude: 41.53543 , longitude: -8.43679 },
        { latitude: 41.53501 , longitude: -8.43715 },
        { latitude: 41.53472 , longitude: -8.43733 },
        { latitude: 41.53461 , longitude: -8.43737 },
        { latitude: 41.53453 , longitude: -8.43728 },

    ],
    [ // Gostinho da Manha -> SuperDecor Braga - Random 2
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