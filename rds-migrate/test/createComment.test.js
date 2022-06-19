var assert = require('assert');
require('dotenv').config();

const createComment =require('../createComment');
const {handler: createUser} =require('../createUser');
const { deleteCommentByUser } = require('../helpers/deleteComment');
const { deleteUser, deleteUserByName } = require('../helpers/deleteUser');

const {handler: createPost} =require('../createPost');
let user;
const username = "test-user-comment";

before(async () => {
    await deleteUserByName(username);
    const response = await createUser({username});
    user = response.user;
})

describe('createComment', function () {
  describe('creates a comment', function () {
    it('should return the id of the comment that was created', async function () {
      const {post} = await createPost({
          user: user.id,
          thumbnail: null,
          url: null,
          title: "My title"
      })
        const event = {post: post.id, content: "Hi there", user: user.id};
        const response = await createComment.handler(event, {});
        assert.equal(response.statusCode, 201);
        assert.equal((response.comment.id != null || response.comment.id === 0), true);
    });
  });
});

after(async () => {
    await deleteUser(user.id);
})