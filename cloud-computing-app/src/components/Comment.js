/* eslint-disable import/no-anonymous-default-export */
import '../css/Comment.css'
export default (props) => {

    const text = props.commentText;
    const username = props.username;
    return (
        <div className='comment-container'>
            <p>{text}</p>
            <p style={{lineHeight:'1', paddingLeft: '10px', color: 'lightgrey', marginTop: '0px'}}>- {username}</p>
        </div>    
    );
};