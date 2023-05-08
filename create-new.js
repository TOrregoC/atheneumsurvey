import { addProjectToFirestore } from "./projects.js";
import { db } from "./projects.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
} from "https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js";

window.onload = () => {
  console.log('window.onload called');
  const createProjectForm = document.getElementById('create-project-form');
  if (createProjectForm) {
    createProjectForm.addEventListener('submit', (event) => {
      event.preventDefault();
      createNewProject();
    });
  }
};

async function createNewProject() {
  const apCode = document.getElementById('ap-code').value;
  const projectName = document.getElementById('project-name').value;
  const proj = generateRandomID();

  const newProject = {
    apCode,
    name: projectName,
    proj,
  };

  try {
    // Save the new project to Firestore
    const firestore = getFirestore();
    await addProjectToFirestore(db, newProject);
    alert('Project created successfully.');
    window.location.href = "projects.html";
  } catch (error) {
    console.error("Error adding project to Firestore:", error);
    alert("Error creating project. Please try again.");
  }
}

function generateRandomID() {
  return Math.random().toString(36).substr(2, 10);
}

