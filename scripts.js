import {
  buildURL,
  populateProjectList,
  openProject,
  downloadTableAsExcel,
  generateRandomID,
} from "./projects.js";

window.onload = async () => {
  console.log('window.onload called');
  const projectList = document.getElementById('project-list');
  if (projectList) {
    await populateProjectList();
  }

  const createProjectForm = document.getElementById('create-project-form');
  if (createProjectForm) {
    createProjectForm.addEventListener('submit', (event) => {
      event.preventDefault();
      createNewProject();
    });
  }
};
