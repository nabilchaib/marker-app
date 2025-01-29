import React, { useState, useEffect } from 'react';

const ACCESS_KEY = 'VWdD_KbOabHETxYGLKVgBo-VIbbc3oSgI_uGFKgEIKM';
const API_URL = `https://api.unsplash.com/photos/random?client_id=${ACCESS_KEY}`;

const getRandomNumber = (from, to) => {
  return Math.floor(Math.random() * (to - from + 1)) + from;
}

const BgImg = () => {
    const [bgUrl, setBgUrl] = useState('');

    useEffect(() => {
      const fetchBgImg = async () => {
        try{
          const query = 'basketball'
          const response = await fetch(`${API_URL}&query=${query}`);
          if (response.status === 200) {
            const json = await response.json();
            setBgUrl(json.urls.regular);
          } else {
            const text = await response.text();
            throw new Error(text);
          }
        } catch (err) {
          console.log('ERR: ', err)
          setBgUrl(`./unsplash-images/${getRandomNumber(1, 4)}.jpeg`);
        }
      };

      fetchBgImg();
    }, []);

    return (
      <div
        className="fixed inset-0 bg-cover bg-center z-n1 bg-[image:var(--image-url)]"
        style={{ '--image-url': `url(${bgUrl})` }}
      />
    );
};

export default BgImg;
