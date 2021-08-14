<template>
    <b-alert show> Hello {{ message }}! </b-alert>
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
    }
  });
</script>