/* eslint-disable import/no-anonymous-default-export */
import React, { useContext, useState, useEffect } from 'react';
import { PostContext } from './PostContext';
import '../css/Overview.css'

export default (props) => {
    console.log({props});
    const {posts} = useContext(PostContext);

    return (
    <div>
        <p>Post view</p>
    </div>
  );
};