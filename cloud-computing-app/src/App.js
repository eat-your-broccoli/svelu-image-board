import React from 'react';
import { Account } from './components/Accounts';
import GetPosts from './components/GetPosts';
import Header from './components/Header';

// eslint-disable-next-line import/no-anonymous-default-export
export default () => {
  return (
    <Account>
      <Header></Header>
      <GetPosts/>
    </Account>
  );
};
