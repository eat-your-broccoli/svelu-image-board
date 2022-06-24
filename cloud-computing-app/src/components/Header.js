/* eslint-disable import/no-anonymous-default-export */
import { useContext, useState } from 'react';
import '../css/Header.css'
import { AccountContext } from './Accounts';
import Login from './Login';
import UserInfo from './UserInfo';

export default () => {
    const {isLoggedIn} = useContext(AccountContext);
    return (
    <div class="header height">
        <div class="header-block">SVELU</div>
        {isLoggedIn &&
            <UserInfo></UserInfo>
        }
        {isLoggedIn === false &&
            <Login></Login>
        }
        
    </div>
    );
}