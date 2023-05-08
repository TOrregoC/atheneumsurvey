import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js";

function getQueryParams() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  return {
    proj: urlParams.get('proj'),
    RDID: urlParams.get('RDID'),
    UID: urlParams.get('UID')
  };
}

function displaySurveyMessage() {
  const { RDID } = getQueryParams();
  const urlParams = new URLSearchParams(window.location.search);
  const proj = urlParams.get('proj');
  const RDID = urlParams.get('RDID');
  const UID = urlParams.get('UID');

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

async function saveResponseData(proj, RDID, UID) {
  const db = getFirestore();

  const response = {
    proj,
    UID,
    RDID,
    Date: new Date().toISOString()
  };

  try {
    const docRef = await addDoc(collection(db, "responses"), response);
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}
