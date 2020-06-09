<template>
    <div class="p-3">
        <div class="card vld-parent border border-secondary rounded">
            <h5 class="card-header bg-dark text-white ">Crosswalk #{{ crosswalk_id }}</h5>
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
                        <p class="card-text"># pedestrians: {{ crosswalk.current_pedestrians.length }} </p>
                        <p class="card-text"># vehicles:  {{ crosswalk.current_vehicles.length }}</p>
                        <div>
                            <span class="card-text">Traffic light: </span>
                            <div class="traffic rounded">
                                <span class="dot dot-green" :class="{active: light=='green'}"></span>
                                <span class="dot dot-yellow" :class="{active: light=='yellow'}"></span>
                                <span class="dot dot-red" :class="{active: light=='red'}"></span> 
                            </div>                                                
                        </div>                      
                    </li>
                    <li class="list-group-item">
                        <h5 class="card-title">Last 24h' Status</h5>
                        <p class="card-text">Total # pedestrians: {{ total_pedestrians }}</p>
                        <p class="card-text">Total # vehicles: {{ total_vehicles }}</p>
                    </li>
                </ul>

                <button class="btn btn-secundary btn-sm float-right border" type="button" @click="close">Back</button>


            </div>
        </div>
    </div>

</template>

<script>
    import Loading from 'vue-loading-overlay';
    import 'vue-loading-overlay/dist/vue-loading.css';
    import Stomp from 'stompjs';
    import truncate from 'truncate';

    let URL = process.env.VUE_APP_URL;
    let PORT = process.env.VUE_APP_PORT;
    let PATH = process.env.VUE_APP_PATH;
    let PEDESTRIAN_UPDATE = parseInt(process.env.VUE_APP_PEDESTRIAN_UPDATE);
    let VEHCILE_UPDATE = parseInt(process.env.VUE_APP_VEHICLE_UPDATE);

    export default {
        name: "Crosswalk",
        props: {
            crosswalk: Object
        },
        data() {
            return {
                light: "",
                total_pedestrians: 0,
                total_vehicles: 0,
                isLoading: true,
                stompClient: undefined,
                webSocket: undefined,
                pedestrian_exchange_id: undefined,
                crosswalk_exchange_id: undefined
            }
        },
        mounted() {
            // Stomp
            this.webSocket = new WebSocket(`ws://${URL}:${PORT}/${PATH}`);
            this.stompClient = Stomp.over(this.webSocket);
            this.stompClient.connect('guest', 'guest', () => console.log('Success'), () => console.log('Error'));

            // Request crosswalk data
            this.isLoading = true;
            fetch(`http://localhost:3000/api/v1/crosswalks/${this.crosswalk.id}`)
            .then((response) => response.json())
            .then((obj) => {
                this.crosswalk.current_vehicles = [];
                this.crosswalk.current_pedestrians = [];

                this.light = obj.light;
                this.total_pedestrians = obj.num_pedestrians;
                this.total_vehicles = obj.num_vehicles;

                // Set interval to remove old pins
                var vm = this;
                setInterval(function(){
                    vm.crosswalk.current_pedestrians = vm.crosswalk.current_pedestrians.filter(p => new Date() - p.date < PEDESTRIAN_UPDATE + 1000)
                    vm.crosswalk.current_vehicles = vm.crosswalk.current_vehicles.filter(v => new Date() - v.date < VEHCILE_UPDATE + 1000)
                }, 1000);

                this.subscribeExchanges();          
                
                this.isLoading = false;

            })
            .catch(error => console.log(error));
        },
        components: {
            Loading
        },
        methods: {
            subscribeExchanges() {
                this.crosswalk_exchange_id = this.stompClient.subscribe(`/exchange/public/${this.crosswalk.id}.status.short`, this.processCrosswalkExchange, (error) => console.log(error));
                this.pedestrian_exchange_id = this.stompClient.subscribe(`/exchange/public/${this.crosswalk.id}.pedestrian.location`, this.processPedestrianExchange, (error) => console.log(error));
                this.vehicle_exchange_id = this.stompClient.subscribe(`/exchange/public/${this.crosswalk.id}.vehicle.location`, this.processExchangeResponse, this.processExchangeError);
            },

            processPedestrianExchange(msg) {
                var data = JSON.parse(msg.body);

                // Add or update pedestrians nearby
                var index = this.crosswalk.current_pedestrians.findIndex(element => element.id == data.id)    
                if(index != -1) {
                    this.crosswalk.current_pedestrians[index] = {
                        id: data.id,
                        location: L.latLng(data.latitude, data.longitude),
                        date: new Date()
                    }
                }
                else {
                    this.crosswalk.current_pedestrians.push( {
                        id: data.id,
                        location: L.latLng(data.latitude, data.longitude),
                        date: new Date()
                    })
                }
                       
            },

            processCrosswalkExchange(msg) {
                var data = JSON.parse(msg.body);
                this.light = data.light;  
            },

            close() {                
                this.pedestrian_exchange_id.unsubscribe();
                this.crosswalk_exchange_id.unsubscribe();
                this.webSocket.close();
                this.$emit('back');
            }
        },
        computed: {
            crosswalk_id() {
                return truncate(this.crosswalk.id, 8)
            }
        }
    }
</script>

<style scoped>

    .card-body {
        padding: 0.9rem 0.5rem !important;
        font-size: 0.9rem;
    }

    .dot {
        height: 1rem;
        width: 1rem;
        border-radius: 50%;
        display: inline-block;
        opacity: 0.2;
    }

    .dot-green {
        background-color: green;
    }

    .dot-yellow {
        background-color: yellow;
    }

    .dot-red {
        background-color: red;
    }  

    .active {
        opacity: 1 !important;
        border-style: solid;
        border-width: 1px;
    }

    .traffic {
        display: inline-block;
        background: dimgray;
        padding: 0.4em 1em 0 1em;
    }

</style>
