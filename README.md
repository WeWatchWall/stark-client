# The Client Project for the Stark Orchestrator

[![Build and test status](https://github.com/WeWatchWall/stark-client/workflows/Lint%20and%20test/badge.svg)](https://github.com/WeWatchWall/stark-client/actions?query=workflow%3A%22Lint+and+test%22)
[![NPM version](https://img.shields.io/npm/v/stark-client.svg)](https://www.npmjs.com/package/stark-client)

The browser side of running the Stark Orchestrator, built with Vue.js. Will listen to the configured CouchDB instance and run any assigned STARK_MODE:DeployMode.Browser packages. The Stark-Orchestrator will configure the dist/public folder on:

* Initialization
* Building with Stark-Orchestrator ```npm install```

## Getting Started

The Stark-Orchestrator project expects the client binaries to exist in $STARK_HOME/dist/public/dist. Stark-Client comes pre-installed with Stark-Orchestrator. These instructions are for updating the Stark-CLient deployment.

1. Clone Stark-Client to your machine and build it:
  
  ```bash
  gh repo clone WeWatchWall/stark-client
  cd stark-client
  
  npm install
  ```

2. Copy the deployment files to Stark-Orchestrator:
  
  * stark-client/dist -> $STARK_HOME/dist/public/dist
  * stark-client/browser-test.html -> $STARK_HOME/dist/public/index.html
  

The author aknowledges that documentation is not yet anywhere close to complete, so feel free to look at the following files to get an idea of how to use the classes for core and edge packages:

* stark-client/src/main.vue
