/**
 * 
 * creates a thumbnail for a newly added image to the media bucket
 * stores the thumbnail in the thumbnail bucket
 * triggered by uploads to image bucket
 * 
 * taken from https://docs.aws.amazon.com/lambda/latest/dg/with-s3-tutorial.html#with-s3-tutorial-create-function-code
 * 
 */
const AWS = require('aws-sdk');
const sharp = require('sharp');

const s3 = new AWS.S3();

const thumbnailSize = 200; // in px
// const srcBucket = process.env.BUCKET_NAME_MEDIA;
const destBucket = process.env.BUCKET_NAME_THUMBNAILS;

async function handler(event, context) {
    try {
        const srcBucket = event.Records[0].s3.bucket.name;
        const srcKey    = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, " "));
        const dstBucket = destBucket;
        const dstKey    = "thumb_" + srcKey;

        // Infer the image type from the file suffix.
        const typeMatch = srcKey.match(/\.([^.]*)$/);
        if (!typeMatch) {
            console.log("Could not determine the image type.");
            return;
        }

        // Check that the image type is supported
        // TODO gifs
        const imageType = typeMatch[1].toLowerCase();
        if (imageType != "jpg" && imageType != "png") {
            console.log(`Unsupported image type: ${imageType}`);
            return;
        }
        const params = {
            Bucket: srcBucket,
            Key: srcKey
        };
        var origimage = await s3.getObject(params).promise();
        const meta = origimage.Metadata;
        // Use the sharp module to resize the image and save in a buffer.
        var buffer = await sharp(origimage.Body).resize(thumbnailSize, thumbnailSize, {fit: 'cover'}).toBuffer();

        // Upload the thumbnail image to the destination bucket
        const destparams = {
            Bucket: dstBucket,
            Key: dstKey,
            Body: buffer,
            ContentType: "image",
            Metadata: {
                "user": ""+meta.user, // need to be converted to string
                "post": ""+meta.post,
              }
        };

        await s3.putObject(destparams).promise();
      return event;
    } catch(err) {
      console.error({err});
      return stringifyBody(error2response(err));
    }
  }
  
  exports.handler = handler;