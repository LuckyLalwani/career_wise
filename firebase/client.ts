// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBpzxlXUyQB-1IF0rwHfmn6LOAEmsdnMHk",
  authDomain: "algorank-523bc.firebaseapp.com",
  projectId: "algorank-523bc",
  storageBucket: "algorank-523bc.firebasestorage.app",
  messagingSenderId: "534408210997",
  appId: "1:534408210997:web:d00738d1d5832c52ee5f7c",
  measurementId: "G-9HQYZ1DDF6"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
// const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);
