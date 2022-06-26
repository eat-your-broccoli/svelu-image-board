import React, { createContext, useState } from 'react'
import routes from '../config/routes.config.json';
import GetAxiosInstance from "../logic/axios.instance";

const PostContext = createContext()

const Posts = (props) => {
  
    const axios = GetAxiosInstance();
    const [posts, setPosts] = useState([]);
    const [focussedPost, setFocussedPost] = useState(null);

    const getNewPosts = async(params = {}) => {
        const lastId = params.lastId;
        const pageSize = params.pageSize || 15;

        const requestConfig = {
            params: {}
        };
        requestConfig.params.pageSize = pageSize;
        if(lastId || lastId === 0) requestConfig.params.lastId = lastId;

        return new Promise((resolve, reject) => {
            axios.get(routes.post.get, requestConfig)
                .then(result => {
                    const newPosts = result.data.posts;
                    const combinedPosts = posts.concat(newPosts);
                    setPosts(combinedPosts);
                    resolve({pageSize, data: result.data});
                })
                .catch((err, data) => {
                    reject(err);
                })
        })
        
    }

    const getPosts = () => {
      return posts;
    }

  return (
    <PostContext.Provider
      value={{
        posts,
        getPosts,
        getNewPosts,
        setFocussedPost,
        focussedPost
      }}
    >
      {props.children}
    </PostContext.Provider>
  )
}

export { Posts, PostContext }