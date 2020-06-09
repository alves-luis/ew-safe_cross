<template>

    <div class="d-flex" id="wrapper">

        <!-- Sidebar -->
        <div class="bg-dark border-right" id="sidebar-wrapper">
            <div class="sidebar-heading p-3 logo">
                <img class="logo" src="assets/logo.png">
            </div>
            <div class="list-group list-group-flush">
                <button @click="tab='map'" class="list-group-item list-group-item-action bg-dark text-white">
                    <font-awesome-icon icon="map-marked-alt" class="mr-2"/> Map
                </button>
                <button @click="tab='about'" class="list-group-item list-group-item-action bg-dark text-white">
                    <font-awesome-icon icon="info-circle" class="mr-2"/> About
                </button>
            </div>
        </div>

        <!-- Page Content -->
        <div id="page-content-wrapper" style="width: 100%">
            <div class="container-fluid">
                <app-map v-if="tab==='map'" :crosswalks="crosswalks" class="map"></app-map> 
                <app-about v-else class="map bg-dark"></app-about>                  
            </div>
        </div>
    </div>

</template>

<script>
    import Map from "./components/Map";
    import About from "./components/About"

    export default {
        components: {
            'app-map': Map,
            'app-about': About
        },
        data() {
            return {
                crosswalks: [],
                tab: 'map'
            }
        },
        beforeCreate() {
            fetch("http://localhost:3000/api/v1/crosswalks")
            .then((response) => response.json())
            .then((crosswalks) => {
                crosswalks.crosswalks.forEach(crosswalk => {
                    this.crosswalks.push({
                        id: crosswalk.id,
                        location: L.latLng(crosswalk.lat, crosswalk.lon)
                    })
                })
            })
            .catch(err => console.log(err));
            
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

    .list-group-item {
        font-size: 1.25rem;
    }

</style>
