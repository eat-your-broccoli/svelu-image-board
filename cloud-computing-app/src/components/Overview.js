/* eslint-disable import/no-anonymous-default-export */
import React, { useContext, useState, useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { PostContext } from './PostContext';
import '../css/Overview.css'
import PostView from './PostView';

export default () => {
    const {posts} = useContext(PostContext);
    let flyingRequest = false; // state to slow, need traditional var
    let initialScroll = true;
    const [hasMorePosts, setHasMorePosts] = useState(true);
    const { getNewPosts, focussedPost, setFocussedPost } = useContext(PostContext);

    function getLastPostId() {
      if(posts.length === 0) return -1;
      return posts[posts.length-1].id;
    }

    const loadNext = (event) => {
      try {
        if(hasMorePosts === false) return;
        if(flyingRequest === true) return;
        flyingRequest = (true);
        const params = {};
        params.lastId = getLastPostId();
        params.pageSize = 10;
        getNewPosts(params).then((response) => {
          console.log({response})
          const newPosts = response.data.posts;
          const pageSize = response.data.pageSize;
          if(newPosts.length < pageSize) {
            console.log('received less posts than page size. No more new posts');
            setHasMorePosts(false);
          }
          flyingRequest = (false);
          if(initialScroll && hasMorePosts) onLoaded(event);
        })
      } catch (err) {
        console.log({err});
        flyingRequest = (false);
      }
    } 

    useEffect(() => {
      if(posts.length === 0) loadNext()
    }, [posts]);

    const openPost = (event) => {
      const postId = event.currentTarget.getAttribute("data-value");
      setFocussedPost(postId);
    }

    const onLoaded = () => {
      const elem = document.getElementById("scrollableDiv");
      const clientHeight = elem.clientHeight;
      const scrollHeight = elem.scrollHeight;
      const height = elem.height;
      console.log({scrollHeight, clientHeight, height})
      if(scrollHeight === clientHeight) setTimeout(() => loadNext(), 10);
      else initialScroll = false;
    }

    return (
      <>
      {focussedPost == null &&
        <div
          id="scrollableDiv"
          style={{
            height: '80vh',
            overflow: 'hidden auto',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          
          <InfiniteScroll
              scrollableTarget="scrollableDiv"
              id="myScrollyMcScroll"
              className='infinite-scroll'
              style={{heigt: 'auto'}}
              dataLength={posts.length} //This is important field to render the next data
              next={loadNext}
              hasMore={hasMorePosts}
              loader={
                <div className='scroll-message-container'>
                  <p> loading more posts ... </p>
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
                  <div className='thumbnail-container' key={index} onClick={openPost} data-value={i.id}>
                    <img src={i.thumbnail} alt={"Thumbnail of post "+i.id}></img>
                  </div>
                ))}
          </InfiniteScroll>
        </div>     
      }
      {focussedPost &&
        <PostView></PostView>
      }
    </>
  );
};