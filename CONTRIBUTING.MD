# Contributing new changes
In case any changes are made to `setup.js` or `cleanup.js` files, you would also need to rebuild and commit a bundle. See [Building bundle](#building-bundle)

# Running the action localy
## Prerequisites
In order to test action changed localy, you would need to install `npm` and `node` packaged localy
- Ubuntu
```
sudo apt update && sudo apt install nodejs npm
```
- Windows and MacOS: [Download installer](https://nodejs.org/en/download)

## Building bundle
In order to build a new bundle, you need to execute
```
npm bundle
```
This will build both setup (`setup.js`) and clenaup (`cleanup.js`) actions and output to `/dist` directory

## Running a build bundle
In order to run a build bundle, you need to execute:

- Setup action
```
node dist/setup/index.js
```
- Cleanup action
```
node dist/cleanup/index.js
```
Note: Make sure to setup proper environment variables before running actions
