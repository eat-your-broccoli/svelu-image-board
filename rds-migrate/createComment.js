const AWSXRay = require('aws-xray-sdk-core');
const AWSSDK = require('aws-sdk');
const {Sequelize} = require('sequelize');
const { loadSequelize } = require('./loadUmzug');
const AWS = AWSXRay.captureAWS(AWSSDK);
const StatusCodes = require('./StatusCodes');
const { stringifyBody } = require('./helpers/stringifyBody');
const { error2response } = require('./helpers/error2response');
// Create client outside of handler to reuse
const lambda = new AWS.Lambda()

let sequelize = null;
let Comment = null;

// Handler
exports.handler = async function(event, context) {
  try {
    console.log({event})
    if(event.content == null || event.content.length == 0) {
      const error = new Error("content not defined or empty");
      error.statusCode = StatusCodes.BAD_REQ;
      throw error;
    }

    if(event.post == null && event.post != 0) {
      const error = new Error("post not set");
      error.statusCode = StatusCodes.BAD_REQ;
      throw error;
    }

    if(event.user == null && event.user != 0) {
      const error = new Error("user not set");
      error.statusCode = StatusCodes.BAD_REQ;
      throw error;
    }

    if(sequelize == null) {
      sequelize = await loadSequelize();
    } 

    if(Comment == null) {
      Comment = require('./models/comment')(sequelize, Sequelize);
    }

    let comment = Comment.build({parent: event.parent, user: event.user, content: event.content, post: event.post})
    await comment.save();

    const response = {
      statusCode: StatusCodes.CREATED,
      body: {
        comment, 
      }
    }
    return stringifyBody(response);
  } catch(err) {
    console.error({err});
    return stringifyBody(error2response(err));
  }
}
