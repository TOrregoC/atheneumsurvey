import { initializeApp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-analytics.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js";

// Your web app's Firebase configuration
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
const db = getFirestore(app);

function getQueryParams() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  return {
    proj: urlParams.get('proj'),
    RDID: urlParams.get('RDID'),
    UID: urlParams.get('UID')
  };
}

async function saveResponseData(proj, RDID, UID) {
  const response = {
    proj,
    UID,
    RDID,
    Date: new Date().toISOString(),
  };

  try {
    await addDoc(collection(db, "responses"), response);
    console.log("Response saved successfully");
  } catch (error) {
    console.error("Error saving response: ", error);
  }
}

function displaySurveyMessage() {
  const { proj, RDID, UID } = getQueryParams();

  saveResponseData(proj, parseInt(RDID), UID);

  const surveyMessage = document.getElementById('survey-message');
  let message = '';

  switch (RDID) {
    case '1':
      message = 'Thank you for taking this survey. Your effort is greatly appreciated!';
      break;
    case '2':
      message = 'Thank you for your willingness to participate. Unfortunately, you do not meet the requirements for this survey, We appreciate the effort involved from your side and we will reach out for future projects which are a better fit for your area of expertise.';
      break;
    case '3':
      message = 'Thank you very much for your time. Unfortunately, we have already received too many responses similar to yours. We appreciate your effort involved from your side and will reach out for future projects which are a fit for your area of expertise.';
      break;
    default:
      message = 'Error: Invalid survey status.';
  }

  surveyMessage.innerHTML = `<p>${message}</p>`;
}

window.onload = displaySurveyMessage;
