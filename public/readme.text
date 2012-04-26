# Goal #

The goal of this project is to provide a simple application that demonstrates the use of the LinkedIn-Node (lin) library.  It has a working example of authentication, suggests a way to organize code, and demonstrates simple people search.


# Prerequisites #

Install Node, NPM (Node Package Manager), and Express (module).  See www.nodejs.org, https://github.com/joyent/node, https://github.com/isaacs/npm, and other resources on the web for examples. 


# Get LinkedIn Developer Keys #

1.  https://developer.linkedin.com/

2.  Select the API tab, then REST menu item.  Click the first link on the page to "Get an API Key" ( https://www.linkedin.com/secure/developer ).

3.  Add New Application...

4.  Fill out form and collect API Key and Secret Key


# LIN Quick Start Option #

In a hurry?  Download our demo, initialize your keys, and go…

1.  download demo application

  > git clone https://github.com/braitz/lin-demo

2.  install library dependencies

> cd lini-demo
> npm install -d 

4.  edit config/environments.json;  initialize linkedin api key and secret

5.  start the application

> node app.js
> http://localhost:3000/


# LINI Do it yourself Option #

Create your own application that uses lini node_module.

1.  Create "demo" express application

> express demo


2.  add "linkedin-node" node_module to package.json

> "dependencies": {
>   "linkedin-node":">= 1.0.0"
> }


3.  initialize linkedin-node 

   For a full example, see lin-demo code where environment variables are in config/environemnts.json and the Lin.init code is in app.js.  Initialize apiKey and apiSecret with LinkedIn application keys.  If using the redirect format of login, verify requestTokenCallback, which will be called after the request token is successfully received (and should point to accessToken functionality).

> var Lin = require('linkedin-node');
> Lin.init({...})


4.  make lin api calls as described below…


5.  start the application

> node app.js
> http://localhost:3000


# How to make LINI API call #

Making an API call via Lin is a three step process: get user credentials, get api specification, and make the request.


## Get user credentials ##

The Lin-demo application demonstrates an oauth request/access token method to get user credentials.


## What and where are the api's? ##

Though there may be documentation, the best way to find available API's is to view the code in the following directory:

> cd <project>/node_modules/linkedin-node/lib/api

To specify an api, you need a folder, a file, and a method name.  So, for example, if you would like to access the v1-people-search api, you would make the following call where 'v1' matches the folder, 'peopleAPI' matches the file name, 'search' is an exported method within that file, and the following args match the argument list required by the method.

> var api = Lin.api('v1', 'peopleAPI', 'search', {'keywords':'nodejs'});


## Putting it together ##

> var Lin = require('linkedin-node');
> var credentials = {token{token:<thisIsTheTokenFromLogin>, secret:<thisIsTheSecretFromLogin>}};
> var api = Lin.api('v1', 'peopleAPI', 'search', {'keywords':'nodejs'});
> Lin.makeRequest(credentials, {api:api}, function(err, data) {
> …
> });


# How to extend Lin API set #

Given the dynamic nature of api discovery, it is easy to extend the api set.  If you want to add another v1 peopleAPI feature, just add and export that method from the v1/peopleAPI.js file.  Or, you can create a new folder, file, and method and request it via the Lin.api call.  Done.  Available with the next server restart.  It's just that easy.