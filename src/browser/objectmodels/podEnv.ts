import assert from "browser-assert";
import { ObjectModel } from "objectmodel";

// TODO: SCALING UP+DOWN with UPDATE
export class PodEnv {
  db: any;

  arg: any;
  argValid: any;
  validate: boolean;
  state: any;
  
  string: string;
  packageDir: any;
    
  constructor(arg = { arg: undefined},  validate = false) {
    this.arg = arg.arg;
    this.validate = validate;
  }

  init() { throw new Error("This method is not implemented."); }

  parse(arg: string) {
    this.arg = JSON.parse(arg);
    this.validateNew();
  }
  
  async load() {
    if (this.state) { return; }
    this.validateNew();

    this.state = true;
  }

  async save(podIndex) {
    podIndex = podIndex;
    if (!this.state) { await this.load(); } // TODO: USE THIS PATTERN!
    this.validateState();
    debugger;
    await import(`${this.arg.name}`);
  }

  toString() {
    this.string = JSON.stringify(this.state);
  }
    
  // TODO!! Store the sandbox so that I can cancel that while I'm scaling down!!
  // If I reach 0, and I call delete again, then I delete the install package,
  // So that I can call load automatically again...:()
  async delete() {
  }

  private newPodEnvModel = ObjectModel({
    name: String
  });

  private validateNew() {
    this.argValid = this.validate ? new this.newPodEnvModel(this.arg) : this.arg;
  }

  private validateState() {
    assert(!!this.state);
  }
  
}