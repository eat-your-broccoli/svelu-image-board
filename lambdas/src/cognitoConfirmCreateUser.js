const {handler: createUser} = require('./createUser');

exports.handler = async (event, context, callback) => {
    const params = {username: event.userName, email: event.request.userAttributes.email};
    try {
        await createUser(params, {});
        return event;
    } catch (err) {
        console.error({err});
        return error;
    } 
};