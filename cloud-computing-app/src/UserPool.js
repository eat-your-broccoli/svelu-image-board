import { CognitoUserPool } from 'amazon-cognito-identity-js';
import cognitoConfig from "./config/cognito.config.json"

const poolData = {
  UserPoolId: cognitoConfig.UserPoolId,
  ClientId: cognitoConfig.ClientId
};

export default new CognitoUserPool(poolData);