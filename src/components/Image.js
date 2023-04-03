import React, { useState, useEffect } from 'react';

const ACCESS_KEY = 'VWdD_KbOabHETxYGLKVgBo-VIbbc3oSgI_uGFKgEIKM';
const API_URL = `https://api.unsplash.com/photos/random?client_id=${ACCESS_KEY}`;

const BgImg = () => {
    const [bgUrl, setBgUrl] = useState('');

    useEffect(() => {
        const fetchBgImg = async () => {
            const query = 'basketball'
            const response = await fetch(`${API_URL}&query=${query}`);
            const json = await response.json();
            setBgUrl(json.urls.regular);
        };

        fetchBgImg();
    }, []);

    return (
        <div
            className="bg-img"
            style={{ backgroundImage: `url(${bgUrl})` }}
        ></div>
    );
};

export default BgImg;
