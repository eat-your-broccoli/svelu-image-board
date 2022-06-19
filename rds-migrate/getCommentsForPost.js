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
let User = null;


// Handler
exports.handler = async function(event, context) {
  try {
    if(sequelize == null) {
      sequelize = await loadSequelize();
    } 

    if(Comment == null) {
      Comment = sequelize._models['Comment'];
      User = sequelize._models['User'];
    }

    const post = event.post;
    if(post == null) {
      const error = new Error("post is null");
      error.statusCode = StatusCodes.BAD_REQ;
      throw error;
    }
    
    const comments = await Comment.findAll({
      where: {
        post: post,
      },
      include: [
        {model: User, required: true, attributes: ['username', 'id']}
      ]
    });

    const response = {
      statusCode: StatusCodes.OKAY,
      body: {
        comments: comments,
        post: post,
      }
    }
    return stringifyBody(response);
  } catch(err) {
    console.error({err});
    return stringifyBody(error2response(err));
  }
}
