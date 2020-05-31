import Vue from 'vue'
import App from './App.vue'


// Leaflet
import { LMap, LTileLayer, LMarker } from 'vue2-leaflet';
import 'leaflet/dist/leaflet.css';

Vue.component('l-map', LMap);
Vue.component('l-tile-layer', LTileLayer);
Vue.component('l-marker', LMarker);


// Mock
import createMockServer from "./mock/server";

createMockServer();


// Stomp
import VueStomp from "vue-stomp"

Vue.use(VueStomp, "http://localhost:15674/ws");


new Vue({
  el: '#app',
  render: h => h(App)
})
