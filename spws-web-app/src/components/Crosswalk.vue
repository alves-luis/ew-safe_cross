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
                        <p class="card-text"># pedestrians: {{ crosswalk.current_pedestrians.length }} </p>
                        <p class="card-text"># vehicles:  {{ crosswalk.current_vehicles.length }}</p>
                        <p class="card-text">Traffic light: {{ light }}</p>
                    </li>
                    <li class="list-group-item">
                        <h5 class="card-title">Today's Total Status</h5>
                        <p class="card-text">Total # pedestrians:</p>
                        <p class="card-text">Total # vehicles: </p>
                    </li>
                </ul>

                <button class="btn btn-primary float-right" type="button" @click="close">Back</button>
            </div>
        </div>
    </div>

</template>

<script>
    import Loading from 'vue-loading-overlay';
    import 'vue-loading-overlay/dist/vue-loading.css';
    import Stomp from 'stompjs';

    export default {
        name: "Crosswalk",
        props: {
            crosswalk: Object
        },
        data() {
            return {
                light: "",
                isLoading: true,
                stompClient: undefined,
                webSocket: undefined,
                pedestrian_exchange_id: undefined,
                crosswalk_exchange_id: undefined
            }
        },
        mounted() {
            // Stomp
            this.webSocket = new WebSocket('ws://localhost:15674/ws');
            this.stompClient = Stomp.over(this.webSocket);
            this.stompClient.connect('guest', 'guest', () => console.log('Success'), () => console.log('Error'));

            // Request crosswalk data
            this.isLoading = true;
            fetch(`/crosswalk/${this.crosswalk.id}`)
                .then((response) => response.json())
                .then((obj) => {
                    this.crosswalk.current_vehicles = [];
                    this.crosswalk.current_pedestrians = [];

                    this.crosswalk.id = obj.crosswalk.id;
                    this.crosswalk.location = L.latLng(obj.crosswalk.latitude, obj.crosswalk.longitude);

                    this.isLoading = false;

                    // Set interval to remove old pins
                    var vm = this;
                    setInterval(function(){
                        vm.crosswalk.current_pedestrians = vm.crosswalk.current_pedestrians.filter(p => new Date() - p.date < 2500)
                        //vm.crosswalk.current_vehicles = vm.crosswalk.current_vehicles.filter(v => new Date() - v.date < 2000)
                    }, 2500);

                    this.subscribeExchange();                  
                });
        },
        components: {
            Loading
        },
        methods: {
            subscribeExchange() {
                this.pedestrian_exchange_id = this.stompClient.subscribe(`/exchange/public/${this.crosswalk.id}.pedestrian.location`, this.processPedestrianExchange, this.processExchangeError);
                this.crosswalk_exchange_id = this.stompClient.subscribe(`/exchange/public/${this.crosswalk.id}.crosswalk.short`, this.processCrosswalkExchange, this.processExchangeError);
                console.log("asdfsadfasdfasdf asdf asdf sadf ", this.crosswalk_exchange_id)
                //this.pedestrian_exchange_id = this.stompClient.subscribe(`/exchange/public/${this.crosswalk.id}.vehicle.location`, this.processExchangeResponse, this.processExchangeError);
            },

            processPedestrianExchange(msg) {
                var data = JSON.parse(msg.body);

                // Add or update pedestrians nearby
                var index = this.crosswalk.current_pedestrians.findIndex(element => element.id == data.id)
                // this.crosswalk.current_pedestrians.splice(index, 1, {
                //     id: data.id,
                //     location: L.latLng(data.latitude, data.longitude),
                //     date: new Date()
                // })    
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

            processCrossalkExchange(msg) {
                var data = JSON.parse(msg.body);

                console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!", data);
                       
            },

            processExchangeError(error) {
                console.log(error);
            },

            close() {                
                this.pedestrian_exchange_id.unsubscribe();
                this.webSocket.close();
                this.$emit('back');
            }
        }
    }
</script>

<style scoped>
    .info {
        height: 45vh;
        width: 45vw;
    }
</style>
