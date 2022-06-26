const AWSXRay = require('aws-xray-sdk-core');
const AWSSDK = require('aws-sdk');
const {Sequelize} = require('sequelize');
const { loadSequelize } = require('./loadUmzug');
const AWS = AWSXRay.captureAWS(AWSSDK);
const StatusCodes = require('./StatusCodes');
const {stringifyBody} = require('./helpers/stringifyBody');
const {extractBody} = require('./helpers/extractBody');

const {error2response} = require('./helpers/error2response');
const { extractUserIdFromJWT } = require('./helpers/extractUserIdFromJWT');
// Create client outside of handler to reuse
const lambda = new AWS.Lambda()

let sequelize = null;
let Post = null;

exports.lambdaHandler = async function(event, context) {
  try {
    const body = extractBody(event);
    console.log(event);
    event.params = {...event.pathParameters, ...body, ...event.queryStringParameters};
    event.params.user = extractUserIdFromJWT(event.requestContext.authorizer.jwt);
    console.log(event.params);
    return await handler(event, context);
  } catch (err) {
    console.error({err});
    return stringifyBody(error2response(err));
  }
}

// Handler
async function handler(event, context) {
  try {
    const title = event.params.title;
    const user = event.params.user;
    const url = event.params.url;
    const thumbnail = event.params.thumbnail;
    
    if(title == null || title.length == 0) {
      const error = new Error("title not defined or empty");
      error.statusCode = StatusCodes.BAD_REQ;
      throw error;
    }
    if(user == null && user !== 0) {
      const error = new Error("user not defined");
      error.statusCode = StatusCodes.BAD_REQ;
      throw error;
    }

    if(sequelize == null) {
      sequelize = await loadSequelize();
    } 

    if(Post == null) {
      Post = require('./models/post')(sequelize, Sequelize);
    }

    let post = Post.build({user, url, title, thumbnail});
    await post.save();

    const response = {
      statusCode: StatusCodes.CREATED,
      body: {
        post: post,
      }
    }
    return stringifyBody(response);
  } catch(err) {
    console.error({err});
    return stringifyBody(error2response(err));
  }
}

exports.handler = handler;