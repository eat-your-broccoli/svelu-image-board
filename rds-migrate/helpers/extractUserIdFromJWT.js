/**
 * extracts the userId from an JWT
 */

exports.extractUserIdFromJWT = (token) => {
    if(token.claims 
        && (token.claims.userId || token.claims.userId == 0)) {
        return parseInt(token.claims.userId);
    }
    throw new Error("userId not present in claims of jwt");
}