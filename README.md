# openBP
OpenBP repository for the Sustainability and Business Ethics Improvement Cycle at Utrecht University

## Prerequisites

The following is definitely required for running the project. 

Install [Node and npm](https://www.npmjs.com/get-npm) on your machine so that you can use the required packages for the project

Install the Firebase command line tools so you can 
```bash
npm install firebase-tools -g
```

## Troubleshooting
We haven't tested if the following installs are required when this project is pulled, but in any case there no danger in updating these packages frequently. These packages are installed previously and may or may not be required to be installed again for every new project pull:

Install Firebase functions
```bash
npm install firebase-functions
```

Install Firebase admin
```bash
npm install firebase-admin
```


## Running the tool

You can test the tool by spinning up a local web server using

```bash
firebase serve
```

## Deploying
The tool can be deployed using

```bash
firebase deploy
```

after which the tool will be available at a public domain


## Callable functions
Certain functions cannot be executed client-side. We use [Cloud Functions](https://firebase.google.com/docs/hosting/functions#direct_hosting_requests_to_your_function) connected to Firebase hosting for executing scripts server-side. These functions are deployed on Firebase and can be called from our web-app. We use Cloud Functions on Firebase Hosting to overcome any CORS-related problems. Functions can be added to index.js in the functions folder and then called from any JavaScript file. 

It may be required to install and initialize Firebase functions when pulling this project. More info can be found in Google's documentation following the previous link or by looking at the Troubleshooting section above. 