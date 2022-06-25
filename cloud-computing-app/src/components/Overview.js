/* eslint-disable import/no-anonymous-default-export */
import React, { useContext, useState, useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { PostContext } from './PostContext';

export default () => {
    const [posts, setPosts] = useState([]);
    const [hasMorePosts, setHasMorePosts] = useState(true);
    const { getNewPosts } = useContext(PostContext);

    // taken from https://github.com/then/is-promise/blob/master/index.js
    function isPromise(obj) {
      return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
    }

    const loadNext = async () => {
      try {
        const response = await getNewPosts();
        const newPosts = response.data.posts;
        const pageSize = response.pageSize;
        if(newPosts.length < pageSize) {
          console.log('received less posts than page size. No more new posts');
          setHasMorePosts(false);
        }
      } catch (err) {
        console.log({err});
      }
    }

    useEffect(() => {
      if(posts.length === 0) loadNext()
    }, [posts]);

    const style = {
        height: 30,
        border: "1px solid green",
        margin: 6,
        padding: 8
      };

    return (
      <div
        id="scrollableDiv"
        style={{
          height: '40vh',
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
    <InfiniteScroll
        dataLength={posts.length} //This is important field to render the next data
        next={loadNext}
        hasMore={hasMorePosts}
        loader={<h4>Loading...</h4>}
        endMessage={
            <p style={{ textAlign: 'center' }}>
            <b>No more posts</b>
            </p>
        }
        >
        {posts.map((i, index) => (
            <div style={style} key={index}>
              div - #{index}
            </div>
          ))}
    </InfiniteScroll>
    </div>
  );
};