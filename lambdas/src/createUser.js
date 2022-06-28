const AWSXRay = require('aws-xray-sdk-core');
const AWSSDK = require('aws-sdk');
const {Sequelize} = require('sequelize');
const { loadSequelize } = require('./loadUmzug');
const AWS = AWSXRay.captureAWS(AWSSDK);
const StatusCodes = require('./StatusCodes');

const {stringifyBody} = require('./helpers/stringifyBody');
const {error2response} = require('./helpers/error2response')


// Create client outside of handler to reuse
const lambda = new AWS.Lambda()

let sequelize = null;
let User = null;

// Handler
exports.handler = async function(event, context) {
  try {
    if(event.username == null || event.username.length == 0) {
      const error = new Error("username not defined or empty");
      error.statusCode = StatusCodes.BAD_REQ;
      throw error;
    }
    if(event.email == null || event.email.length == 0) {
      const error = new Error("email not defined or empty");
      error.statusCode = StatusCodes.BAD_REQ;
      throw error;
    }


    if(sequelize == null) {
      sequelize = await loadSequelize();
    } 

    if(User == null) {
      User = require('./models/user')(sequelize, Sequelize);
    }

    let user = User.build({username: event.username, email: event.email})
    await user.save();
    
    const response = {
      statusCode: StatusCodes.CREATED,
      body: {
        user: {
          id: user.id,
          username: user.username
        } 
      } 
    }
    return stringifyBody(response);
  } catch(err) {
    console.error({err});
    const newErr = error2response(err);
    return stringifyBody(newErr);
  }
}
