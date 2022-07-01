/* eslint-disable import/no-anonymous-default-export */
import '../css/Upload.css';
import '../App.css';
import React, { useContext, useState, useEffect } from 'react';
import GetAxiosInstance from '../logic/axios.instance';
import { AccountContext } from './Accounts';

export default () => {
  const [images, setImages] = useState(null);
  const [imageURLs, setImageURLs] = useState(null);
  const [fileSelectText, setFileSelectText] = useState('no file selected');
  const [errorText, setErrorText] = useState('');
  const [responseText, setResponseText] = useState('');
  const [title, setTitle] = useState('');

  const {setIsUpload} = useContext(AccountContext);
  const maxFileSize = 4 * 1024 * 1024;
  const axios = GetAxiosInstance();

  useEffect(() => {
    if (images == null) return;
    let newImageUrls = null;
    if (images) {
      newImageUrls = (URL.createObjectURL(images));
      setImageURLs(newImageUrls);
    }

  }, [images]);

  const imgToBase64 = async () => {
    return new Promise((resolve, reject) => {
      // myFile = images;
      if(images == null) reject(new Error("image is null"));
      images.arrayBuffer().then(buff => {
        const blob = new Blob([new Uint8Array(buff)], { type: 'image/jpg' });
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          resolve(reader.result);
        }
        reader.onerror = (err) => {
          reject(err);
        }
      })
      .catch(err => {
        reject(err);
      }) 
    });
  }

  async function submitImage() {
    setErrorText('');
    setResponseText('');
    try {
      const myTitle = title.trim();
      if(myTitle == null || myTitle.length < 5) throw new Error("title needs to be 5 chars min");
      if(images == null) throw new Error("please select an image");
      if(images.size >= maxFileSize) throw new Error("file is above limit of 4MB");
      if(!['image/jpg', 'image/png', 'image/jpeg'].includes(images.type)) throw new Error("invalid filetype: "+images.type);
      const base64Encoded = await imgToBase64();

      setResponseText('uploading ...');
      const result = await axios.put('post', {
        title: myTitle,
        contentType: images.type,
        file: base64Encoded
      })
      console.log({result});
      if(result.status === 201) setResponseText('Upload created. It may take a few seconds to show up');
    } catch(err) {
      setResponseText('');
      setErrorText(err.message);
    }
  }

  function onImageChange(e) {
    setFileSelectText('');
    console.log(e.target.files);
    const file = e.target.files && e.target.files.length > 0 ? e.target.files[0] : null
    console.log({ file })
    setImages(file);
    let text = file == null ? 'no file selected' : file.name;
    setFileSelectText(text);
  }

  function closeUploadWindow() {
    setIsUpload(false);
  }

  return (
    <>
      
      <button style={{float: 'right'}}onClick={closeUploadWindow}> X </button>
      <div className="upload-container">
        <h2>Upload</h2>
        <br></br>
        <div className='upload-title'>
          <label htmlFor="img_title">Image title</label>
          <div style={{display: 'flex', flexDirection: 'column', marginTop: '5px'}}>
            <textarea
            style= {{ maxHeight: '20vh', padding: '5px', minWidth: '300px', maxWidth: "80vw", backgroundColor: '#1B1E1F', border: 'none', color: 'white', resize: 'vertical'}}
            value={title}
            onChange={event => setTitle(event.target.value)}
            type="text"
            placeholder="Describe your post here ..."
          />
          </div>
        </div> 
        <div style={{display: 'flex', flexDirection: 'row', marginTop: '5px'}}>
          <button>
            <label for="file_select">Select Image</label>
          </button>
          
          <input id="file_select" type="file" className='upload-image-input' required accept='image/*' onChange={onImageChange} />
          <p>{fileSelectText}</p>
        </div>

        <br/>
        <div className="upload-preview">
          {
            <img key={"image"} src={imageURLs} width="200" height="auto" alt="preview of content to be uploaded"/>
          }
        </div>
        <br />
      
        <button id="submit" onClick={submitImage}>Submit</button>
        <br />
        <p style={{color: 'red'}}>
          {errorText}
        </p>
        <p style={{color: 'darkgreen'}}>
          {responseText}
        </p>
      </div>

    </>
  );
};