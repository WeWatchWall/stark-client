import Vue from 'vue';
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue';

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import MainComponent from './main.vue';

import { ConfigState } from './browser/objectmodels/configState';
import { Database } from './shared/objectmodels/database';
import { NodeBootstrap } from './browser/services/nodeBootstrap';

import { UserAuth } from './browser/objectmodels/userAuth';
import { UserConfig } from './shared/objectmodels/userConfig';
import { NodeUserLean } from './browser/objectmodels/nodeUserLean';
import { NodeConfig } from './browser/objectmodels/nodeConfig';

import { PodManager } from './browser/services/podManager';
import { PodConfigManager } from './shared/services/podConfigManager';
import { PodNumManager } from './shared/services/podNumManager';
import { Router } from './shared/services/router';
import { RequestManager } from './shared/services/requestManager';
import { Requester } from './shared/services/requester';

// TODO: Use "vuex": "^3.6.2" for event-states.

export const Main = async (): Promise<void> => {
  Vue.use(BootstrapVue);
  Vue.use(IconsPlugin);

  new Vue({
    el: '#app',
    render: h => h(MainComponent),
  });

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
    { singular: 'nodeConfig', plural: 'nodeConfigs' }
  ];
  let serviceDbSchema = [
    { singular: 'request', plural: 'requests' },
    { singular: 'response', plural: 'responses' }
  ];
  /* #endregion */

  /* #region  Initializing the environment properties. */
  let configState = new ConfigState(true);
  await configState.init();

  let nodeBootstrapService = new NodeBootstrap();
  await nodeBootstrapService.init();

  let dbServer = ConfigState.state.STARK_DB_HOST;
  
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
      name: ConfigState.state.STARK_SERVICES_NODE_NAME,
      password: ConfigState.state.STARK_SERVICES_NODE_PASSWORD
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

  // Can also use DI instead when there are too many dependencies.
  /* #region  Initializing the users' "trusted" orchestrator services. */
  let deployManagerService = new PodManager(nodeBootstrapService);
  await deployManagerService.init();

  let podConfigService = new PodConfigManager(userDb, userConfig, nodeConfig, nodeDb);
  await podConfigService.init();

  let podNumService = new PodNumManager(userDb, userConfig, nodeDb, nodeConfig);
  await podNumService.init();

  let router = new Router(user, dbServer, userDb, userConfig, userServiceDb, nodeConfig);
  await router.init();
  // /* #endregion */

  // /* #region  Testing the request pipeline, has to set the package.isService = true. */
  // // TODO: Use in a service
  let requestManager = new RequestManager({
    user: nodeServiceUser,
    name: 'stark-browser-config',
    podIndex: 0
  },
  serviceNodeDb);
  await requestManager.init();
  requestManager.add(async request => {
    return request.arg;
  });

  let requester = new Requester({
    nodeUser: nodeUser,
    serviceUser: nodeServiceUser,
    name: 'stark-browser-config',
    services: ['stark-core-config'],
    podIndex: 0
  }, nodeDb, nodeConfig, serviceNodeDb);
  await requester.init();

  let result = await requester.add({
    service: 'stark-core-config',
    isRemote: true,  // Also important to test: false,
    arg: 'HELLO BROWSER WORLD!!!',
    timeout: 90e3
  });
  console.log(`The request was successful. Result: ${result}`);
  /* #endregion */

}
