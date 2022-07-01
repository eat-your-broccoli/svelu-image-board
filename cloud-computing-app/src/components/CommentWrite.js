/* eslint-disable import/no-anonymous-default-export */
import React, {  useState } from 'react';
import '../css/PostView.css'
import GetAxiosInstance from "../logic/axios.instance";

import routes from '../config/routes.config.json'

export default (props) => {
    const [text, setText] = useState('');
    const [response, setResponseText] = useState('');
    
    const axios = GetAxiosInstance();  
  
    const post = props.postId;

    const sendComment = () => {
        setResponseText('');
        const body = {
           content: text.trim(),
        };
        const route = routes.comment.post.replace('{post}', post);
        axios.post(route, body)
                .then(result => {
                    console.log({result});
                    setText('');
                    setResponseText('comment created!');
                })
                .catch((err, data) => {
                    console.log({err});
                    console.log({data})
                    if(err && err.response && err.response.data && err.response.data.message) {
                        setResponseText(err.response.data.message)
                    } else {
                        setResponseText(err.message);
                    }
                })
    }

    return (
        <div style={{display: 'flex', flexDirection: 'column', marginTop: '5px'}}>
            <textarea
            style= {{ padding: '5px', minWidth: '300px', maxWidth: "80vw", backgroundColor: '#1B1E1F', border: 'none', color: 'white', resize: 'vertical'}}
            value={text}
            onChange={event => setText(event.target.value)}
            type="text"
            placeholder="Write your comment ..."
          />
          <button onClick={sendComment}>Send comment</button>
          <p>{response}</p>
        </div>    
    );
};