exports.stringifyBody = function(response) {
    if(response.body && typeof response.body != 'string') {
        response.body = JSON.stringify(response.body);
    }
    return response;
}