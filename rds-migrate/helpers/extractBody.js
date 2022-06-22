exports.extractBody = function(response) {
    if(response.body && typeof response.body === 'string') {
        return JSON.parse(response.body);
    }
    return {};
}