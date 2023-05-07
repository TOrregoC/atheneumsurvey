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

function saveResponseData(proj, RDID, UID) {
  // Read projects data from local storage
  const projectsData = JSON.parse(localStorage.getItem('projects')) || [];

  // Find the project by proj value
  const project = projectsData.find(p => p.proj === proj);

  if (project) {
    // Add response data to the project
    project.data.push({
      UID,
      RDID,
      Date: new Date().toLocaleDateString(),
    });

    // Update the project data in local storage
    localStorage.setItem('projects', JSON.stringify(projectsData));
  }
}

