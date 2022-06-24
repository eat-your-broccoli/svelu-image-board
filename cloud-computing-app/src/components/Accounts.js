import React, { createContext, useState } from 'react'
import { CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js'
import Pool from '../UserPool'

const AccountContext = createContext()

const Account = (props) => {
  const [username, setUsername] = useState('');
  const [isLoggedIn, SetIsLoggedIn] = useState(false);
  
  const getSession = async () => {
    return await new Promise(async (resolve, reject) => {
      const user = Pool.getCurrentUser()
      if (user) {
        user.getSession(async (err, session) => {
          if (err) {
            reject()
          } else {
            setUsername(user.username)
            const attributes = await new Promise((resolve, reject) => {
              user.getUserAttributes((err, attributes) => {
                if (err) {
                  reject(err)
                } else {
                  const results = {}

                  for (let attribute of attributes) {
                    const { Name, Value } = attribute
                    results[Name] = Value
                  }

                  resolve(results)
                }
              })
            })

            const token = session.getIdToken().getJwtToken()
            SetIsLoggedIn(true);
            resolve({
              user,
              headers: {
                Authorization: token,
              },
              ...session,
              ...attributes,
            })
          }
        })
      } else {
        reject()
      }
    })
  }

  const authenticate = async (Username, Password) =>
    await new Promise((resolve, reject) => {
      const user = new CognitoUser({ Username, Pool })
      const authDetails = new AuthenticationDetails({ Username, Password })

      user.authenticateUser(authDetails, {
        onSuccess: (data) => {
          console.log('onSuccess:', data)
          updateUsername();
          SetIsLoggedIn(true);
          resolve(data)
        },

        onFailure: (err) => {
          console.error('onFailure:', err);
          SetIsLoggedIn(false);
          reject(err)
        },

        newPasswordRequired: (data) => {
          console.log('newPasswordRequired:', data)
          SetIsLoggedIn(false);
          resolve(data)
        },
      })
    })
  
    const updateUsername = () => {
      const user = Pool.getCurrentUser();
      if(user) setUsername(user.username);
      else setUsername('');
    }

  const logout = () => {
    setUsername('');
    SetIsLoggedIn(false);
    const user = Pool.getCurrentUser()
    if (user) {
      user.signOut()
    }
  }



  return (
    <AccountContext.Provider
      value={{
        username,
        isLoggedIn,
        authenticate,
        getSession,
        logout,
      }}
    >
      {props.children}
    </AccountContext.Provider>
  )
}

export { Account, AccountContext }