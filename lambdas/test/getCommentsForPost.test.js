var assert = require('assert');
require('dotenv').config();

const {handler: createUser} =require('../src/createUser');
const {handler: createPost} =require('../src/createPost');
const {handler: createComment} =require('../src/createComment');
const {handler: getCommentsForPost} =require('../src/getCommentsForPost');


const { deleteUserByName, deleteUser } = require('../src/helpers/deleteUser');
const { extractBody } = require('../src/helpers/extractBody');

let user;
let otherUser;

const username = "test-user7";
const usernameOther = "test-otheruser_4";

before(async () => {
  await deleteUserByName(username);
  await deleteUserByName(usernameOther);
    
  let response = await createUser({username, email: username});
  user = extractBody(response).user;
  response = await createUser({username: usernameOther, email: usernameOther});
  otherUser = extractBody(response).user;
})

describe('getCommentsForPost', function () {
  describe('gets comments for post', function () {
    it('should return list of comments', async function () {
      let post = await createPost({
        params: {
        user: user.id,
        title: "My title"
      }});
      post = extractBody(post).post;

      const c1 = await createComment({params: {post: post.id, content: "Hi there 1", user: user.id}}, {});
      const c2 = await createComment({params: {post: post.id, content: "Hi there 2 from other user", user: otherUser.id}}, {});
      let c3 = await createComment({params: {post: post.id, content: "Hi there 3 from other user", user: otherUser.id}}, {});
      c3 = extractBody(c3).comment;
      let response = await getCommentsForPost({params: {post:post.id}});
      response = extractBody(response);
      assert.equal(response.post, post.id);
      assert.equal(response.comments.length, 3);
      assert.equal(response.comments.find(c => c.id === c3.id).content, "Hi there 3 from other user");
      assert.equal(response.comments.find(c => c.id === c3.id).User.username, usernameOther);
    });
  });
});

after(async () => {
  await deleteUser(user.id);
  await deleteUser(otherUser.id);
})