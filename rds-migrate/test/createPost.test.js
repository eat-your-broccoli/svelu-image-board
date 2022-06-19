var assert = require('assert');
require('dotenv').config();

const {handler: createPost} =require('../createPost');
const {handler: createUser} =require('../createUser');
const { deletePostsByUser } = require('../helpers/deletePost');
const { deleteUserByName, deleteUser } = require('../helpers/deleteUser');

let user;
const username = "test-user-post";

before(async () => {
    await deleteUserByName(username);
    const response = await createUser({username});
    user = response.user;
})

describe('createPost', function () {
  describe('creates a post', function () {
    it('should return the id of the comment that was created', async function () {
        const response = await createPost({
            user: user.id,
            thumbnail: null,
            url: null,
            title: "My title"
        })
        assert.equal(response.statusCode, 201);
        assert.equal(response.post.title, "My title");
        assert.equal(response.post.id >= 0, true); 
    });
  });
});

after(async () => {
    await deleteUser(user.id);
})