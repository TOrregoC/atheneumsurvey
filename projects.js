import { initializeApp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, where, query, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js";

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
export const db = getFirestore(app);

const baseURL = "https://torregoc.github.io/atheneumsurvey/survey.html";

async function fetchProjectData() {
  const projectsData = [];
  try {
    const querySnapshot = await getDocs(collection(db, "projects"));
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

async function searchProjects(searchText) {
  const projectList = document.getElementById("project-list");
  if (!projectList) {
    console.error("project-list element not found");
    return;
  }
  projectList.innerHTML = "";

  try {
    const projectsData = await fetchProjectData();
    const filteredProjects = projectsData.filter((project) =>
      project.name.toLowerCase().includes(searchText.toLowerCase()) || project.apCode.toLowerCase().includes(searchText.toLowerCase())
    );
    filteredProjects.forEach((project, index) => {
      const listItem = document.createElement("li");
      listItem.textContent = `${project.apCode} - ${project.name}`;
      listItem.addEventListener("click", () => openProject(index));
      
      const removeButton = document.createElement("button");
      removeButton.textContent = "Remove";
      removeButton.addEventListener("click", async (event) => {
        event.stopPropagation();
        const confirmDeletion = confirm("Are you sure you want to remove this project?");
        if (confirmDeletion) {
          await removeProject(project.id);
          listItem.remove();
        }
      });

      listItem.appendChild(removeButton);
      projectList.appendChild(listItem);
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
  }
}

document.getElementById("search-button").addEventListener("click", () => {
  const searchText = document.getElementById("search-input").value;
  searchProjects(searchText);
});

async function openProject(index) {
  const projectsData = await fetchProjectData();
  const project = projectsData[index];
  const rightColumn = document.querySelector(".right-column");

  // Fetch responses data from Firestore
  const querySnapshot = await getDocs(collection(db, "responses", project.proj, "responsesData"));
  const responsesData = [];
  querySnapshot.forEach((doc) => {
    responsesData.push(doc.data());
  });

  const rowData = responsesData.map((entry) => {
    const status = parseInt(entry.RDID) === 1 ? 'Complete' : (parseInt(entry.RDID) === 2 ? 'Terminate' : 'Overquota');
    return `<tr>
                <td>${entry.UID}</td>
                <td>${status}</td>
                <td>${entry.Date}</td>
            </tr>`;
  }).join('');
  const incidenceRate = calculateIncidenceRate(responsesData);
  const incidenceRatePercentage = (incidenceRate * 100).toFixed(2);

  const projectDetailsContainer = document.getElementById("project-details-container");
  projectDetailsContainer.innerHTML = `
      <h3>Here are your redirects</h3>
      <p>Complete: ${buildURL(project.proj, 1, '')}UID_VALUE</p>
      <p>Terminate: ${buildURL(project.proj, 2, '')}UID_VALUE</p>
      <p>Overquota: ${buildURL(project.proj, 3, '')}UID_VALUE</p>

      <p style="text-align: left; font-weight: bold; margin-top: 20px; margin-left: 20px;" class="ir-formula">IR = ${incidenceRatePercentage}%</p>

      <div style="display: flex; flex-direction: row; justify-content: center; align-items: center; margin-bottom: 20px;">
        <button id="download-table" style="margin-right: 20px;">Download Table</button>
        <button id="update-table">Update Table</button>
      </div>
      <div style="overflow-x:auto; margin-left: 10px; text-align: center; align-items: center;">
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
      </div>
  `;

  const downloadButton = document.getElementById('download-table');
  downloadButton.addEventListener('click', (event) => {
      event.preventDefault();
      downloadTableAsExcel('project-details', `${project.name}-${project.apCode}.xlsx`);
  });
  
  const updateButton = document.getElementById('update-table');
  updateButton.addEventListener('click', async (event) => {
    event.preventDefault();
    await updateTable(index);
  });
  
  const removeUIDsButton = document.getElementById("remove-uids-button");
  removeUIDsButton.addEventListener("click", async (event) => {
    event.preventDefault();
    const textarea = document.getElementById("remove-uids-textarea");
    const uidList = textarea.value.split("\n");

    // Remove UIDs from Firestore
    await removeMultipleUIDs(project.proj, uidList);

    // Update the table
    await updateTable(index);

    // Clear the textarea
    textarea.value = "";
  });

  await updateTable(index);
  
}

async function removeProject(index) {
  const projectsData = await fetchProjectData();
  const project = projectsData[index];

  try {
    const docRef = doc(db, "projects", project.id);
    await deleteDoc(docRef);
    console.log("Project deleted from Firestore");
    await populateProjectList(); // Refresh the project list
  } catch (error) {
    console.error("Error deleting project from Firestore: ", error);
  }
}

function showConfirmationModal(onYes, onCancel) {
  const modal = document.createElement('div');
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.width = '100%';
  modal.style.height = '100%';
  modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  modal.style.display = 'flex';
  modal.style.justifyContent = 'center';
  modal.style.alignItems = 'center';
  modal.style.zIndex = '1000';

  const modalContent = document.createElement('div');
  modalContent.style.backgroundColor = '#fff';
  modalContent.style.padding = '20px';
  modalContent.style.borderRadius = '4px';

  const message = document.createElement('p');
  message.textContent = 'Are you sure you want to remove this project?';
  modalContent.appendChild(message);

  const buttonsContainer = document.createElement('div');
  buttonsContainer.style.display = 'flex';
  buttonsContainer.style.justifyContent = 'space-between';
  buttonsContainer.style.width = '150px';

  const yesButton = document.createElement('button');
  yesButton.textContent = 'Yes';
  yesButton.addEventListener('click', () => {
    onYes();
    document.body.removeChild(modal);
  });
  buttonsContainer.appendChild(yesButton);

  const cancelButton = document.createElement('button');
  cancelButton.textContent = 'Cancel';
  cancelButton.addEventListener('click', () => {
    onCancel();
    document.body.removeChild(modal);
  });
  buttonsContainer.appendChild(cancelButton);

  modalContent.appendChild(buttonsContainer);
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
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

      const removeButton = document.createElement("button");
      removeButton.textContent = "Remove";
      removeButton.addEventListener("click", () => {
        showConfirmationModal(
          async () => {
            await removeProject(index);
            await populateProjectList();
          },
          () => {
            console.log("Cancelled");
          }
        );
      });

      listItem.appendChild(removeButton);
      listItem.addEventListener("click", () => openProject(index));
      projectList.appendChild(listItem);
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
  }
}

async function updateTable(index) {
  const projectsData = await fetchProjectData();
  const project = projectsData[index];

  // Fetch responses data from Firestore
  const querySnapshot = await getDocs(collection(db, "responses", project.proj, "responsesData"));
  const responsesData = [];
  querySnapshot.forEach((doc) => {
    responsesData.push(doc.data());
  });

  // Sort responsesData from latest to oldest
  responsesData.sort((a, b) => new Date(b.Date) - new Date(a.Date));

  const rowData = responsesData.map((entry) => {
    const status = parseInt(entry.RDID) === 1 ? 'Complete' : (parseInt(entry.RDID) === 2 ? 'Terminate' : 'Overquota');
    return `<tr>
                <td>${entry.UID}</td>
                <td>${status}</td>
                <td>${entry.Date}</td>
            </tr>`;
  }).join('');

  const tbody = document.querySelector('#project-details tbody');
  tbody.innerHTML = rowData;

  // Update the IR formula element
  const incidenceRate = calculateIncidenceRate(responsesData);
  const incidenceRatePercentage = (incidenceRate * 100).toFixed(2);
  const irFormulaElement = document.querySelector('.ir-formula');
  irFormulaElement.textContent = `IR = ${incidenceRatePercentage}%`;
}

async function removeMultipleUIDs(projectId, uidList) {
  const responsesRef = collection(db, "responses", projectId, "responsesData");
  const batch = writeBatch(db);

  for (const uid of uidList) {
    const querySnapshot = await getDocs(query(responsesRef, where("UID", "==", uid)));

    querySnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
  }

  await batch.commit();
}

async function addProjectToFirestore(db, project) {
  try {
    await addDoc(collection(db, "projects"), project);
    console.log("Project added to Firestore");
  } catch (error) {
    console.error("Error adding project to Firestore: ", error);
    throw error;
  }
}

function calculateIncidenceRate(responsesData) {
  let completes = 0;
  let terminates = 0;

  responsesData.forEach((entry) => {
    if (entry.RDID === 1) {
      completes++;
    } else if (entry.RDID === 2) {
      terminates++;
    }
  });

  const incidenceRate = completes / (completes + terminates);
  return incidenceRate;
}

export { fetchProjectData, addProjectToFirestore, buildURL, downloadTableAsExcel, openProject, populateProjectList };
