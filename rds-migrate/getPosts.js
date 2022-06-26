'use strict';

const AWSXRay = require('aws-xray-sdk-core');
const AWSSDK = require('aws-sdk');
const {Sequelize, Op} = require('sequelize');
const { loadSequelize } = require('./loadUmzug');
const AWS = AWSXRay.captureAWS(AWSSDK);
const StatusCodes = require('./StatusCodes');
const { stringifyBody } = require('./helpers/stringifyBody');
const { error2response } = require('./helpers/error2response');
const { extractBody } = require('./helpers/extractBody');
const { extractUserIdFromJWT } = require('./helpers/extractUserIdFromJWT');

let sequelize = null;
let Post = null;
let User = null;

exports.lambdaHandler = async function(event, context) {
  try {
    console.log(event);
    console.log(JSON.stringify(event));
    const body = extractBody(event);
    event.params = {...event.pathParameters, ...body, ...event.queryStringParameters};
    event.user = extractUserIdFromJWT(event.requestContext.authorizer.jwt);
    return await handler(event, context);
  } catch (err) {
    console.error({err});
    return stringifyBody(error2response(err));
  }
}

// Handler
async function handler(event, context) {
  try {
    let lastId = event.params.lastId;
    let pageSize = event.params.pageSize || 10;
    if(pageSize > 50) pageSize = 50;
    if(pageSize <= 0) pageSize = 1;

    if(sequelize == null) {
      sequelize = await loadSequelize();
    } 

    if(Post == null) {
      Post = sequelize._models['Post'];
      User = sequelize._models['User'];
    }
    
    const dbParam = {
      order: [['id', 'DESC']],
      limit: pageSize,
      include: [
        {model: User, required: true, attributes: ['username', 'id']}
      ]
    }

    if(lastId != null && lastId !== 0) {
      dbParam.where = {
        id: {
          [Op.lt]: lastId,
        }
      }
    };

    const posts = await Post.findAll(dbParam);
    const response = {
      statusCode: StatusCodes.OKAY,
      body: {
        posts: posts
      }
    }
    return stringifyBody(response);
    } catch(err) {
      console.error({err});
      return stringifyBody(error2response(err));
    }
}

exports.handler = handler;