var assert = require('assert');
require('dotenv').config();

const {handler: createUser} =require('../createUser');
const {handler: createPost} =require('../createPost');
const {handler: createComment} =require('../createComment');
const {handler: getCommentsForPost} =require('../getCommentsForPost');


const { deleteUserByName, deleteUser } = require('../helpers/deleteUser');

let user;
let otherUser;

const username = "test-user7";
const usernameOther = "test-otheruser_4";

before(async () => {
  await deleteUserByName(username);
  await deleteUserByName(usernameOther);
    
  let response = await createUser({username});
  user = response.user;
  response = await createUser({username: usernameOther});
  otherUser = response.user;
})

describe('getCommentsForPost', function () {
  describe('gets comments for post', function () {
    it('should return list of comments', async function () {
      const {post} = await createPost({
        user: user.id,
        title: "My title"
      });

      const {comment: c1} = await createComment({post: post.id, content: "Hi there 1", user: user.id}, {});
      const {comment: c2} = await createComment({post: post.id, content: "Hi there 2 from other user", user: otherUser.id}, {});
      const {comment: c3} = await createComment({post: post.id, content: "Hi there 3 from other user", user: otherUser.id}, {});
      
      const response = await getCommentsForPost({post:post.id});
      assert.equal(response.post, post.id);
      assert.equal(response.comments.length, 3);
      assert.equal(response.comments.find(c => c.id === c3.id).content, c3.content);
      assert.equal(response.comments.find(c => c.id === c3.id).User.username, otherUser.username);
    });
  });
});

after(async () => {
  await deleteUser(user.id);
  await deleteUser(otherUser.id);
})