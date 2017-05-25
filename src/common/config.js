// App wide configuration goes here
import packageJSON from '../../package.json';

// e.g. our app's base URL; if deployed on Github Pages we need to add the folder name
const baseURL = process.env.NODE_ENV === 'production' ? `${packageJSON.name}/` : '';

export default baseURL;
