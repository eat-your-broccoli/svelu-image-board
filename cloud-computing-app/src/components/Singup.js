/* eslint-disable import/no-anonymous-default-export */
import React, { useState } from 'react';
import UserPool from '../UserPool';

export default () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [emailRepeat, setEmailRepeat] = useState('');
  const [errorText, setErrorText] = useState('');
  
  const [password, setPassword] = useState('');

  const onSubmit = event => {
    event.preventDefault();
    setErrorText('');
    if(email !== emailRepeat) throw new Error("emails don't match");
    if(username == null || username.length < 3) throw new Error("username has to be at least three characters long");

    const attributes = [];
    attributes.push({
      Name: "email",
      Value: email
    });

    UserPool.signUp(username, password, attributes, null, (err, data) => {
      if (err) {
        console.error(err);
        setErrorText(err.message);
      }
      console.log(data);
    });
  };

  return (
    <div>
      <form onSubmit={onSubmit}>
        <input
          value={username}
          placeholder="Username"
          onChange={event => setUsername(event.target.value)}
        />
        <input
          value={email}
          placeholder="email"
          onChange={event => setEmail(event.target.value)}
        />
        <input
          value={emailRepeat}
          placeholder="email repeat"
          onChange={event => setEmailRepeat(event.target.value)}
        />

        <input
          value={password}
          type="password"
          placeholder="password"
          onChange={event => setPassword(event.target.value)}
        />

        <button type='submit'>Signup</button>
      </form>
      <p style={{color: 'red'}}>{errorText}</p>
    </div>
  );
};