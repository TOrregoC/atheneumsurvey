import { initializeApp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDGB0yVOkD8abI9kmnMkbNEOdPUCnY3FIo",
  authDomain: "atheneumsurveys.firebaseapp.com",
  projectId: "atheneumsurveys",
  storageBucket: "atheneumsurveys.appspot.com",
  messagingSenderId: "291426672334",
  appId: "1:291426672334:web:9c52ce815fc184091cfa9f",
  measurementId: "G-8MPDN9YZLF",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fetchProjectData() {
  const projectsData = [];
  try {
    const querySnapshot = await getDocs(collection(db, "responses"));
    querySnapshot.forEach((doc) => {
      const responseData = doc.data();
      const projectIndex = projectsData.findIndex(
        (project) => project.proj === responseData.proj
      );
      if (projectIndex > -1) {
        projectsData[projectIndex].data.push(responseData);
      } else {
        projectsData.push({
          proj: responseData.proj,
          data: [responseData],
        });
      }
    });
    return projectsData;
  } catch (error) {
    console.error("Error fetching project data: ", error);
    return [];
  }
}

async function addProjectToFirestore(db, project) {
  try {
    const projectData = {
      apCode: project.apCode,
      name: project.name,
      proj: project.proj,
    };

    await addDoc(collection(db, "responses"), projectData);
  } catch (error) {
    console.error("Error adding document: ", error);
    throw error;
  }
}

export { db, fetchProjectData, addProjectToFirestore };
