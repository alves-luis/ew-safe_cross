<template>
    <div class="row">
        <l-map class="col-lg-7"
               :maxZoom="map_settings.maxZoom"
               :minZoom="map_settings.minZoom"
               :zoom="map_settings.zoom"
               :center="map_settings.center"
               @update:center="centerUpdated">
            
            <l-tile-layer :url="map_settings.url"
                          :attribution="map_settings.attribution">
            </l-tile-layer>

            <div v-if="!active_crosswalk.id">
                <l-marker v-for="crosswalk in crosswalks"
                      :lat-lng="crosswalk.location"
                      :icon="markers.crosswalkIcon"
                      :key="crosswalk.id"
                      @click="setActiveCrosswalk(crosswalk)">
                </l-marker>
            </div>
            
            <div v-else>
                <!-- <l-marker :lat-lng="active_crosswalk.location"
                          :key="active_crosswalk.id"
                          :icon="markers.crosswalkIcon">
                </l-marker> -->
                
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
                    :radius="circle.pedestrian.radius"
                    :color="circle.pedestrian.color"
                    />
                <l-circle
                    :lat-lng="active_crosswalk.location"
                    :radius="circle.vehicle.radius"
                    :color="circle.vehicle.color"
                    />
            </div>

        </l-map>
        <div class="col-lg-5">
            <crosswalk v-if="active_crosswalk.id != 0"
                        :crosswalk="active_crosswalk"
                        @back="reset()">
            </crosswalk>
            <div v-else>
                <div class="px-2">
                    <div class="card vld-parent">
                        <h5 class="card-header">Crosswalk Search</h5>
                        <div class="card-body">
                            <p class="card-text">Enter the crosswalk ID: </p>
                            <div class="input-group">
                                <input type="text" class="form-control" placeholder="Crosswalk ID" v-model="search_id">
                                <div class="input-group-btn">
                                    <button class="btn btn-primary float-right ml-1" type="button" @click="search()">Search</button>
                                </div>
                            </div> 
                            <p class="text-danger" v-if="!has_found">There is no crosswalk with that ID.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
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
                    minZoom: 5,
                    maxZoom: 18,
                    zoom: 11,
                    center: [41.547, -8.406]
                },               
                markers: {
                    vehicleIcon: new L.Icon({
                        iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
                        iconSize: [19, 30],
                        iconAnchor: [10, 30],
                        popupAnchor: [1, -30]
                    }),
                    pedestrianIcon: new L.Icon({
                        iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
                        iconSize: [19, 30],
                        iconAnchor: [10, 30],
                        popupAnchor: [1, -30]
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
                        radius: 25
                    },
                    vehicle: {
                        color: 'green',
                        radius: 50
                    }
                },
                active_crosswalk: {
                    id: 0,
                    location: {},
                    current_pedestrians: [],
                    current_vehicles: []
                },
                search_id: "",
                has_found: true
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
            search() {
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

</style>
