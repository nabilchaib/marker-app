// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBfzaGANsin_agscC0BVT3FTC_E8Dw8Hv8",
  authDomain: "marker-app-f6a0a.firebaseapp.com",
  databaseURL: "https://marker-app-f6a0a-default-rtdb.firebaseio.com",
  projectId: "marker-app-f6a0a",
  storageBucket: "marker-app-f6a0a.appspot.com",
  messagingSenderId: "655173640303",
  appId: "1:655173640303:web:62baee8c4f0dc38e05ed9a",
  measurementId: "G-5J0SQR8F9Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const db = firebase.firestore();


const auth = firebase.auth();

export { db, auth };
