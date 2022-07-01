/* eslint-disable import/no-anonymous-default-export */
import React, { useContext } from 'react';
import '../css/Overview.css'
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