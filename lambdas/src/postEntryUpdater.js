const AWSXRay = require('aws-xray-sdk-core');
const AWSSDK = require('aws-sdk');
const {Sequelize} = require('sequelize');
const { loadSequelize } = require('./loadUmzug');
const AWS = AWSXRay.captureAWS(AWSSDK);
const {stringifyBody} = require('./helpers/stringifyBody');
const {error2response} = require('./helpers/error2response');

const s3 = new AWS.S3();

let sequelize = null;
let Post = null;

const bucketMediaUrl = process.env.BUCKET_MEDIA_URL+"/";
const bucketThumbsUrl = process.env.BUCKET_THUMBNAILS_URL+"/";

exports.lambdaHandler = async function(event, context) {
  try {
    return await handler(event, context);
  } catch (err) {
    console.error({err});
    return stringifyBody(error2response(err));
  }
}

// Handler
async function handler(event, context) {
  try {
        if(sequelize == null) {
            sequelize = await loadSequelize();
        } 
  
        if(Post == null) {
            Post = sequelize._models['Post'];
        }
        const thumbBucket = event.Records[0].s3.bucket.name;
        const srcKey    = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, " "));
        const params = {
            Bucket: thumbBucket,
            Key: srcKey
        };
        const thumbnailS3 = await s3.getObject(params).promise();
        const postId = parseInt(thumbnailS3.Metadata.post);
        const originalKey = thumbnailS3.Metadata.originalkey;
        const thumbnailUrl = bucketThumbsUrl+srcKey;
        const url = bucketMediaUrl+originalKey;
        await Post.update({thumbnail: thumbnailUrl, url}, {where: {id: postId}})
        return event;
  } catch(err) {
    console.error({err});
    return stringifyBody(error2response(err));
  }
}

exports.handler = handler;