<template>

    <div class="d-flex" id="wrapper">

        <!-- Sidebar -->
        <div class="bg-dark border-right" id="sidebar-wrapper">
            <div class="sidebar-heading p-3 logo">
                <img class="logo" src="assets/logo.png">
            </div>
            <div class="list-group list-group-flush">
                <a href="#" class="list-group-item list-group-item-action bg-dark text-white">
                    <font-awesome-icon icon="map-marked-alt" class="mr-2"/> Map
                </a>
                <a href="#" class="list-group-item list-group-item-action bg-dark text-white">
                    <font-awesome-icon icon="info-circle" class="mr-2"/> About
                </a>
            </div>
        </div>
        <!-- /#sidebar-wrapper -->

        <!-- Page Content -->
        <div id="page-content-wrapper" style="width: 100%">
            <div class="container-fluid">
                    <app-map :crosswalks="crosswalks" class="map"></app-map>
                    <!-- <hr>
                    <h2 class="text-center">How it works</h2>
                    <p>
                        Don't know how it works? Just click on a crosswalk (the blue marker) and analyze
                        the real time information about it. As you select one crosswalk the pedestrians are represented
                        by the yellow markers as the vehicles by the green ones.
                    </p>  -->
                    
            </div>
        <!-- /#page-content-wrapper -->
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

<style scoped>
    .map {
        height: 100vh;
        width: 85vw;
    }

    .logo {
        width: 100%;
    }

    .header {
        background-color:rgb(41, 41, 41);
    }

    .header h5 {
        color: aliceblue;
        font-size: 48px;
    }

    .list-group-item {
        font-size: 1.25rem;
    }
</style>
