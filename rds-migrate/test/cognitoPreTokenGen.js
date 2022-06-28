var assert = require('assert');
require('dotenv').config();

const {handler: cognitoPreTokenGen} =require('../cognitoPreTokenGen');
const { deleteUser, deleteUserByName } = require('../helpers/deleteUser');
const {handler: createUser} =require('../createUser');

const { extractBody } = require('../helpers/extractBody');
let user;
const username = "test-user-pretokengen";
const email = username + "@example.com"

before(async () => {
    await deleteUserByName(username);
    const response = await createUser({username, email});
    user = extractBody(response).user;
})

describe('cognitoPreTokenGen', function () {
  describe('adds userid to JWT', function () {
    it('should return the userId', async function () {
        const event = {
            response: {}, 
            request: {
                userAttributes: {
                    email,
                }
            }
        };
        const response = await cognitoPreTokenGen(event, {}, null);
        assert.equal(response.response.claimsOverrideDetails.claimsToAddOrOverride.userId, user.id);
    });
  });
});

after(async () => {
    await deleteUser(user.id);
})