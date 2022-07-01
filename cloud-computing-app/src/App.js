import React from 'react';
import { Account } from './components/Accounts';
import Header from './components/Header';
import { Posts } from './components/PostContext';
import Router from './components/Router';

// eslint-disable-next-line import/no-anonymous-default-export
export default () => {
  return (
    <Account>
      <Header></Header>
      <Posts>
        <Router></Router>
      </Posts>
    </Account>
  );
};
