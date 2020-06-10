<template>
    <div class="row">
        <l-map
               :maxZoom="map_settings.maxZoom"
               :minZoom="map_settings.minZoom"
               :zoom="map_settings.zoom"
               :center="map_settings.center"
               @update:center="centerUpdated">
            
            <l-tile-layer :url="map_settings.url"
                          :attribution="map_settings.attribution">
            </l-tile-layer>

            <l-control position="topleft">
                <button @click="search=!search">
                    <font-awesome-icon icon="search" />
                </button>
                <div v-if="search">
                    <div class="input-group">
                        <input type="text" class="mt-1" placeholder="Crosswalk ID" v-model="search_id">
                        <div class="input-group-btn">
                            <button class="btn btn-primary btn-sm ml-1" type="button" @click="searchCrosswalk()"><font-awesome-icon icon="search" /></button>
                        </div>
                    </div> 
                    <p class="text-danger" v-if="!has_found">There is no crosswalk with that ID.</p>
                </div>
            </l-control>


            <l-control position="bottomleft">                
                <div v-if="legend" class="popup p-3 rounded">
                    <p class="legend pl-2">
                        <img src="https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png" style="height: 1.5em">
                        <span class="pl-2">Crosswalk</span>
                    </p>
                    <p class="legend">
                        <img src="assets/pedestrian.png" style="height: 1.5em">
                        <span class="pl-2">Pedestrian</span>
                    </p>
                    <p class="legend">
                        <img src="assets/vehicle.png" style="height: 1.5em">
                        <span class="pl-2">Vehicle</span>
                    </p>
                    <p class="legend">
                        <img src="assets/pedestrian_range.png" style="height: 1.5em">
                        <span class="pl-2">Pedestrian range</span>
                    </p>
                    <p class="legend">
                        <img src="assets/vehicle_range.png" style="height: 1.5em">
                        <span class="pl-2">Vehicle range</span>
                    </p>
                </div>
                <button @click="legend=!legend">
                    Legend
                </button>
            </l-control>


            <div v-if="!active_crosswalk.id">
                <l-marker v-for="crosswalk in crosswalks"
                      :lat-lng="crosswalk.location"
                      :icon="markers.crosswalkIcon"
                      :key="crosswalk.id"
                      @click="setActiveCrosswalk(crosswalk)">
                </l-marker>
            </div>
            
            <div v-else>
                <l-marker v-for="pedestrian in active_crosswalk.current_pedestrians"
                          :key="pedestrian.id"
                          :lat-lng="pedestrian.location"
                          :icon="markers.pedestrianIcon">
                          <l-popup>{{pedestrian.id}}</l-popup>
                </l-marker>
                <l-marker v-for="vehicle in active_crosswalk.current_vehicles"
                          :key="vehicle.id"
                          :lat-lng="vehicle.location"
                          :icon="markers.vehicleIcon">
                          <l-popup>{{vehicle.id}}</l-popup>
                </l-marker>
                <l-circle
                    :lat-lng="active_crosswalk.location"
                    :radius="circle.vehicle.radius"
                    :color="circle.vehicle.color"
                />
                <l-circle
                    :lat-lng="active_crosswalk.location"
                    :radius="circle.pedestrian.radius"
                    :color="circle.pedestrian.color"
                />
                
            </div>

            <l-control position="topright" v-if="active_crosswalk.id != 0">
                <crosswalk :crosswalk="active_crosswalk"
                            @back="reset()">
                </crosswalk>
            </l-control>
            

        </l-map>        
    </div>

</template>

<script>
    import Crosswalk from "./Crosswalk";

    export default {
        name: "Map",
        props: ["crosswalks"],
        data () {
            return {
                map_settings: {
                    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                    attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors</a>',
                    minZoom: 10,
                    maxZoom: 18,
                    zoom: 13,
                    center: [41.547, -8.406]
                },               
                markers: {
                    vehicleIcon: new L.Icon({
                        iconUrl: './assets/vehicle.png',
                        iconSize: [12, 12],
                        iconAnchor: [6, 6],
                        popupAnchor: [1, -12]
                    }),
                    pedestrianIcon: new L.Icon({
                        iconUrl: './assets/pedestrian.png',
                        iconSize: [12, 12],
                        iconAnchor: [6, 6],
                        popupAnchor: [1, -12]
                    }),
                    crosswalkIcon: new L.Icon({
                        iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
                        iconSize: [25, 41],
                        iconAnchor: [12, 41],
                        popupAnchor: [1, -34],
                    })
                },
                circle: {
                    pedestrian: {
                        color: 'yellow',
                        radius: 20
                    },
                    vehicle: {
                        color: 'green',
                        radius: 40
                    }
                },
                active_crosswalk: {
                    id: 0,
                    location: {},
                    current_pedestrians: [],
                    current_vehicles: []
                },
                has_found: true,
                legend: false,
                search_id: "",
                search: false
            };
        },
        methods: {
            setActiveCrosswalk(crosswalk) {
                this.active_crosswalk.id = crosswalk.id;
                this.active_crosswalk.location = crosswalk.location;
                this.active_crosswalk.current_vehicles = [];
                this.active_crosswalk.current_pedestrians = [];
                this.map_settings.center = crosswalk.location;
            },
            searchCrosswalk() {
                var filtered = this.crosswalks.filter( crosswalk => crosswalk.id == this.search_id);
                if(filtered.length > 0) { 
                    this.setActiveCrosswalk(filtered[0]);
                    this.search_id = "";
                    this.has_found = true;
                }
                else {
                    this.has_found = false;
                }
            },
            reset() {
                this.active_crosswalk.id = 0
            },
            centerUpdated (center) {
                this.map_settings.center = center;
            }
        },
        components: {
            Crosswalk
        }
    }
</script>

<style scoped>

    .popup {
        background-color: white;
    }

    .legend {
        font-size: 0.9rem;
    }
</style>
