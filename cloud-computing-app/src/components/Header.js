/* eslint-disable import/no-anonymous-default-export */
import '../css/Header.css'
import UserInfo from './UserInfo';
export default () => {

    return (
    <div class="header height">
        <div class="header-block">SVELU</div>
        <UserInfo></UserInfo>
    </div>
    );
}