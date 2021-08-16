<template>
    <b-alert show> Hello {{ message }}! </b-alert>
</template>

<style>
  @import './dist/index.css';
</style>

<script lang="ts">
  import Vue from 'vue';
  import { NodeBootstrap } from './browser/services/nodeBootstrap';
  import { Database } from './shared/objectmodels/database';
  import { UserAuth } from './browser/objectmodels/userAuth';
  import { UserConfig } from './shared/objectmodels/userConfig';
  import { NodeUserLean } from './browser/objectmodels/nodeUserLean';
  import { NodeConfig } from './browser/objectmodels/nodeConfig';
  import config from '../config.js';

  export default Vue.extend({
    name: 'Main',
    data: () => {
      return {
        message: 'Weerld'
      };
    },
    mounted: async () => {
      // let dyn = 'browser_module.js'
      // let StaticImport = await import(`./${dyn}`);
      // StaticImport.default('test');

        /* #region  Declare the schemas. */
        let userDbSchema = [
          { singular: 'packageConfig', plural: 'packageConfigs' },
          {
            singular: 'userConfig', plural: 'userConfigs',
            relations: {
              nodeConfigs: { hasMany: 'nodeConfig' }
            }
          },
          { singular: 'nodeConfig', plural: 'nodeConfigs', relations: { userConfig: { belongsTo: 'userConfig' } } }
        ];
        let nodeDbSchema = [
          { singular: 'podConfig', plural: 'podConfigs' },
          {
            singular: 'userConfig', plural: 'userConfigs',
            relations: {
              nodeConfigs: { hasMany: 'nodeConfig' }
            }
          },
          { singular: 'nodeConfig', plural: 'nodeConfigs', relations: { userConfig: { belongsTo: 'userConfig' } } }
        ];
        let serviceDbSchema = [
          { singular: 'request', plural: 'requests' },
          { singular: 'response', plural: 'responses' }
        ];
        /* #endregion */

        /* #region  Initializing the environment properties. */
        let nodeBootstrapService = new NodeBootstrap();
        await nodeBootstrapService.init();

        let dbServer = config.STARK_DB_HOST;
        
        // TODO: Security problem, please make the "trusted services" handle multiple nodes.
        let user = new UserAuth({
          server: undefined,
          arg: undefined
        }, true);
        await user.load();

        let userDb = new Database({
          arg: { username: user.state.name, dbServer: dbServer },
          username: user.state.name,
          password: user.state.password
        });
        await userDb.load();
        userDb.state.setSchema(userDbSchema);

        let userConfig = new UserConfig({ db: userDb.state, arg: { name: user.state.name } });
        await userConfig.init();

        let userServiceDb = new Database({
          arg: { username: `services-${user.state.name}`, dbServer: dbServer },
          username: user.state.name,
          password: user.state.password
        });
        await userServiceDb.load();
        userServiceDb.state.setSchema(serviceDbSchema);

        let nodeUser = new NodeUserLean({
          server: undefined,
          arg: {}
        },
          true
        );
        nodeUser.init();

        let nodeDb = new Database({
          arg: { username: nodeUser.argValid.name, dbServer: dbServer },
          username: nodeUser.argValid.name,
          password: nodeUser.argValid.password
        });
        await nodeDb.load();
        nodeDb.state.setSchema(nodeDbSchema);

        let nodeConfig = new NodeConfig(
          {
            db: nodeDb.state,
            arg: {}
          },
          true
        );
        nodeConfig.init();
        await nodeConfig.load();

        let nodeServiceUser = {
          state: {
            name: config.STARK_SERVICES_NODE_NAME,
            password: config.STARK_SERVICES_NODE_PASSWORD
          }
        };

        let serviceNodeDb = new Database({
          arg: { username: nodeServiceUser.state.name, dbServer },
          username: user.state.name,
          password: user.state.password
        });
        await serviceNodeDb.load();
        serviceNodeDb.state.setSchema(serviceDbSchema);
        /* #endregion */

        console.log(JSON.stringify(config));
    }
  });
</script>