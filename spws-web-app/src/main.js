import Vue from 'vue'
import App from './App.vue'


// Leaflet
import { LMap, LTileLayer, LMarker, LCircle, LPopup, LControl } from 'vue2-leaflet';
import 'leaflet/dist/leaflet.css';

Vue.component('l-map', LMap);
Vue.component('l-tile-layer', LTileLayer);
Vue.component('l-marker', LMarker);
Vue.component('l-circle', LCircle);
Vue.component('l-popup', LPopup);
Vue.component('l-control', LControl);


// FontAwesome
import { library } from '@fortawesome/fontawesome-svg-core'
import { faSearch, faMapMarkedAlt, faInfoCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(faSearch, faMapMarkedAlt, faInfoCircle)

Vue.component('font-awesome-icon', FontAwesomeIcon)


// Mock
import createMockServer from "./mock/server";

createMockServer();


new Vue({
  el: '#app',
  render: h => h(App)
})
