import React, { useState, useEffect } from 'react';
import { CognitoUserPool  } from 'amazon-cognito-identity-js'

export default () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const poolData = {
    UserPoolId: 'eu-central-1_zPMNh6AcH',
    ClientId: '5n8ig2i2kpr4ei3qo78svl1h4g'
  };

  const UserPool = new CognitoUserPool(poolData);

  const onSubmit = event => {
    event.preventDefault();

    UserPool.signUp(email, password, [], null, (err, data) => {
      if (err) console.error(err);
      console.log(data);
    });
  };

  return (
    <div>
      <form onSubmit={onSubmit}>
        <input
          value={email}
          onChange={event => setEmail(event.target.value)}
        />

        <input
          value={password}
          onChange={event => setPassword(event.target.value)}
        />

        <button type='submit'>Signup</button>
      </form>
    </div>
  );
};


// source upload: https://medium.com/geekculture/how-to-upload-and-preview-images-in-react-js-4e22a903f3db
// export default function UploadImages() {
//   const [images, setImages] = useState([]);
//   const [imageURLs, setImageURLs] = useState([]);

//   useEffect(()=> {
//     if (images.length < 1) return;
//     const newImageUrls = [];
//     images.forEach(image => newImageUrls.push(URL.createObjectURL(image)));
//     setImageURLs(newImageUrls);
//   }, [images]);

//   function onImageChange(e) {
//     setImages([...e.target.files]);
//   }
//   return (
//     <>
//          <label for="img_title">Image title:</label>
//             <input type="text" id="img_title" name="img_title" maxLength="20"/>
//             <br/>
//       Please select the Image you want to upload.
//       <br/>
//       <input type="file" multiple accept='image/*' onChange={onImageChange} />
//       <br/>
//       {imageURLs.map(imageSrc => <img src={imageSrc} width="200" height="auto"/>)}
//       <br/>
//       <label for="img_title">Image Description:</label>
//             <input type="text" id="img_title" name="img_title" maxLength="200" />
//             <br/>
//       <input type="submit" />
//       <br />
     
//       <div className='Imagehoster'>
//            <h1>The Picture list</h1>

//            <table>
//            <tr>
//            <th>Title 1           </th>
//            <th>    Title 2         </th>
//            <th>         Title 3    </th>
//            </tr>
//            <tr>
//            <td><img src={require('./img/testPicture.png')} height={200} weidth={200}/></td>
//            <td><img src={require('./img/testPicture.png')} height={200} weidth={200}/></td>
//            <td><img src={require('./img/testPicture.png')} height={200} weidth={200}/></td>
//            </tr>
         
//           </table>
//         </div>

     
//     </>
//   );
// }