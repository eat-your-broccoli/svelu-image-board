import React from 'react';
import { Account } from './components/Accounts';
import Signup from './components/Singup';
import Status from './components/Status';
import Login from './components/Login';
import GetPosts from './components/GetPosts';
import Header from './components/Header';

// eslint-disable-next-line import/no-anonymous-default-export
export default () => {
  return (
    <Account>
      <Header></Header>
      <Status />
      <Signup />
      <Login />
      <GetPosts/>
    </Account>
  );
};
