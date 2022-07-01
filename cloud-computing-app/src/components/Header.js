/* eslint-disable import/no-anonymous-default-export */
import { useContext, useEffect } from 'react';
import '../css/Header.css'
import { AccountContext } from './Accounts';
import Login from './Login';
import UserInfo from './UserInfo';

export default () => {
    const {isLoggedIn, getSession, isUpload, setIsUpload} = useContext(AccountContext);
    // run automatically, getSession if there is one stored
    useEffect(() => {
        if(!isLoggedIn) getSession();
      // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);


    const toggleCreatePost = (val = null) =>  {
        if(val === true || val === false) setIsUpload(val);
        else setIsUpload(!isUpload) //dont understand
    }

    return (
    <>
        <div className='header height30'>
        <div className="header-block">SVELU</div>
        {isLoggedIn &&
            <div style={{margin: 'auto 0'}}>
                <button onClick={toggleCreatePost}>{isUpload === false? 'Create a post' : 'Back to overview'}</button>
            </div>
        }
        {isLoggedIn &&
            <UserInfo></UserInfo>
        }
        {isLoggedIn === false &&
            <Login></Login>
        }
        </div>
    </>
    
    );
}