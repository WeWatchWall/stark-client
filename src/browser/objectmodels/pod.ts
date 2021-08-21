import { ConfigState } from './configState.js';
import { EventEmitter } from 'events';
import assert from "browser-assert";
import { ObjectModel } from "objectmodel";

const openpgp = require('openpgp'); // Only works with require :(
import JSZip from 'jszip';

import { DeploymentMode } from '../../shared/objectmodels/deploymentMode';
import { ProvisionStatus } from "../../shared/objectmodels/provisionStatus";
import { PodEnv } from './podEnv';
import { Util } from '../../shared/util';

export class Pod { 
  db: any;
  
  arg: any;
  argValid: any;
  validate: boolean;
  state: any;
  
  processes: Array<PodEnv> = [];
  watcher: any;
  eventEmitter = new EventEmitter();
  isSaveConfig = false;
  packageFile: string;

  constructor(arg = { db: undefined, arg: undefined},  validate = false) {
    this.db = arg.db;
    this.arg = arg.arg;
    this.validate = validate;
  }

  parse(arg: string) {
    this.arg = JSON.parse(arg);
    this.validateNew();
  }

  init() { throw new Error("This method is not implemented."); }

  async load() {
    if (this.state) { return; }
    this.validateNew();

    // Get the initial state.
    this.state = (await this.db.find({
      selector: { data: this.argValid },
      limit: 1
    })).docs;
    let podId = this.state[0]._id;
    this.state = await this.db.rel.parseRelDocs('podConfig', this.state);
    this.state = this.state.podConfigs[0];
    
    await this.saveConfig({ status: ProvisionStatus.Init });
    await this.saveInstall();
    await this.save();
    
    var self = this;
    // TODO: VM pattern for node(longpoll) vs browser(retry) so I can reuse these dang filed :P
    this.watcher = this.db.changes({
      since: 'now',
      back_off_function: function (delay) { return 20e3; },
      timeout: 1,
      heartbeat: false,
      live: true,
      retry: true,
      include_docs: true,
      selector: {
          "_id": podId
      }
    }).on('change', async function (change) {
      if (change.deleted) {
        await self.delete(true);
        return;
      }

      let parsedChange = await self.db.rel.parseRelDocs('podConfig', [change.doc]);
      parsedChange = parsedChange.podConfigs[0];
      let prevState = self.state;
      self.state = parsedChange;

      if (prevState.attachments["package.zip.pgp"].revpos !== parsedChange.attachments["package.zip.pgp"].revpos) {
        await self.delete();
        await self.saveInstall();
      }

      await self.save();
    });
  }

  // NOTE: Is called by load, when the podConfig changes.
  async save() {
    this.validateState();

    if (this.state.status === ProvisionStatus.Stop) { await this.delete(); return; }

    if (this.processes.length > this.state.numPods) {
      for (let i = 0; i < this.processes.length - this.state.numPods; i++) {
        let processEnv = this.processes.pop();
        processEnv = processEnv;
        // TODO: await processEnv.delete();
      }
    } else if (this.state.numPods > this.processes.length) {
      for (let i = 0; i < this.state.numPods - this.processes.length; i++) {
        let processEnv = new PodEnv({
          arg: {
            name: this.state.name,
            path: this.packageFile
          }
        }, true);
        this.processes.push(processEnv);

        try {
          var self = this;

          processEnv.save(this.processes.length - 1);
          await self.saveConfig({ status: ProvisionStatus.Up });
        } catch (error) {
          await this.saveConfig({ status: ProvisionStatus.Error, error: error });
        }
      }
    }
  }

  private async saveConfig(overwrite) {
    
    // TODO: Replace with upsert: https://pouchdb.com/guides/conflicts.html#two-types-of-conflicts
    await Util.retry(async (retry) => {
      try {
        this.state = {
          ...this.state,
          ...(await this.db.rel.save('podConfig', {
              ...this.state, ...overwrite
          }))
        };
      } catch (error) {
        retry(error)
      }
    }, 8);
  }

  private async saveInstall() { 
    let attachment = await this.db.rel.getAttachment('podConfig', this.state.id, 'package.zip.pgp');
    let key = ConfigState.state.STARK_USER_KEY;

    let message = await openpgp.message.read(new Uint8Array(await attachment.arrayBuffer()));
    // Decrypt the deployment.
    let { data: decrypted } = await  openpgp.decrypt({
      message: message, // parse encrypted bytes
      passwords: [key],        // decrypt with password
      format: 'binary'                                // output as Uint8Array
    });
    attachment = decrypted;
    decrypted = undefined;

    // Save the package.
    URL.revokeObjectURL(this.packageFile);
    let zip = new JSZip();
    zip = await zip.loadAsync(attachment);
    attachment = undefined;

    for (let filename of Object.keys(zip.files)) {
      if (filename !== 'dist\\index.js') { continue; }

      let fileText = await ((zip.file(filename)).async('string'));
      let file = new File([fileText], "index.js", { type: "application/javascript" })
      this.packageFile = URL.createObjectURL(file);
      break;
    }
    zip = undefined;

  }

  // NOTE: Is called by load, when the podConfig changes.
  async delete(isFull = false) {
    if (isFull) { this.watcher.cancel(); }
    
    for (let processEnv of this.processes) {
      await processEnv.delete();
    }

    if (isFull) {
      this.eventEmitter.emit('delete', this.state.name);
      URL.revokeObjectURL(this.packageFile);
    }

    this.processes = [];
    this.state = undefined;
  }

  private newPodConfigModel = ObjectModel({
    name: String,
    mode: [DeploymentMode.Core, DeploymentMode.Edge, DeploymentMode.Browser]
  });

  private validateNew() {
    this.argValid = this.validate ? new this.newPodConfigModel(this.arg) : this.arg;
  }
    
  private validateState() {
    assert(!!this.state);
  }
}