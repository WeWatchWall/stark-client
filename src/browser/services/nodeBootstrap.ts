import config from '../../../config.js';
import { NodeConfig } from "../objectmodels/nodeConfig";
import { NodeUser } from "../objectmodels/nodeUser";
import { UserUnauth } from "../objectmodels/userUnauth";

import { Util } from "../../shared/util";
import { Database } from "../../shared/objectmodels/database";

export class NodeBootstrap {
    nodeConfig: NodeConfig;
    user: UserUnauth;
    nodeUser: NodeUser;
    database: Database;

  async init() { 
    this.nodeConfig = new NodeConfig({
      db: undefined,
      arg: {}
    }, true)
    this.nodeConfig.init();

    this.user = new UserUnauth({
      server: undefined,
      arg: undefined
    }, true);
    this.user.init();

    this.nodeUser = new NodeUser({
      server: `${config.STARK_HOST}`,
      nodeConfig: this.nodeConfig.arg,
      arg: {}
    }, true);

    await this.nodeUser.load();        
    
    // The admin key should exist on the core node after I add the node. 
    // this.user.state.key
    await this.user.load();

    this.database = new Database({ arg: { username: this.nodeUser.state.name, dbServer: config.STARK_DB_HOST }, username: config.STARK_NODE_NAME, password: config.STARK_NODE_PASSWORD });
    await this.database.load();
    await Util.delay(3e3);
    this.database.state.setSchema(this.nodeDbSchema);
    
    this.nodeConfig.db = this.database.state;
    await this.nodeConfig.load();
  }
    
  private nodeDbSchema = [
    { singular: 'podConfig', plural: 'podConfigs' },
    {
      singular: 'userConfig', plural: 'userConfigs', 
      relations: {
        nodeConfigs: {hasMany: 'nodeConfig'}
      }
    },
    {singular: 'nodeConfig', plural: 'nodeConfigs', relations: {userConfig: {belongsTo: 'userConfig'}}}
  ];
}