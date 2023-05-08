import { initializeApp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, where, query } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js";

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
    const querySnapshot = await getDocs(query(collection(db, "responses"), where("isProject", "==", true)));
    querySnapshot.forEach((doc) => {
      const projectData = doc.data();
      projectsData.push({ id: doc.id, ...projectData });
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

async function openProject(index) {
  const projectsData = await fetchProjectData();
  const project = projectsData[index];
  const rightColumn = document.querySelector(".right-column");

  // Fetch responses data from Firestore
  const querySnapshot = await getDocs(collection(db, "responses", project.id, "responsesData"));
  const responsesData = [];
  querySnapshot.forEach((doc) => {
    responsesData.push(doc.data());
  });

  const rowData = project.data.map((entry) => {
    const status = entry.RDID === 1 ? 'Complete' : (entry.RDID === 2 ? 'Terminate' : 'Overquota');
    return `<tr>
                <td>${entry.UID}</td>
                <td>${status}</td>
                <td>${entry.Date}</td>
            </tr>`;
  }).join('');

  rightColumn.innerHTML = `
      <h3>Here are your redirects</h3>
      <p>Complete: ${buildURL(project.proj, 1, '')}UID_VALUE</p>
      <p>Terminate: ${buildURL(project.proj, 2, '')}UID_VALUE</p>
      <p>Overquota: ${buildURL(project.proj, 3, '')}UID_VALUE</p>

      <table id="project-details">
          <thead>
              <tr>
                  <th>UID</th>
                  <th>Status</th>
                  <th>Date</th>
              </tr>
          </thead>
          <tbody>
              ${rowData}
          </tbody>
      </table>
      <button id="download-table" style="float: right;">Download Table</button>
  `;

  const downloadButton = document.getElementById('download-table');
  downloadButton.addEventListener('click', (event) => {
      event.preventDefault();
      downloadTableAsExcel('project-details', `${project.name}-${project.apCode}.xlsx`);
  });
}

async function populateProjectList() {
  const projectList = document.getElementById("project-list");
  if (!projectList) {
    console.error("project-list element not found");
    return;
  }
  projectList.innerHTML = "";

  try {
    const projectsData = await fetchProjectData();
    projectsData.forEach((project, index) => {
      const listItem = document.createElement("li");
      listItem.textContent = `${project.apCode} - ${project.name}`;
      listItem.addEventListener("click", () => openProject(index));
      projectList.appendChild(listItem);
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
  }
}

async function addProjectToFirestore(project) {
  try {
    await addDoc(collection(db, "responses"), { ...project, isProject: true });
    console.log("Project added to Firestore");
  } catch (error) {
    console.error("Error adding project to Firestore: ", error);
  }
}

export { db, fetchProjectData, addProjectToFirestore, buildURL, downloadTableAsExcel, openProject, populateProjectList };
