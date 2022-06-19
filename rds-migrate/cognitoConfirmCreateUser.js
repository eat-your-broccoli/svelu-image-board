const {handler: createUser} = require('./createUser');

exports.handler = async function(event, context, callback) {
    event.username = event.userName;
    event.email = event.request.userAttributes.email;

    return new Promise((resolve, reject) => {
        createUser(event, context)
        .then(result => {
            console.log({result});
            callback(null, event)
        })
        .catch(err =>{
            console.error(err);
            callback(err, event);
        });
    })
};