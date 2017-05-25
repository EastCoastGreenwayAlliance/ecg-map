# East Coast Greenway: Map & Trip Planner

Mobile friendly web application for the [East Coast Greenway](http://greenway.org) map and trip planner, developed by [GreenInfo Network](http://greeninfo.org).

## Install Instructions
Make sure you have NodeJS >= 6.9.x and NPM >= 3.10.x and Yarn >= 0.22 installed.

### Node Version Manager
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
To install project dependencies do:

```
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

## Develop
To have Webpack bundle files, start the dev server, and watch for changes do:

```
npm start
```

This will compile the assets in the project and start [Webpack Dev Server](https://webpack.js.org/configuration/dev-server/#devserver) as a local server. This should automatically open your web browser to `localhost:8080` and you should see the site once Webpack has finished its initial bundling process. Webpack will automatically refresh the page when it recompiles and notify you that it has done so.

## Build
To have Webpack create an optimized production build do:

```
npm run build
```

This will create compiled and compressed JS and CSS files in the project's `dist/` directory. These files may then be hosted on a server of choice as a static site. Note that any existing files in `dist/` will be blown away prior to new ones being generating using `rimraf`.

**NOTE** that the `dist/` directory is intentionally kept of out version control in `.gitignore`. If you'd like to include the contents of `dist/` in Git, simply remove `dist/` from `.gitignore`.

## Deploy

### Github Pages
To deploy the contents of the `dist/` directory to the repository's Github Pages do:

```
npm run deploy:gh-pages
```

### To a Staging Server
_TO DO..._

## Using Static Assets
The empty `assets/` directory is available for Webpack to include static assets such as images, icons, etc. The Webpack Dev Server should resolve file paths just by doing `assets/filename.png` in your code (e.g. for the `src` attribute of an image tag). When doing `npm run build` the `CopyWebpackPlugin` will copy the `assets/` directory to `dist/assets` for you.
