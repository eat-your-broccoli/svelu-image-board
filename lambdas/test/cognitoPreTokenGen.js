var assert = require('assert');
require('dotenv').config();

const {handler: cognitoPreTokenGen} =require('../src/cognitoPreTokenGen');
const { deleteUser, deleteUserByName } = require('../src/helpers/deleteUser');
const {handler: createUser} =require('../src/createUser');

const { extractBody } = require('../src/helpers/extractBody');
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