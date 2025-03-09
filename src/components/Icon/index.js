import React from 'react';

const Loader = ({ className, spinnerBackgroundColor, spinnerColor }) => {
  return (
    <svg aria-hidden="true" role="status" className={`text-gray-200 animate-spin dark:text-gray-600 ${className}`} viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082
        50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987
        91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144
        50.5908Z" fill={spinnerBackgroundColor}>
      </path>
      <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452
        15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345
        1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191
        9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121
        86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill={spinnerColor}>
      </path>
    </svg>
  );
};

const Facebook = ({ className }) => {
  return (
    <svg className={className} viewBox="0 0 48 48">
      <g id="Icons" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <g id="Color-" transform="translate(-200.000000, -160.000000)" fill="#4460A0">
          <path
              d="M225.638355,208 L202.649232,208 C201.185673,208 200,206.813592 200,205.350603 L200,162.649211 C200,161.18585 201.185859,160 202.649232,160 L245.350955,160 C246.813955,160 248,161.18585 248,162.649211 L248,205.350603 C248,206.813778 246.813769,208 245.350955,208 L233.119305,208 L233.119305,189.411755 L239.358521,189.411755 L240.292755,182.167586 L233.119305,182.167586 L233.119305,177.542641 C233.119305,175.445287 233.701712,174.01601 236.70929,174.01601 L240.545311,174.014333 L240.545311,167.535091 C239.881886,167.446808 237.604784,167.24957 234.955552,167.24957 C229.424834,167.24957 225.638355,170.625526 225.638355,176.825209 L225.638355,182.167586 L219.383122,182.167586 L219.383122,189.411755 L225.638355,189.411755 L225.638355,208 L225.638355,208 Z"
              id="Facebook">

          </path>
        </g>
      </g>
    </svg>
  );
};

const Google = ({ className }) => {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z"
        fill="#EA4335"
      />
      <path
        d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z"
        fill="#4285F4"
      />
      <path
        d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z"
        fill="#FBBC05"
      />
      <path
        d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.2654 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z"
        fill="#34A853"
      />
    </svg>
  );
};

const ChevronLeft = ({ className }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M7.72 12.53a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 1 1 1.06 1.06L9.31 12l6.97 6.97a.75.75 0 1 1-1.06 1.06l-7.5-7.5Z" clip-rule="evenodd" />
    </svg>
  );
};

const Eye = ({ className }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  );
};

const EyeSlash = ({ className }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  );
};

const Error = ({ className }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
    </svg>
  );
};

const UserAvatar = ({ className }) => {
  return (
    <span className={`inline-block overflow-hidden rounded-full bg-gray-100 ${className}`}>
      <svg fill="currentColor" viewBox="0 0 24 24" className="h-full w-full text-gray-300">
        <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    </span>
  );
};

const Basketball = ({ className }) => {
  return (
    <svg viewBox="0 0 496 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M212.3 10.3c-43.8 6.3-86.2 24.1-122.2 53.8l77.4 77.4c27.8-35.8 43.3-81.2 44.8-131.2zM248 222L405.9 64.1c-42.4-35-93.6-53.5-145.5-56.1-1.2 63.9-21.5 122.3-58.7 167.7L248 222zM56.1 98.1c-29.7 36-47.5 78.4-53.8 122.2 50-1.5 95.5-17 131.2-44.8L56.1 98.1zm272.2 204.2c45.3-37.1 103.7-57.4 167.7-58.7-2.6-51.9-21.1-103.1-56.1-145.5L282 256l46.3 46.3zM248 290L90.1 447.9c42.4 34.9 93.6 53.5 145.5 56.1 1.3-64 21.6-122.4 58.7-167.7L248 290zm191.9 123.9c29.7-36 47.5-78.4 53.8-122.2-50.1 1.6-95.5 17.1-131.2 44.8l77.4 77.4zM167.7 209.7C122.3 246.9 63.9 267.3 0 268.4c2.6 51.9 21.1 103.1 56.1 145.5L214 256l-46.3-46.3zm116 292c43.8-6.3 86.2-24.1 122.2-53.8l-77.4-77.4c-27.7 35.7-43.2 81.2-44.8 131.2z"/>
    </svg>
  );
};

const BasketballJersey = ({ className }) => {
  return (
    <svg viewBox="0 0 512 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M183.3 27.47l-13.9 3.47c1.3 46.77 4.4 95.66 2.5 138.36-2 45.3-8.9 84.5-32.9 106.7v211h234V276c-24-22.2-30.9-61.4-32.9-106.7-1.9-42.7 1.2-91.59 2.5-138.36l-13.9-3.47c-1.1 22.08-5.3 46.02-14.5 66.25C303.4 117.5 284 137 256 137c-28 0-47.4-19.5-58.2-43.28-9.2-20.23-13.4-44.17-14.5-66.25zm18.2 3.33c1.4 19.18 5.4 39.48 12.7 55.48C223.4 106.5 236 119 256 119c20 0 32.6-12.5 41.8-32.72 7.3-16 11.3-36.3 12.7-55.48C286.9 42.47 272 49 256 49s-30.9-6.53-54.5-18.2zm-50 4.59l-14.4 3.6c.4 37.62 3.8 78.91 1.9 117.41-2 39.5-9.8 76.6-34 102.9V487h16V267.7l3.4-2.7c18.8-15.2 27.5-50.8 29.5-96.5 1.8-40.1-1-87.14-2.4-133.11zm209 0c-1.4 45.97-4.2 93.01-2.4 133.11 2 45.7 10.7 81.3 29.5 96.5l3.4 2.7V487h16V259.3c-24.2-26.3-32-63.4-34-102.9-1.9-38.5 1.5-79.79 1.9-117.41zM295.4 224c9.4 0 16.8 2.8 22.3 8.4 5.5 5.6 8.2 13.1 8.2 22.4 0 6.2-1.5 12.2-4.4 18-2.9 5.8-7.4 11.7-13.3 17.7-8.3 8.5-14 14.5-16.9 18.2-2.9 3.7-5 7.4-6.3 11.3h42.4v19.5h-63.9v-16.4c2.1-6.2 5.2-12.4 9.2-18.6 4-6.3 9.8-13.4 17.5-21.5 5.9-6.3 9.8-10.7 11.6-13.2 1.8-2.4 3.2-4.7 4.2-7s1.5-4.6 1.5-6.9c0-4.1-1-7.2-3-9.5-2.1-2.3-5.1-3.5-9-3.5-3.9 0-6.8 1.4-8.9 4.1-2.1 2.7-3.4 6.7-4 12.2l-18.3-1.3c1-11.1 4.2-19.5 9.5-25.2 5.3-5.8 12.5-8.7 21.6-8.7zm-76.3 1.8h20.4v71.9h12.2v17.6h-12.2v24.2h-17.3v-24.2h-41.6v-17.8zm3.6 20.6c-1.1 3.1-3.1 7.6-6.1 13.6l-20.7 37.7h26.3V263c0-3 0-6.3.1-9.8.2-3.5.3-5.8.4-6.8z"/>
    </svg>
  );
};

const BasketballHoop = ({ className }) => {
  return (
    <svg viewBox="0 0 512 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M256 23C140.57 23 73.01 90.16 24.283 171.37L23 173.507V309.85l142.268 63.228C175.353 408.092 183 436.353 183 480h18c0-2.378-.028-4.703-.07-7h22.304l.405 7.484 17.973-.968-.35-6.516h29.14l-.366 6.496 17.973 1.008.422-7.504h22.64c-.042 2.3-.072 4.624-.072 7h18c0-43.265 7.505-72.296 17.453-106.797L489 309.85V173.508l-1.283-2.14C438.99 90.16 371.43 23 256 23zm0 18c107.607 0 167.912 59.792 215 137.563V298.15l-118.027 52.457c1.952-6.838 3.947-14.016 5.96-21.607H384v-34h-23V167H151v128h-23v34h25.023c1.965 7.597 3.906 14.745 5.81 21.52L41 298.15V178.563C88.088 100.793 148.393 41 256 41zm-87 144h174v110H169V185zm2.61 144h43.863l1.617 30h-37.115c-2.71-9.403-5.528-19.275-8.364-30zm61.888 0h44.982l-1.683 30h-41.682l-1.617-30zm63.012 0h43.804c-2.88 10.63-5.75 20.51-8.507 30h-36.98l1.683-30zm-111.377 48h32.928l1.618 30h-26.756c-2.27-10.02-4.922-19.86-7.79-30zm50.953 0h39.7l-1.682 30h-36.4l-1.618-30zm57.73 0h32.825c-2.83 10.065-5.443 19.92-7.683 30h-26.824l1.683-30zm-97.308 48h24.14l1.618 30h-22.14c-.762-10.673-2.002-20.55-3.618-30zm42.166 0h34.422l-1.684 30h-31.12l-1.618-30zm52.45 0h24.31c-1.59 9.476-2.808 19.37-3.563 30h-22.43l1.685-30z"/>
    </svg>
  );
};

const BasketballPlayer = ({ className }) => {
  return (
    <svg viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
      <path d="M10 4a1 1 0 1 0 2 0a1 1 0 0 0 -2 0"/>
      <path d="M5 21l3 -3l.75 -1.5"/>
      <path d="M14 21v-4l-4 -3l.5 -6"/>
      <path d="M5 12l1 -3l4.5 -1l3.5 3l4 1"/>
      <path d="M18.5 16a.5 .5 0 1 0 0 -1a.5 .5 0 0 0 0 1z"/>
    </svg>
  );
};

const Drill = ({ className }) => {
  return (
    <svg viewBox="0 0 512 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M48.148 49c-9 0-14.776 3.864-19.793 11.29-5.017 7.424-8.323 18.56-9.234 30.4-.91 11.838.52 24.33 3.814 34.214 3.079 9.236 7.783 15.602 12.288 18.367 28.96 2.58 66.314 2.689 82.671 28.96 11.82 42.442-15.348 94.133-25.816 130.769h74.55l-5.064-89.941 23.168-4.729 14.12-58.926 64.296 7.219V49zm233 0v98.916l30-.453V49zm48 16v62h30V65zm-274 2h178v60h-178zm322 .525v56.95l46-11.5v-33.95zM73.148 85v24h142V85zm368 0v18h52V85h-9zm-228.5 84.064l-8.841 36.907 17.925-1.532c-1.87-15.08 1.338-23.637 10.96-33.125zM89.148 321v32H52.965l-20 30h244.879l-11.823-30h-98.873v-32zm-64 80v62h237.608l16.584-62z"/>
    </svg>
  );
};

const Tournament = ({ className }) => {
  return (
    <svg viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
      <path d="M4 4m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"/>
      <path d="M20 10m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"/>
      <path d="M4 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"/>
      <path d="M4 20m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"/>
      <path d="M6 12h3a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-3"/>
      <path d="M6 4h7a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-2"/>
      <path d="M14 10h4"/>
    </svg>
  );
};

const Trophy = ({ className }) => {
  return (
    <svg viewBox="0 0 576 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M552 64H448V24c0-13.3-10.7-24-24-24H152c-13.3 0-24 10.7-24 24v40H24C10.7 64 0 74.7 0 88v56c0 35.7 22.5 72.4 61.9 100.7 31.5 22.7 69.8 37.1 110 41.7C203.3 338.5 240 360 240 360v72h-48c-35.3 0-64 20.7-64 56v12c0 6.6 5.4 12 12 12h296c6.6 0 12-5.4 12-12v-12c0-35.3-28.7-56-64-56h-48v-72s36.7-21.5 68.1-73.6c40.3-4.6 78.6-19 110-41.7 39.3-28.3 61.9-65 61.9-100.7V88c0-13.3-10.7-24-24-24zM99.3 192.8C74.9 175.2 64 155.6 64 144v-16h64.2c1 32.6 5.8 61.2 12.8 86.2-15.1-5.2-29.2-12.4-41.7-21.4zM512 144c0 16.1-17.7 36.1-35.3 48.8-12.5 9-26.7 16.2-41.8 21.4 7-25 11.8-53.6 12.8-86.2H512v16z"/>
    </svg>
  );
}

// Calendar icon
const Calendar = ({ className }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
    </svg>
  );
};

// Map pin icon
const MapPin = ({ className }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
  );
};

// Users icon
const Users = ({ className }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
    </svg>
  );
};

// Arrow left icon
const ArrowLeft = ({ className }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
    </svg>
  );
};

// X icon
const XMark = ({ className }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
};

// Trash icon
const Trash = ({ className }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
  );
};

const Icon = ({
  type,
  ...rest
}) => {
  if (type === 'loader') {
    return <Loader {...rest} />
  }

  if (type === 'facebook') {
    return <Facebook {...rest} />
  }

  if (type === 'google') {
    return <Google {...rest} />
  }

  if (type === 'chevron-left') {
    return <ChevronLeft {...rest} />
  }

  if (type === 'eye') {
    return <Eye {...rest} />
  }

  if (type === 'eye-slash') {
    return <EyeSlash {...rest} />
  }

  if (type === 'error') {
    return <Error {...rest} />
  }

  if (type === 'avatar') {
    return <UserAvatar {...rest} />
  }

  if (type === 'basketball') {
    return <Basketball {...rest} />
  }

  if (type === 'jersey') {
    return <BasketballJersey {...rest} />
  }

  if (type === 'hoop') {
    return <BasketballHoop {...rest} />
  }

  if (type === 'player') {
    return <BasketballPlayer {...rest} />
  }

  if (type === 'drill') {
    return <Drill {...rest} />
  }

  if (type === 'tournament') {
    return <Tournament {...rest} />
  }

  if (type === 'trophy') {
    return <Trophy {...rest} />
  }

  if (type === 'calendar') {
    return <Calendar {...rest} />
  }

  if (type === 'map-pin') {
    return <MapPin {...rest} />
  }

  if (type === 'users') {
    return <Users {...rest} />
  }

  if (type === 'arrow-left') {
    return <ArrowLeft {...rest} />
  }

  if (type === 'x') {
    return <XMark {...rest} />
  }

  if (type === 'trash') {
    return <Trash {...rest} />
  }

  return null;
};

export default Icon;
