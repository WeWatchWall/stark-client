<template>
    <button class="btn btn-primary" v-on:click="load"> Hello {{ message }}! </button>
</template>

<style>
  @import './dist/browser.css';
</style>

<script lang="ts">
  import Vue from 'vue';

  export default Vue.extend({
    name: 'Main',
    data: () => {
      return {
        message: 'Weerld'
      };
    },
    methods: {
      load: async function () {
        debugger;
        let dyn = 'index.js'
        let StaticImport = await import(`./${dyn}`);
        StaticImport.default('test');
      }
    }
  });
</script>