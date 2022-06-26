/* eslint-disable import/no-anonymous-default-export */
import React, { useContext, useState, useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { PostContext } from './PostContext';
import '../css/Overview.css'

export default () => {
    const {posts} = useContext(PostContext);
    let flyingRequest = false;
    const [hasMorePosts, setHasMorePosts] = useState(true);
    const { getNewPosts } = useContext(PostContext);

    function getLastPostId() {
      if(posts.length === 0) return -1;
      return posts[posts.length-1].id;
    }

    // taken from https://github.com/then/is-promise/blob/master/index.js
    function isPromise(obj) {
      return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
    }

    const loadNext = () => {
      try {
        console.log(Date.now(), hasMorePosts, flyingRequest)
        if(hasMorePosts === false) return;
        if(flyingRequest === true) return;
        flyingRequest = (true);
        const params = {};
        params.lastId = getLastPostId();
        params.pageSize = 20;
        getNewPosts(params).then((response) => {
          console.log({response})
          const newPosts = response.data.posts;
          const pageSize = response.data.pageSize;
          if(newPosts.length < pageSize) {
            console.log('received less posts than page size. No more new posts');
            setHasMorePosts(false);
          }
          flyingRequest = (false);
        })
      } catch (err) {
        console.log({err});
        flyingRequest = (false);
      }
    }

    useEffect(() => {
      if(posts.length === 0) loadNext()
    }, [posts]);

    return (
      <div
        id="scrollableDiv"
        style={{
          height: '80vh',
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
    <InfiniteScroll
        scrollableTarget="scrollableDiv"
        className='infinite-scroll'
        dataLength={posts.length} //This is important field to render the next data
        next={loadNext}
        hasMore={hasMorePosts}
        loader={
          <div className='scroll-message-container'>
            <p> loading </p>
          </div>
        }
        endMessage={
          <div className='scroll-message-container'>
            <p style={{ textAlign: 'center' }}>
            <b>No more posts</b>
            </p>
          </div>
        }
        >
        {posts.map((i, index) => (
            <div className='thumbnail-container' key={index}>
              <img src={i.thumbnail} alt={"Thumbnail of post "+i.id}></img>
            </div>
          ))}
    </InfiniteScroll>
    </div>
  );
};