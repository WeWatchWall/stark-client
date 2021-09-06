import { ObjectModel, ArrayModel } from "objectmodel";
import assert from 'browser-assert';
import config from '../../../config.js';

const pollInterval = 6e3; // Saves at half this frequency.

export class ConfigState {
  arg: any;
  argValid: any;
  validate: boolean;
  
  storeIndex: string;
  static state: any;
  
  string: string;
  
  /**
   * Creates an instance of the config.
   * @param [arg.db]
   * @param [arg.arg]
   * @param [validate] Is necessary because the arg could be used to load (future).
   */
  constructor(validate = false) {
    this.arg = config;
    this.validate = validate;
  }

  async init() {
    // Loading config from an updated server file.
    try {
      let configName = '/config.js'
      let config = await import(`${configName}`);
      this.arg = {...this.arg, ...config.default};
    } catch {
    }
    this.arg.STARK_MODES = JSON.parse(this.arg.STARK_MODES);

    this.validateNew();

    let storeObject;
    let maxIndex = -1;

    for (let store of Object.entries(localStorage)) {
      if (isNaN(Number(store[0]))) { continue; }

      storeObject = JSON.parse(store[1]);
      let time = Date.now();
      maxIndex = Math.max(maxIndex, parseInt(store[0]));
      
      if (storeObject.STARK_USER_KEY !== this.arg.STARK_USER_KEY) {
        this.storeIndex = store[0];
        await this.delete();
        this.storeIndex = undefined;
        continue;
      } else if (!storeObject.time || time - storeObject.time < pollInterval) {
        continue;
      } else if (!ConfigState.state) {
        storeObject.time = time;
        localStorage[store[0]] = JSON.stringify(storeObject);
        this.storeIndex = store[0];
        ConfigState.state = 'init';
      }
    }

    if (!ConfigState.state) {
      this.storeIndex = `${maxIndex + 1}`;
      storeObject = { ...{ time: Date.now() }, ...this.argValid };
    }
    
    ConfigState.state = storeObject;
    await this.save();

    setInterval(() => {
      this.save(); // Intentionally not awaiting.
    } , pollInterval / 2);
  };
  
  /**
   * Parses the config.
   * @param arg 
   */
  parse(arg: string) {
    this.arg = JSON.parse(arg);
    this.validateNew();
  }
  
  async load() { throw new Error("This method is not implemented."); }

  async save() {
    this.validateState();
    ConfigState.state.time = Date.now();
    localStorage[this.storeIndex] = JSON.stringify(ConfigState.state);
  }

  toString() {
    this.string = JSON.stringify(ConfigState.state);
  }
  
  async delete() {
    localStorage.removeItem(this.storeIndex);
  }

  // :() Constructor type?
  private newConfigModel = ObjectModel({
    STARK_MODES: ArrayModel(Boolean),
    STARK_HOST: String,
    STARK_PORT: String,
    STARK_DB_HOST: String,
    STARK_USER_NAME: String,
    STARK_USER_PASSWORD: String,
    STARK_USER_KEY: String,
    STARK_SERVICES_NAME: [String],
    STARK_SERVICES_PASSWORD: [String]
  });

  private validateNew() {
    this.argValid = this.validate ? new this.newConfigModel(this.arg) : this.arg;
  }

  private validateState() {
    assert(!!ConfigState.state);
  }
  
}