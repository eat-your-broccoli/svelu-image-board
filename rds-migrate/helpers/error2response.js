'use strict';
const StatusCodes = require('../StatusCodes');

exports.error2response = function(error) {
    const response = {};
    response.statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR
    response.body = {};
    response.body.message = error.message;
    return response;
}