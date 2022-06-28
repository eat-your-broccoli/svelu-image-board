'use strict';

var assert = require('assert');
require('dotenv').config();

const {handler: createUser} =require('../src/createUser');
const {handler: createPost} =require('../src/createPost');
const {handler: getPosts} =require('../src/getPosts');


const { deleteUserByName, deleteUser } = require('../src/helpers/deleteUser');
const { getHeapCodeStatistics } = require('v8');
const { extractBody } = require('../src/helpers/extractBody');

let user;


const username = "test-user6";

beforeEach(async () => {
  await deleteUserByName(username);
    
  let response = await createUser({username, email: username});
  user = extractBody(response).user;
})

describe('getPosts', function () {
  describe('gets posts', function () {
    it('should return list of posts', async function () {
      let posts = [];
      for(let i = 0; i < 10; i++) {
        const promise = createPost({params: {
          user: user.id,
          title: "Test post No "+(i+1)
        }});
        posts.push(promise);
      }
      posts = await Promise.all(posts);
      const event = {
        params: {
        pageSize: 10
      }
      }
      let response = await getPosts(event, {});
      response = extractBody(response);
      assert.equal(response.posts.length, 10);
      assert.equal(response.posts[0].User.id, user.id);
    });

    it('should return list of some posts', async function () {
      let posts = [];
      for(let i = 0; i < 10; i++) {
        const promise = createPost({params: {
          user: user.id,
          title: "Test post No "+(i+1)
        }});
        posts.push(promise);
      }
      posts = await Promise.all(posts);
      posts = posts.map(p => extractBody(p));
      const ids = posts.map(p => p.post.id);
      const maxId = Math.max(...ids);
  
      let lastId = maxId - 4;
      const event = {params: {
        pageSize: 10,
        lastId // offset by 5
      }}
      let response = await getPosts(event, {});
      response = extractBody(response);
      const idsFiltered = response.posts.map(p => p.id);
      const maxFilteredId = Math.max(...idsFiltered);
      assert.equal(maxFilteredId < lastId, true );
      assert.equal(maxFilteredId + 1, lastId);
      
      assert.equal(response.posts[0].User.id, user.id);
    });
  });
});

after(async () => {
  await deleteUser(user.id);
})