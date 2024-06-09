// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore' 

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCLoDDlq8xRNXH3uvTCvwBPIZp302zG8NQ",
  authDomain: "chrome-extension-gpt-util.firebaseapp.com",
  projectId: "chrome-extension-gpt-util",
  storageBucket: "chrome-extension-gpt-util.appspot.com",
  messagingSenderId: "998134105401",
  appId: "1:998134105401:web:c660c43faf0146645b54e8",
  measurementId: "G-RBJHLC64TY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence);
const db = getFirestore(app);
export {app, auth,db};