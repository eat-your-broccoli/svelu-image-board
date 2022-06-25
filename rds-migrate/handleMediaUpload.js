'use strict';

/**
 * handleMediaUpload
 * 
 * this file handles a users desire to upload an image to the plattform
 * 
 * required params in the body are:
 * [JSON]
 * "file": the base64 encoded, not exceeding fileSize [base64/string]
 * "contentType": the content-type, allowed is 'image/jpg', 'image/jpeg', 'image/png', 'image/gif' [string]
 * "title": the title of the post [string]
 * 
 */
const AWSXRay = require('aws-xray-sdk-core');
const AWSSDK = require('aws-sdk');
const AWS = AWSXRay.captureAWS(AWSSDK);
const StatusCodes = require('./StatusCodes');
const { stringifyBody } = require('./helpers/stringifyBody');
const { error2response } = require('./helpers/error2response');
const { extractBody } = require('./helpers/extractBody');
const { extractUserIdFromJWT } = require('./helpers/extractUserIdFromJWT');
const {handler: createPost} = require('./createPost');

const maxFileSize = 4 * 1024 * 1024;
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
    const post = await createPost({params: {user: event.user, title: event.params.title}});
    const postBody = JSON.parse(post.body);
    const postId = postBody.post.id;

    let {file: fileBase64Encoded, contentType} = event.params;
    if(['image/jpeg', 'image/jpg', 'image/png', 'image/gif'].includes(contentType) === false) {
      const err = new Error("invalid content type: "+contentType);
      err.statusCode = StatusCodes.BAD_REQ;
      throw err;
    }
    let fileEnding = '';
    switch(contentType) {
      case 'image/jpeg': fileEnding = 'jpg'; break;
      case 'image/jpg': fileEnding = 'jpg'; break;
      case 'image/png': fileEnding = 'png'; break;
      case 'image/gif': fileEnding = 'gif'; break;
    }
    
    // remove that pesky pseudo-header
    fileBase64Encoded = fileBase64Encoded.replace(/^data:image\/\w+;base64,/, "");
    // check if the file is smaller than maxFileSize
    const size = Buffer.byteLength(fileBase64Encoded);
    if(size > maxFileSize) {
      const err = new Error("size exceeds limit: "+(maxFileSize/1024)+ " kb");
      err.statusCode = StatusCodes.BAD_REQ;
      throw err;
    }

    const buffer = Buffer.from(fileBase64Encoded, 'base64');
    const uploadParams = {
      Bucket: process.env.BUCKET_NAME_MEDIA,
      Key: postId +"."+fileEnding,
      Body: buffer,
      ContentEncoding: "base64", //we tell s3 to deal with that base64 encoded by themselves. we have spent enough time doing that ourselves
      ContentType: contentType
    }

    let uploadResult = new AWS.S3.ManagedUpload({
      partSize: 10 * 1024 * 1024, queueSize: 1,
      params: uploadParams,
    });
    uploadResult = await uploadResult.promise(); 
    const response = {statusCode: StatusCodes.CREATED, body: {post: postBody, upload: uploadResult }};
    return stringifyBody(response);
    } catch(err) {
      console.error({err});
      return stringifyBody(error2response(err));
    }
}

exports.handler = handler;