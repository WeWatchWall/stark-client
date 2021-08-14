<template>
    <b-alert show> Hello {{ message }}! </b-alert>
</template>

<style>
  @import 'node_modules/bootstrap/dist/css/bootstrap.css';
  @import 'node_modules/bootstrap-vue/dist/bootstrap-vue.css';
</style>

<script lang="ts">
  import Vue from 'vue';


  export default Vue.extend({
    name: 'Main',
    data: () => {
      return {
        message: 'Weerld'
      };
    }
  });
</script>