# East Coast Greenway: Map & Trip Planner
![ecg-map-overview](client/assets/img/ecg-map-overview.png)

Mobile friendly, single page web application for the [East Coast Greenway](http://greenway.org) map and trip planner, developed by [GreenInfo Network](http://greeninfo.org).

Built with / runs on:

- Node.JS
- React v15.5.4
- React Router v4.x
- Redux v3.6.0
- Webpack v2.6.1
- Babel v6.x
- ESLint
- SASS
- Yarn
- Heroku

## Install Instructions
Make sure you have NodeJS >= 6.9.x and NPM >= 3.10.x and Yarn >= 0.22 installed.

### Node Version
Note the `.nvmrc` file, this makes it explicit which version of NodeJS you are using with your project. Major releases between NodeJS versions can have breaking changes, so it's good to use [Node Version Manager](https://github.com/creationix/nvm) in case you need to switch versions between projects.

If you have NVM installed, you can use the project's current version of NodeJS by doing the following in the root of this repo:

```
nvm use
```

NVM will let you know if the version of Node is currently not installed by replying with:

```
N/A: version "x.x.x -> N/A" is not yet installed.
```

and that you may install it by doing:

```
You need to run "nvm install x.x.x" to install it before using it.
```

Note that `x.x.x` is a place holder for the version of NodeJS you'd like to use, and that you'll have to do `nvm use` for each shell instance.

### Install Dependencies
To install project dependencies for both the server and client do:

```
yarn install
cd client
yarn install
```

You may also use `NPM` to install dependencies, but using Yarn is better as it resolves dependencies of dependencies ensuring will have the exact same ones if you blow away the `node_modules` directory and do an install a year from now.

It's also recommended to use Yarn to install new dependencies so that the `yarn.lock` file gets updated. You can do this by doing:

```
yarn add some-library
```

OR

```
yarn add -D some-library
```

The `-D` flag will save the dependency to `devDependencies` in `package.json`.

#### Foreman
You will also need [Foreman](http://ddollar.github.io/foreman/) to run the Node.JS server locally, as Foreman is used to make environment variables specified in a `.env` file accessible to Node.JS (see the section on environment variables).

The easiest way to install Foreman is to use Ruby's `gem` command:

```
gem install foreman
```

### Install the Geo Routing Library
Currently this app uses a custom library built on JSTS for handling geographic routing along the ECG. This library exists [in a separate repo](#) and will be open sourced following the launch of this project. To install or update it in the client folder:

```bash
cp ../path/to/ecg-map-router/dist/ecgClientRouter.js ./client/lib/ecgClientRouter.js
```

You shouldn't need to do this unless you are updating the ecgClientRouter, as the above code is checked into version control with this repo.

## Environment Variables
Note that [Foreman](https://www.theforeman.org/) is used to run the Node.JS server in a dev environment so that ENV variables may be accessed from a `.env` file.

The `.env` file should reside in the root level of this repo and contain the following:

```
MAILCHIMP_API_KEY="<REDACTED>"
MAILCHIMP_LIST_ID="<REDACTED>"
NODE_ENV="development"
```

When you run `npm run dev` in the root of this repo, `Foreman` will be used to expose these variables to Node.JS for use by `server.js`.

These same environment variables are configured with Heroku for when the app is deployed.

## Develop
To develop the app locally do:

```bash
# start the Node.JS server on port 5001
npm run dev

# in a new terminal window / tab do:
cd client
npm start
# will start the webpack dev server on port 8888
```

This will start the Node.JS server, have Webpack compile the assets in `client`, and start [Webpack Dev Server](https://webpack.js.org/configuration/dev-server/#devserver). This should automatically open your web browser to `localhost:8888` and you should see the site once Webpack has finished its initial bundling process. Webpack will update the app's front-end codebase using [hot-module-replacement](https://webpack.js.org/concepts/hot-module-replacement/) after it recompiles, and notify you that it has done so. For some updates you may need to manually refresh the page to see changes take place.

**NOTE** that there is a **proxy** enabled with the Webpack Dev Server so that HTTP requests can be made from port 8888 to the Node.JS server which is running on port 5001. This is necessary to test the Mailchimp API locally.

## Compiling Client Codebase
To have Webpack create an optimized production build in `client/dist` do:

```bash
cd client
npm run build
```

This will create compiled and compressed JS and CSS files in the `client/dist/` directory. Note that any existing files in `client/dist/` will be blown away prior to new ones being generating using `rimraf`. These files will be served up by `server.js`, which is what happens upon deploying the app to Heroku.

**NOTE** that the `client/dist/` directory is intentionally kept of out version control in `.gitignore`. If you'd like to include the contents of `dist/` in Git, simply remove `dist/` from `.gitignore`.

## Deploy

### Heroku
The app is currently being deployed on Heroku. Running the following commands in the root of this repo will configure the app for being deployed on Heroku.

```bash
heroku login
heroku git:remote -a ecg-map
heroku config:set NODE_ENV=production
heroku config:set NPM_CONFIG_PRODUCTION=false
heroku config:set MAILCHIMP_API_KEY="<your mailchimp api key>"
heroku config:set MAILCHIMP_LIST_ID="<your mailchimp list id>"
```

To deploy the app:

```
git push heroku master
```

Or if you want to deploy a branch that _isn't_ master:

```
git push heroku branch-name:master
```

### Github Pages
~~To deploy the contents of the `dist/` directory to the repository's Github Pages do:~~

**This app no longer will run on Github Pages as it now requires a NodeJS server**


## Using Static Assets
The empty `assets/` directory is available for Webpack to include static assets such as images, icons, etc. The Webpack Dev Server should resolve file paths just by doing `assets/filename.png` in your code (e.g. for the `src` attribute of an image tag). When doing `npm run build` the `CopyWebpackPlugin` will copy the `assets/` directory to `dist/assets` for you.
