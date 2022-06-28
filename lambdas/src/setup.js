/**
 * use this file to create a migration locally
 */
const {handler} = require('./index');
require('dotenv').config();

async function setup() {
  await handler({}, {});
}

setup();


