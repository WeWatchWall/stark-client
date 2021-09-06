import assert from "browser-assert";
import { ObjectModel } from "objectmodel";
import { Sandbox } from "../../shared/objectmodels/sandbox";
import { ConfigState } from "./configState";

// TODO: SCALING UP+DOWN with UPDATE
export class PodEnv {
  static starkAppEl;
  
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
    this.init();
  }

  init() {
    if (!PodEnv.starkAppEl) {
      PodEnv.starkAppEl = document.getElementById('stark-pods');
    }
  }

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

    if (this.argValid.sandbox === Sandbox.UI) {
      let target = document.createElement("DIV");
      target.setAttribute('id', `${this.argValid.name}-${podIndex}`);
      PodEnv.starkAppEl.appendChild(target);
    }

    let functionInSandbox = await import(`${this.argValid.path}`);
    functionInSandbox.default({
      package: this.argValid.name,
      pod: podIndex,
      arg: this.argValid.arg,
      config: ConfigState.state
    });
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
    name: String,
    path: String,
    sandbox: [Sandbox.Default, Sandbox.Admin, Sandbox.UI],
    arg: [Object]
  });

  private validateNew() {
    this.argValid = this.validate ? new this.newPodEnvModel(this.arg) : this.arg;
  }

  private validateState() {
    assert(!!this.state);
  }
  
}