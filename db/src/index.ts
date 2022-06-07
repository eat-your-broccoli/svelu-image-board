import AWSXRay from 'aws-xray-sdk-core';
import AWSSDK from 'aws-sdk';
const AWS = AWSXRay.captureAWS(AWSSDK)

// Create client outside of handler to reuse
const lambda = new AWS.Lambda()

// Handler
exports.handler = async function(event: { Records: any[]; }, context: any) {
  event.Records.forEach(record => {
    console.log(record.body)
  })
  console.log('## ENVIRONMENT VARIABLES: ' + serialize(process.env))
  console.log('## CONTEXT: ' + serialize(context))
  console.log('## EVENT: ' + serialize(event))
  
  return getAccountSettings()
}

// Use SDK client
function getAccountSettings(){
  return lambda.getAccountSettings().promise()
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serialize (object: any) {
  return JSON.stringify(object, null, 2)
}