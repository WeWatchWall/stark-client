import Vue from 'vue';
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue';

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import MainComponent from './main.vue';

// TODO: Use "vuex": "^3.6.2" for event-states.

export const Main = async (): Promise<void> => {
  Vue.use(BootstrapVue);
  Vue.use(IconsPlugin);

  new Vue({
    el: '#app',
    render: h => h(MainComponent),
  });

}
