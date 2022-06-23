/* eslint-disable import/no-anonymous-default-export */
import { useContext, useState } from 'react';
import '../css/Header.css'
import { AccountContext } from './Accounts';
export default () => {
    const {username} = useContext(AccountContext);
    return (
        <div class="header-block left-flex">Logged in as {username}</div>
    );
}