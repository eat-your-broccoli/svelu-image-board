/* eslint-disable import/no-anonymous-default-export */
import { useContext, useState, useEffect } from 'react';
import '../css/Header.css'
import { AccountContext } from './Accounts';
import Login from './Login';
import UserInfo from './UserInfo';

export default () => {
    const {isLoggedIn, getSession} = useContext(AccountContext);
    
    // run automatically, getSession if there is one stored
    useEffect(() => {
        if(!isLoggedIn) getSession();
      }, []);


    return (
    <>
        <div className='header height30'>
        <div className="header-block">SVELU</div>
            {isLoggedIn &&
                <UserInfo></UserInfo>
            }
            {isLoggedIn === false &&
                <Login></Login>
            }
        </div>
    </>
    
    );
}