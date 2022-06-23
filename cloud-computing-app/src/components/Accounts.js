import React, { createContext, useState } from 'react'
import { CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js'
import Pool from '../UserPool'

const AccountContext = createContext()

const Account = (props) => {
  const [username, setUsername] = useState('');

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
      updateUsername();
      const user = new CognitoUser({ Username, Pool })
      const authDetails = new AuthenticationDetails({ Username, Password })

      user.authenticateUser(authDetails, {
        onSuccess: (data) => {
          console.log('onSuccess:', data)
          resolve(data)
        },

        onFailure: (err) => {
          console.error('onFailure:', err)
          reject(err)
        },

        newPasswordRequired: (data) => {
          console.log('newPasswordRequired:', data)
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
    const user = Pool.getCurrentUser()
    if (user) {
      user.signOut()
    }
  }



  return (
    <AccountContext.Provider
      value={{
        username,
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