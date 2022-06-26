const AWSXRay = require('aws-xray-sdk-core');
const AWSSDK = require('aws-sdk');
const {Sequelize} = require('sequelize');
const { loadSequelize } = require('./loadUmzug');
const AWS = AWSXRay.captureAWS(AWSSDK);
const StatusCodes = require('./StatusCodes');
const { stringifyBody } = require('./helpers/stringifyBody');
const { error2response } = require('./helpers/error2response');
const { extractBody } = require('./helpers/extractBody');
const { extractUserIdFromJWT } = require('./helpers/extractUserIdFromJWT');
// Create client outside of handler to reuse
const lambda = new AWS.Lambda()

let sequelize = null;
let Comment = null;

exports.lambdaHandler = async function(event, context) {
  try {
    const body = extractBody(event);
    event.params = {...event.pathParameters, ...body, ...event.queryStringParameters};
    event.params.user = extractUserIdFromJWT(event.requestContext.authorizer.jwt);
    return await handler(event, context);
  } catch (err) {
    console.error({err});
    return stringifyBody(error2response(err));
  }
}

// Handler
async function handler(event, context) {
  try {
    const content = event.params.content;
    const parent = event.params.parent || null;
    const post = event.params.post;
    const user = event.params.user;
    
    if(content == null || content.length == 0) {
      const error = new Error("content not defined or empty");
      error.statusCode = StatusCodes.BAD_REQ;
      throw error;
    }

    if(post == null && post != 0) {
      const error = new Error("post not set");
      error.statusCode = StatusCodes.BAD_REQ;
      throw error;
    }

    if(user == null && user != 0) {
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

    let comment = Comment.build({parent: parent, user: user, content: content, post: post})
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

exports.handler = handler;