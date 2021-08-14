import Vue from 'vue';
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue';

import MainComponent from './main.vue';

export const Main = async (): Promise<void> => {
  Vue.use(BootstrapVue);
  Vue.use(IconsPlugin);

  new Vue({
    el: '#app',
    render: h => h(MainComponent),
  });
}
