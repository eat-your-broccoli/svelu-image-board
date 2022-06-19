const AWSXRay = require('aws-xray-sdk-core');
const AWSSDK = require('aws-sdk');
const {Sequelize} = require('sequelize');
const { loadSequelize } = require('./loadUmzug');
const AWS = AWSXRay.captureAWS(AWSSDK);
const StatusCodes = require('./StatusCodes');

// Create client outside of handler to reuse
const lambda = new AWS.Lambda()

let sequelize = null;
let Post = null;

// Handler
exports.handler = async function(event, context) {
  try {
    if(event.title == null || event.title.length == 0) {
      const error = new Error("title not defined or empty");
      error.statusCode = StatusCodes.BAD_REQ;
      throw error;
    }
    if(event.user == null && event !== 0) {
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

    const {user, url, title, thumbnail} = event;

    let post = Post.build({user, url, title, thumbnail});
    await post.save();

    const response = {
      statusCode: StatusCodes.CREATED,
      post: {
        id: post.id,
        url: post.url,
        thumbnail: post.thumbnail,
        title: post.title,
        user: post.user,
      }
    }
    return response;
  } catch(err) {
    console.log({err});
    return {
      statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR
    }
  }
}
