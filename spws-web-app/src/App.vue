<template>
    <div>
        <div class="container-fluid px-5 pt-1">
            <div class="card">
                <h5 class="card-header text-center header">SafeCross</h5>
                <div class="card-body">

                    <app-map :crosswalks="crosswalks" :center="center" class="map"></app-map>
                    <hr>
                    <h2>How it works</h2>
                    <p>
                        Don't know how it works? Just click on a crosswalk (the blue marker) and analyze
                        the real time information about it. As you select one crosswalk the pedestrians are represented
                        by the yellow markers as the vehicles by the green ones.
                    </p>
                </div>
            </div>
        </div>
    </div>

</template>

<script>
    import Map from "./components/Map";

    export default {
        components: {
            'app-map': Map
        },
        data() {
            return {
                crosswalks: [],
                center: undefined
            }
        },
        beforeCreate() {
            fetch("/crosswalk")
            .then((response) => response.json())
            .then((crosswalks) => {
                crosswalks.crosswalks.forEach(crosswalk => {
                    this.crosswalks.push({
                        id: crosswalk.id,
                        location: L.latLng(crosswalk.latitude, crosswalk.longitude)
                    })
                })
                this.center = this.crosswalks[0].location;
            });
        }
    }
</script>

<style>
    .map {
        height: 55vh;
    }

    .header {
        font-size: 48px;
    }
</style>
