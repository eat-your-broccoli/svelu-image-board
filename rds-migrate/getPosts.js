'use strict';

const AWSXRay = require('aws-xray-sdk-core');
const AWSSDK = require('aws-sdk');
const {Sequelize, Op} = require('sequelize');
const { loadSequelize } = require('./loadUmzug');
const AWS = AWSXRay.captureAWS(AWSSDK);
const StatusCodes = require('./StatusCodes');
const { stringifyBody } = require('./helpers/stringifyBody');
const { error2response } = require('./helpers/error2response');

// Create client outside of handler to reuse
const lambda = new AWS.Lambda()

let sequelize = null;
let Post = null;
let User = null;

// Handler
exports.handler = async function(event, context) {
  try {
    let lastId = event.lastId;
    let pageSize = event.pageSize || 10;
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