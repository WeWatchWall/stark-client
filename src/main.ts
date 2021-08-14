import Vue from 'vue';
import MainComponent from './main.vue';

export const Main = async (): Promise<void> => {

  new Vue({
    el: '#app',
    render: h => h(MainComponent),
});
}
