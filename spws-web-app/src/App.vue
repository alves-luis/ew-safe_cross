<template>
    <div>
        <div class="header text-center p-1">
            <h5>SafeCross</h5>
        </div>
        <div class="container-fluid px-5 pt-1">
            <app-map :crosswalks="crosswalks" class="map mt-3"></app-map>
            <hr>
            <h2 class="text-center">How it works</h2>
            <p>
                Don't know how it works? Just click on a crosswalk (the blue marker) and analyze
                the real time information about it. As you select one crosswalk the pedestrians are represented
                by the yellow markers as the vehicles by the green ones.
            </p>
            
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
                crosswalks: []
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
            });
        }
    }
</script>

<style>
    .map {
        height: 55vh;
    }

    .header {
        background-color:rgb(41, 41, 41);
    }

    .header h5 {
        color: aliceblue;
        font-size: 48px;
    }
</style>
