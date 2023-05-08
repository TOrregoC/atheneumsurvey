// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-analytics.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDGB0yVOkD8abI9kmnMkbNEOdPUCnY3FIo",
  authDomain: "atheneumsurveys.firebaseapp.com",
  projectId: "atheneumsurveys",
  storageBucket: "atheneumsurveys.appspot.com",
  messagingSenderId: "291426672334",
  appId: "1:291426672334:web:9c52ce815fc184091cfa9f",
  measurementId: "G-8MPDN9YZLF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
