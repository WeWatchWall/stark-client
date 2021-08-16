<template>
    <b-alert show> Hello {{ message }}! </b-alert>
</template>

<style>
  @import './dist/index.css';
</style>

<script lang="ts">
  import Vue from 'vue';
  import { NodeBootstrap } from './browser/services/nodeBootstrap';
  import config from '../config.js';

  export default Vue.extend({
    name: 'Main',
    data: () => {
      return {
        message: 'Weerld'
      };
    },
    mounted: async () => {
      let dyn = 'browser_module.js'
      let StaticImport = await import(`./${dyn}`);
      StaticImport.default('test');

        /* #region  Declare the schemas. */
        // let userDbSchema = [
        //   { singular: 'packageConfig', plural: 'packageConfigs' },
        //   {
        //     singular: 'userConfig', plural: 'userConfigs',
        //     relations: {
        //       nodeConfigs: { hasMany: 'nodeConfig' }
        //     }
        //   },
        //   { singular: 'nodeConfig', plural: 'nodeConfigs', relations: { userConfig: { belongsTo: 'userConfig' } } }
        // ];
        // let nodeDbSchema = [
        //   { singular: 'podConfig', plural: 'podConfigs' },
        //   {
        //     singular: 'userConfig', plural: 'userConfigs',
        //     relations: {
        //       nodeConfigs: { hasMany: 'nodeConfig' }
        //     }
        //   },
        //   { singular: 'nodeConfig', plural: 'nodeConfigs', relations: { userConfig: { belongsTo: 'userConfig' } } }
        // ];
        // let serviceDbSchema = [
        //   { singular: 'request', plural: 'requests' },
        //   { singular: 'response', plural: 'responses' }
        // ];
        /* #endregion */

        /* #region  Initializing the environment properties. */
        let nodeBootstrapService = new NodeBootstrap();
        await nodeBootstrapService.init();
        /* #endregion */

        console.log(JSON.stringify(config));
    }
  });
</script>