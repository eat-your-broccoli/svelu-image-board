exports.extractBody = function(response) {
    return JSON.parse(response.body);
}