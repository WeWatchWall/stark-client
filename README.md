# The Client Project for the Stark Orchestrator

[![Build and test status](https://github.com/WeWatchWall/stark-client/workflows/Lint%20and%20test/badge.svg)](https://github.com/WeWatchWall/stark-client/actions?query=workflow%3A%22Lint+and+test%22)
[![NPM version](https://img.shields.io/npm/v/stark-client.svg)](https://www.npmjs.com/package/stark-client)

The browser side of running the Stark Orchestrator. Will listen to the configured CouchDB instance and run any assigned STARK_MODE:DeployMode.Browser packages. The Stark-Server will configure the dist/public folder on:

* Initialization
* Building with Stark-Server ```bash npm install```

## Getting Started

The Stark-Server project expects the client binaries to exist in $STARK_HOME/dist/public/dist. Stark-Client comes pre-installed with Stark-Server. These instructions are for updating the Stark-CLient deployment.

1. Clone Stark-Client to your machine and build it:
  
  ```bash
  gh repo clone WeWatchWall/stark-client
  cd stark-client
  
  npm install
  ```

2. Copy the deployment files to Stark-Server:
  
  stark-client/dist -> $STARK_HOME/dist/public/dist
  stark-client/browser-test.html -> $STARK_HOME/dist/public/index.html

