import {
  buildURL,
  populateProjectList,
  openProject,
  downloadTableAsExcel,
  createNewProject,
  generateRandomID,
} from "./projects.js";

window.onload = () => {
  console.log("window.onload called");
  const projectList = document.getElementById("project-list");
  if (projectList) {
    populateProjectList();
  }

  const createProjectForm = document.getElementById("create-project-form");
  if (createProjectForm) {
    createProjectForm.addEventListener("submit", (event) => {
      event.preventDefault();
      createNewProject();
    });
  }
};
