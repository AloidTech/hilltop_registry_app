// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = process.env.FIREBASECONFIG

// Initialize Firebase
if (!getApps().length) {
  initializeApp(firebaseConfig as any);
}