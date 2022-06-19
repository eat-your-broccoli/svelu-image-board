import React from 'react';
import { Account } from './components/Accounts';
import Signup from './components/Singup';
import Status from './components/Status';
import Login from './components/Login';

export default () => {
  return (
    <Account>
      <Status />
      <Signup />
      <Login />
    </Account>
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