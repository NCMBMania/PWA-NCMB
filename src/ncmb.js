require('ncmb');
const config = require('./config')
const ncmb = new window.NCMB(config.applicationKey, config.clientKey);
export default ncmb;
