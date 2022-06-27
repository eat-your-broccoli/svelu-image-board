/* eslint-disable import/no-anonymous-default-export */
import React, { useContext, useState, useEffect } from 'react';
import { PostContext } from './PostContext';
import '../css/PostView.css'
import GetAxiosInstance from "../logic/axios.instance";

import routes from '../config/routes.config.json'
import CommentWrite from './CommentWrite';
import Comment from './Comment';

export default (props) => {
    const {focussedPost, setFocussedPost, posts} = useContext(PostContext);
    const [comments, setComments] = useState([]);
    const [commentsLoaded, setCommentsLoaded] = useState(false);
    

    const axios = GetAxiosInstance();  

    const post = posts.find((p) => {
        return p.id = focussedPost;
    })
    
    useEffect(() => {
        loadComments()
      }, []);

    const loadComments = () => {
        const requestConfig = {

        };
        const route = routes.comment.get.replace('{post}', focussedPost);
        axios.get(route, requestConfig)
                .then(result => {
                    const {comments} = result.data;
                    setComments(comments);
                    setCommentsLoaded(true);
                })
                .catch((err, data) => {
                    console.log({err});
                })
    }

    const closePostView = () => {
        setFocussedPost(null);
    }

    return (
    <div className="post-view-container">
        <button style={{float: 'right'}}onClick={closePostView}> X </button>
        {post &&
            <>            
            <div className="block">
                <h2 style={{textAlign: 'center'}}>{post.title}</h2>
                <div className='img-container'>
                    <img className="img-view" src={post.url} alt={post.title}></img>
                </div>
                <p style={{textAlign:'right', marginRight: '10px'}}>uploaded by {post.User.username}</p>
            </div>
            <div className ="block comments-container">
                <button style={{float: 'right'}}onClick={loadComments}> reload comments </button>
                {commentsLoaded && comments.length === 0 &&               
                    <p>No comments for this post</p>
                } 
                { comments.length > 0 &&
                <>
                    <p style={{marginBottom: '5px'}}>{comments.length} {comments.length === 1 ? 'comment' : 'comments'} on this post</p>
                    <div>
                        { comments.map((comment,i) => (
                            <>
                                <Comment username={comment.User.username} commentText={comment.content}></Comment>
                            </>
                        ))}
                    </div>
                </>
                    
                } 
                {commentsLoaded === false && comments.length === 0 && 
                    <p> loading comments ... </p>
                }
                <CommentWrite postId={focussedPost}></CommentWrite>
            </div>
            </>
        }
    </div>
  );
};