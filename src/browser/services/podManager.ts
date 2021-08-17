import { Pod } from '../objectmodels/pod';


export class PodManager {
  nodeBootstrap;
  podConfigs = {};
  addWatcher: any;

  constructor(nodeBootstrap) {
    this.nodeBootstrap = nodeBootstrap;
  }

  async init() {

    for (let bootstrapPod of this.nodeBootstrap.nodeConfig.state.podConfigs) {
      await this.add(bootstrapPod);
    }

    var self = this;
    this.addWatcher = this.nodeBootstrap.database.state.changes({
      since: 'now',
      live: true,
      retry: true,
      include_docs: true,
      selector: {
        "_id": {"$regex": "^podConfig"}
      }
    }).on('change', async function (change) {
      if (change.deleted) { return; } 
      let newPodName = change.doc.data.name;
      
      if (!self.podConfigs[newPodName] && change.doc._attachments) {
        self.podConfigs[newPodName] = 'init';
        await self.add(newPodName);
      }
    });
  }

  // Internally used on watching
  async add(podName: string) {
    let podConfig = new Pod({
      db: this.nodeBootstrap.database.state,
      arg: {
        name: podName,
        mode: this.nodeBootstrap.nodeConfig.state.mode
      }
    }, true);
    this.podConfigs[podName] = podConfig;

    var self = this;
    podConfig.eventEmitter.on('delete', async (podName: string) => { await self.delete(podName); })

    await podConfig.load();
  }

  // Internally used on watching
  async delete(podName: string) {
    this.podConfigs[podName] = undefined;
  }
}