/* eslint-disable import/no-anonymous-default-export */
import React, { useState } from 'react';
import UserPool from '../UserPool';

export default () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [emailRepeat, setEmailRepeat] = useState('');
  const [errorText, setErrorText] = useState('');
  const [responseText, setResponseText] = useState('');
  
  
  const [password, setPassword] = useState('');
  const [passwordRepeat, setPasswordRepeat] = useState('');
  

  const onSubmit = event => {
    event.preventDefault();
    setResponseText('');
    setErrorText('');
    try {
      setEmail(email.trim());
      setEmailRepeat(emailRepeat.trim());
      if(username == null || username.length < 3) throw new Error("username has to be at least three characters long");  
      if(email == null || email.length === 0) throw new Error("please enter a valid email");
      if(email && email.length && email !== emailRepeat) throw new Error("emails don't match");
      if(password == null || password.length === 0) throw new Error("please enter a secure password");
      if (password !== passwordRepeat) throw new Error("password don't match");
    } catch (err) {
      setErrorText(err.message);
      return;
    }
    
    const attributes = [];
    attributes.push({
      Name: "email",
      Value: email
    });

    UserPool.signUp(username, password, attributes, null, (err, data) => {
      if (err) {
        console.error(err);
        setErrorText(err.message);
      } else {
        setResponseText("Success. You will receive an email for confirming your account.");
        console.log(data);
      }
    });
  };

  return (
    <div>
      <div>
      <form onSubmit={onSubmit} style={{display: 'flex', flexWrap: 'wrap'}}>
        <label class="modal-flex-item-label">Username</label>
        <input class="modal-flex-item"
          value={username}
          placeholder="Username"
          onChange={event => setUsername(event.target.value)}
        />
        <label class="modal-flex-item-label">Email</label>
        <input class="modal-flex-item"
          value={email}
          type="email"
          placeholder="email"
          onChange={event => setEmail(event.target.value)}
        />
        <label class="modal-flex-item-label">Email again</label>
        <input class="modal-flex-item"
          value={emailRepeat}
          type="email"
          placeholder="email repeat"
          onChange={event => setEmailRepeat(event.target.value)}
        />
        <label class="modal-flex-item-label">Password</label>
        <input class="modal-flex-item"
          value={password}
          type="password"
          placeholder="password"
          onChange={event => setPassword(event.target.value)}
        />
        <label class="modal-flex-item-label">Password again</label>
        <input class="modal-flex-item"
          value={passwordRepeat}
          type="password"
          placeholder="password again"
          onChange={event => setPasswordRepeat(event.target.value)}
        />

        <button class="modal-flex-item" type='submit'>Signup</button>
      </form>
      </div>
      <p style={{color: 'green'}}>{responseText}</p>
      <p style={{color: 'red'}}>{errorText}</p>
    </div>
  );
};