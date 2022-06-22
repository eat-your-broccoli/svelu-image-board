var assert = require('assert');
require('dotenv').config();

const {handler: createUser} =require('../createUser');
const { deleteUserByName, deleteUser } = require('../helpers/deleteUser');
const { extractBody } = require('../helpers/extractBody');

let user;

const username = "test-user2";
before(async () => {
    await deleteUserByName(username);
})

describe('createUser', function () {
  describe('creates a user', function () {
    it('should create entry in database', async function () {
      const response = await createUser({username, email: username}, {});
      user = extractBody(response).user;
      assert.equal(response.statusCode, 201);
      assert.equal(user.username, username);
    });
  });
});

after(async () => {
  if(user) await deleteUser(user.id);
})