import React from 'react';
import { Account } from './components/Accounts';
import GetPosts from './components/GetPosts';
import Header from './components/Header';
import Overview from './components/Overview';
import { Posts } from './components/PostContext';

// eslint-disable-next-line import/no-anonymous-default-export
export default () => {
  return (
    <Account>
      <Header></Header>
      <Posts>
        <Overview></Overview>
      </Posts>
    </Account>
  );
};
