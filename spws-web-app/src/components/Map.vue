<template>
    <div class="row">
        <l-map class="col-lg-7"
               :maxZoom="map_settings.maxZoom"
               :minZoom="map_settings.minZoom"
               :zoom="map_settings.zoom"
               :center="center">
            <l-tile-layer :url="map_settings.url"
                          :attribution="map_settings.attribution"
                          :zoom="map_settings.zoom">
            </l-tile-layer>
            <l-marker v-if="!active_crosswalk.id"
                      v-for="crosswalk in crosswalks"
                      :lat-lng="crosswalk.location"
                      :icon="markers.crosswalkIcon"
                      :key="crosswalk.id"
                      @click="setActiveCrosswalk(crosswalk)">
            </l-marker>
            <div v-if="active_crosswalk.id">
                <l-marker :lat-lng="active_crosswalk.location"
                          :key="active_crosswalk.id"
                          :icon="markers.crosswalkIcon">
                </l-marker>
                <l-marker v-for="pedestrian in active_crosswalk.current_pedestrians"
                          :key="pedestrian.id"
                          :lat-lng="pedestrian.location"
                          :icon="markers.pedestrianIcon">
                </l-marker>
                <l-marker v-for="vehicle in active_crosswalk.current_vehicles"
                          :key="vehicle.id"
                          :lat-lng="vehicle.location"
                          :icon="markers.vehicleIcon">
                </l-marker>
            </div>

        </l-map>
        <crosswalk class="col-lg-5"
                   v-if="active_crosswalk.id"
                   :crosswalk="active_crosswalk"
                   @back="active_crosswalk.id=0">
        </crosswalk>
    </div>

</template>

<script>
    import Crosswalk from "./Crosswalk";

    export default {
        name: "Map",
        props: ["crosswalks", "center"],
        data () {
            return {
                map_settings: {
                    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                    attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors</a>',
                    zoom: 13,
                    minZoom: 5,
                    maxZoom: 18
                },
                markers: {
                    vehicleIcon: new L.Icon({
                        iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
                        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                        iconSize: [25, 41],
                        iconAnchor: [12, 41],
                        popupAnchor: [1, -34],
                        shadowSize: [41, 41]
                    }),
                    pedestrianIcon: new L.Icon({
                        iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
                        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                        iconSize: [25, 41],
                        iconAnchor: [12, 41],
                        popupAnchor: [1, -34],
                        shadowSize: [41, 41]
                    }),
                    crosswalkIcon: new L.Icon({
                        iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
                        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                        iconSize: [25, 41],
                        iconAnchor: [12, 41],
                        popupAnchor: [1, -34],
                        shadowSize: [41, 41]
                    })
                },
                active_crosswalk: {
                    id: 0,
                    location: {}
                }
            };
        },
        methods: {
            setActiveCrosswalk(crosswalk) {
                this.active_crosswalk.id = crosswalk.id;
                this.active_crosswalk.location = crosswalk.location;
                this.active_crosswalk.current_vehicles = [];
                this.active_crosswalk.current_pedestrians = [];
                this.map_settings.zoom = 17;
                this.center = crosswalk.location;
            }
        },
        components: {
            Crosswalk
        }
    }
</script>

<style scoped>

</style>
