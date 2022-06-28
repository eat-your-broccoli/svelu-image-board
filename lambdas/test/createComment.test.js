var assert = require('assert');
require('dotenv').config();

const createComment =require('../src/createComment');
const {handler: createUser} =require('../src/createUser');
const { deleteCommentByUser } = require('../src/helpers/deleteComment');
const { deleteUser, deleteUserByName } = require('../src/helpers/deleteUser');

const {handler: createPost} =require('../src/createPost');
const { extractBody } = require('../src/helpers/extractBody');
let user;
const username = "test-user-comment";

before(async () => {
    await deleteUserByName(username);
    const response = await createUser({username, email: "test"});
    user = extractBody(response).user;
})

describe('createComment', function () {
  describe('creates a comment', function () {
    it('should return the id of the comment that was created', async function () {
      let post = await createPost({params: {
          user: user.id,
          thumbnail: null,
          url: null,
          title: "My title"
      }});
        post = extractBody(post).post;
        const event = {};
        event.params = {post: post.id, content: "Hi there", user: user.id};
        const response = extractBody(await createComment.handler(event, {}));
        assert.equal((response.comment.id != null || response.comment.id === 0), true);
    });
  });
});

after(async () => {
    await deleteUser(user.id);
})