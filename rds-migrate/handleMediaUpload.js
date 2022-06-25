'use strict';

const AWSXRay = require('aws-xray-sdk-core');
const AWSSDK = require('aws-sdk');
const {Sequelize, Op} = require('sequelize');
const { loadSequelize } = require('./loadUmzug');
const AWS = AWSXRay.captureAWS(AWSSDK);
const S3 = new AWS.S3();
const StatusCodes = require('./StatusCodes');
const { stringifyBody } = require('./helpers/stringifyBody');
const { error2response } = require('./helpers/error2response');
const { extractBody } = require('./helpers/extractBody');
const { extractUserIdFromJWT } = require('./helpers/extractUserIdFromJWT');
const {handler: createPost} = require('./createPost');

let sequelize = null;
let Post = null;
let User = null;

exports.lambdaHandler = async function(event, context) {
  try {
    console.log(event);
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

    // TODO create db entry for post
    const post = await createPost({params: {user: event.user, title: event.params.title}});
    console.log({post});
    const postBody = JSON.parse(post.body);
    const postId = postBody.id;

    const {file: fileBase64Encoded, contentType, fileName} = event.params;
    const binaryData = Buffer.from(fileBase64Encoded, 'base64').toString('binary');

    const file = {
      Bucket: process.env.BUCKET_NAME_MEDIA, // TODO set env BUCKET_NAME
      Key: postId + ".jpg",
      Body: binaryData,
      ContentType: contentType
    }
    // TODO put that "file" on the s3 storage
    // const uploadResult = await S3.putObject(file).promise();
    let uploadResult = new AWS.S3.ManagedUpload({
      partSize: 10 * 1024 * 1024, queueSize: 1,
      params: file,
    });
    uploadResult.on('httpUploadProgress', (tick) => {
      console.log({tick})
    });
    uploadResult = await uploadResult.promise();
    console.log({uploadResult});
    const response = {statusCode: StatusCodes.OKAY, body: {post: postBody, }};
    return stringifyBody(response);
    } catch(err) {
      console.error({err});
      return stringifyBody(error2response(err));
    }
}

exports.handler = handler;