/**
 * cognitoPreTokenGen
 * 
 * this function is triggered when the user signs in to the cognito user pool and a new JWT (token for authentication) is created
 * this function looks up the user in the Database and adds the user's id to the JWT
 * this allows later in the API to easily authenticate the user, e.g. when creating a post, we know which userid to assign to the post
 * 
 * The attribute userId is available in the JWT at <yourJWT>.userId
 */
const {Sequelize} = require('sequelize');
const { loadSequelize } = require('./loadUmzug');
let sequelize;
let User;
exports.handler = async (event, context, callback) => {
    if(sequelize == null) {
        sequelize = await loadSequelize();
    } 
    if(User == null) {
        User = require('./models/user')(sequelize, Sequelize);
    }
    const email = event.request.userAttributes.email;
    const myUser = await User.findOne({where: {email}});
    if(myUser == null) throw new Error("No user found with email "+email);
    const {id} = myUser;

    if(event.response.claimsOverrideDetails == null)  event.response.claimsOverrideDetails = {};
    if(event.response.claimsOverrideDetails.claimsToAddOrOverride == null) 
        event.response.claimsOverrideDetails.claimsToAddOrOverride = {};
    event.response.claimsOverrideDetails.claimsToAddOrOverride.userId = id;
    return event;
};