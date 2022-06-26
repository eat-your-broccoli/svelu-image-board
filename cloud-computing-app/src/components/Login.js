import React, { useState, useContext } from 'react';
import { AccountContext } from './Accounts';
import Singup from './Singup';
import Modal from 'react-bootstrap/Modal'
import '../css/Header.css';

// eslint-disable-next-line import/no-anonymous-default-export
export default () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
 
  const { authenticate } = useContext(AccountContext);

  const onSubmit = event => {
    event.preventDefault();

    authenticate(email, password)
      .then(data => {
        console.log('Logged in!', data);
      })
      .catch(err => {
        console.error('Failed to login!', err);
      })
  };

  const toggleModal = (val = null) =>  {
    if(val === true || val === false) setIsLogin(val);
    else setIsLogin(!isLogin)
  }

  return (
    <>
    <div className="header-block" style={{display: 'flex'}}>
      {isLogin &&
      <>
        <button style={{marginRight: '5px', maxHeight: '20px'}} onClick={toggleModal}>Register</button>
        <form onSubmit={onSubmit}>
          <input
            value={email}
            onChange={event => setEmail(event.target.value)}
            placeholder="username"
          />

          <input
            value={password}
            onChange={event => setPassword(event.target.value)}
            type="password"
            placeholder="password"
          />

          <button type='submit'>Login</button>
        </form>
      </>
      }
      {!isLogin &&
      <div className="modal-backdrop" onClick={toggleModal}>
        <div className="modal-container" onClick={(event) => {event.stopPropagation()}}>
          <Modal.Dialog style={{textAlign: 'left'}}>
            <h2> Register at SVELU</h2>
          
            <Modal.Body>
                <Singup></Singup>
            </Modal.Body>
            <Modal.Footer style={{display: 'flex', justifyContent: 'end'}}>
              <button onClick={toggleModal}> Close </button>
            </Modal.Footer>
          </Modal.Dialog>
        </div>
      </div>
      }
    </div>
    </>
  );
};