import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export {
  db,
  auth,
  signInWithEmailAndPassword
};
