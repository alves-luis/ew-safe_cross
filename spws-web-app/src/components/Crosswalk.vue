<template>
    <div class="px-2">
        <div class="card vld-parent">
            <h5 class="card-header">Crosswalk #{{ crosswalk.id }}</h5>
            <loading :active.sync="isLoading"
                     :can-cancel="false"
                     :is-full-page="false"
                     loader="Dots"
                     color="#009c29"
                     background-color="#b5b5b5">
            </loading>
            <div class="card-body">
                <ul class="list-group list-group-flush">
                    <li class="list-group-item">
                        <h5 class="card-title">Real-Time Status</h5>
                        <p class="card-text"># pedestrians: {{ current_pedestrians.length }} </p>
                        <p class="card-text"># vehicles:  {{ current_vehicles.length }}</p>
                        <p class="card-text">Traffic light: </p>
                    </li>
                    <li class="list-group-item">
                        <h5 class="card-title">Today's Total Status</h5>
                        <p class="card-text">Total # pedestrians:</p>
                        <p class="card-text">Total # vehicles: </p>
                    </li>
                </ul>

                <button class="btn btn-primary float-right" type="button" @click="$emit('back')">Back</button>
            </div>
        </div>
    </div>

</template>

<script>
    import Loading from 'vue-loading-overlay';
    import 'vue-loading-overlay/dist/vue-loading.css';

    export default {
        name: "Crosswalk",
        props: {
            crosswalk: Object
        },
        data() {
            return {
                current_pedestrians: [],
                current_vehicles: [],
                isLoading: true,
            }
        },
        created() {
            this.isLoading = true;
            fetch(`/crosswalk/${this.$options.propsData.crosswalk.id}`)
                .then((response) => response.json())
                .then((obj) => {
                    this.crosswalk.current_vehicles = [];
                    this.crosswalk.current_pedestrians = [];
                    this.crosswalk.id = obj.crosswalk.id;
                    this.crosswalk.location = L.latLng(obj.crosswalk.latitude, obj.crosswalk.longitude);
                    if (obj.crosswalk.current_pedestrians) {
                        obj.crosswalk.current_pedestrians.forEach(pedestrian => {
                            this.crosswalk.current_pedestrians.push({
                                id: pedestrian.id,
                                location: L.latLng(pedestrian.latitude, pedestrian.longitude)
                            })
                        });
                    }
                    if (obj.crosswalk.current_vehicles) {
                        obj.crosswalk.current_vehicles.forEach(vehicle => {
                            this.crosswalk.current_vehicles.push({
                                id: vehicle.id,
                                location: L.latLng(vehicle.latitude, vehicle.longitude)
                            })
                        });
                    }
                    this.current_pedestrians = this.crosswalk.current_pedestrians;
                    this.current_vehicles = this.crosswalk.current_vehicles;
                    this.isLoading = false;
                });
        },
        components: {
            Loading
        }
    }
</script>

<style scoped>
    .info {
        height: 45vh;
        width: 45vw;
    }
</style>
