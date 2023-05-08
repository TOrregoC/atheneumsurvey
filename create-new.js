import { addProjectToFirestore, db } from "./projects.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js";

const baseURL = "https://example.com/your-survey";

async function createNewProject() {
  const apCode = document.getElementById("ap-code").value;
  const projectName = document.getElementById("project-name").value;
  const proj = generateRandomID();

  const newProject = {
    apCode,
    name: projectName,
    proj,
    data: [],
  };

  try {
    // Save the new project to Firestore
    await addProjectToFirestore(db, newProject);
    alert("Project created successfully.");
    window.location.href = "projects.html";
  } catch (error) {
    console.error("Error adding project to Firestore:", error);
    alert("Error creating project. Please try again.");
  }
}

function generateRandomID() {
  return Math.random().toString(36).substr(2, 10);
}

window.onload = () => {
  console.log("window.onload called");
  const createProjectForm = document.getElementById("create-project-form");
  if (createProjectForm) {
    createProjectForm.addEventListener("submit", (event) => {
      event.preventDefault();
      createNewProject();
    });
  }
};
