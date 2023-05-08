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

const baseURL = "https://torregoc.github.io/atheneumsurvey/survey.html";

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

function buildURL(proj, RDID, UID) {
  return `${baseURL}?proj=${encodeURIComponent(proj)}&RDID=${encodeURIComponent(RDID)}&UID=${encodeURIComponent(UID)}`;
}

function downloadTableAsExcel(tableId, filename) {
  const table = document.getElementById(tableId);
  const ws = XLSX.utils.table_to_sheet(table);
  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  XLSX.writeFile(wb, filename, { bookType: "xlsx", type: "binary" });
}

async function addProjectToFirestore(db, project) {
  try {
    const projectData = {
      apCode: project.apCode,
      name: project.name,
      proj: project.proj,
    };

    console.log("Adding project data to Firestore:", projectData);

    await addDoc(collection(db, "responses"), projectData);
  } catch (error) {
    console.error("Error adding document: ", error);
    throw error;
  }
}

export { db, fetchProjectData, addProjectToFirestore, buildURL, downloadTableAsExcel };
