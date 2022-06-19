const AWSXRay = require('aws-xray-sdk-core');
const AWSSDK = require('aws-sdk');
const { loadUmzug } = require('./loadUmzug');
const AWS = AWSXRay.captureAWS(AWSSDK)

// Create client outside of handler to reuse
const lambda = new AWS.Lambda()

// Handler
exports.handler = async function(event, context) {
  const params = {};
  params.dbName = process.env.DB_NAME;
  params.password = process.env.DB_PASS;
  params.username = process.env.DB_USER;
  params.dbPort = process.env.DB_PORT;
  params.dbHost = process.env.DB_HOST;

  const umzug = await loadUmzug(params);
  return new Promise(async resolve => {
    await umzug.up();
    resolve({success: true});
  })
}
