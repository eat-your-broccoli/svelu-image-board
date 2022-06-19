var assert = require('assert');
require('dotenv').config();

const createComment =require('../createComment');
const {handler: createUser} =require('../createUser');
const { deleteCommentByUser } = require('../helpers/deleteComment');
const { deleteUser, deleteUserByName } = require('../helpers/deleteUser');

const {handler: createPost} =require('../createPost');
const { extractBody } = require('../helpers/extractBody');
let user;
const username = "test-user-comment";

before(async () => {
    await deleteUserByName(username);
    const response = await createUser({username});
    user = extractBody(response).user;
})

describe('createComment', function () {
  describe('creates a comment', function () {
    it('should return the id of the comment that was created', async function () {
      let post = await createPost({
          user: user.id,
          thumbnail: null,
          url: null,
          title: "My title"
      });
        post = extractBody(post).post;
        const event = {post: post.id, content: "Hi there", user: user.id};
        const response = extractBody(await createComment.handler(event, {}));
        assert.equal((response.comment.id != null || response.comment.id === 0), true);
    });
  });
});

after(async () => {
    await deleteUser(user.id);
})