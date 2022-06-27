/* eslint-disable import/no-anonymous-default-export */
import React, { useContext, useState, useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { PostContext } from './PostContext';
import '../css/Overview.css'
import PostView from './PostView';
import Overview from './Overview';
import { AccountContext } from './Accounts';
import Upload from './Upload';
export default () => {
    const { isLoggedIn, isUpload} = useContext(AccountContext);

    return (
    <>
    {(isLoggedIn && isUpload) && 
       <Upload> </Upload>
    }
    { (isLoggedIn && isUpload === false) &&
        <Overview></Overview>
    }
    </>
  );
};