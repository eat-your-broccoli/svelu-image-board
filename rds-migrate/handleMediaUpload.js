const AWS = require('aws-sdk')
const multipart = require('aws-lambda-multipart-parser')
const s3 = new AWS.S3();

exports.lambdaHandler = async (event) => {
    console.log(event);
  const form = multipart.parse(event, false)
  console.log({form});
  // const s3_response = await upload_s3(form)
  return {
    statusCode: '200',
    body: JSON.stringify({ success: true })
  }
};

// const upload_s3 = async (form) => {
//   const uniqueId = Math.random().toString(36).substr(2, 9);
//   const key = `${uniqueId}_${form.image.filename}`

//   const request = {
//     Bucket: 'bucket-name',
//     Key: key,
//     Body: form.image.content,
//     ContentType: form.image.contentType,
//   }
//   try {
//     const data = await s3.putObject(request).promise()
//     return data
//   } catch (e) {
//     console.log('Error uploading to S3: ', e)
//     return e
//   }
// }