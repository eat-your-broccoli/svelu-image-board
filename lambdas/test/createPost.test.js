var assert = require('assert');
require('dotenv').config();

const {handler: createPost} =require('../src/createPost');
const {handler: createUser} =require('../src/createUser');
const { deletePostsByUser } = require('../src/helpers/deletePost');
const { deleteUserByName, deleteUser } = require('../src/helpers/deleteUser');
const { extractBody } = require('../src/helpers/extractBody');

let user;
const username = "test-user-post";


before(async () => {
    await deleteUserByName(username);
    const response = await createUser({username, email: username});
    user = extractBody(response).user;
})

describe('createPost', function () {
  describe('creates a post', function () {
    it('should return the id of the comment that was created', async function () {
        const p = {params: {
          user: user.id,
          thumbnail: null,
          url: null,
          title: "My title"
        }}
        const response = extractBody(await createPost(p));
        assert.equal(response.post.title, "My title");
        assert.equal(response.post.id >= 0, true); 
    });
  });
});

after(async () => {
    await deleteUser(user.id);
})