<template>
    <b-alert show> Hello {{ message }}! </b-alert>
</template>

<style>
  @import './dist/index.css';
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
    mounted: async () => {
        
    }
  });
</script>