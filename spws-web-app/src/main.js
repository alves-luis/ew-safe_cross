import Vue from 'vue'
import App from './App.vue'


// Leaflet
import { LMap, LTileLayer, LMarker, LCircle, LPopup } from 'vue2-leaflet';
import 'leaflet/dist/leaflet.css';

Vue.component('l-map', LMap);
Vue.component('l-tile-layer', LTileLayer);
Vue.component('l-marker', LMarker);
Vue.component('l-circle', LCircle);
Vue.component('l-popup', LPopup);

// Mock
import createMockServer from "./mock/server";

createMockServer();


new Vue({
  el: '#app',
  render: h => h(App)
})
