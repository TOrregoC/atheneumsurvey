const baseURL = "https://torregoc.github.io/atheneumsurvey/survey.html";

function buildURL(proj, RDID, UID) {
    return `${baseURL}?proj=${encodeURIComponent(proj)}&RDID=${encodeURIComponent(RDID)}&UID=${encodeURIComponent(UID)}`;
  }
  
function populateProjectList() {
  const projectList = document.getElementById('project-list');
  if (!projectList) {
    console.error('project-list element not found');
    return;
  }
  console.log('projectList:', projectList); // Add this line
  projectList.innerHTML = '';

  // Read projects data from local storage
  const projectsData = JSON.parse(localStorage.getItem('projects')) || [];
  console.log('projectsData:', projectsData);

  projectsData.forEach((project, index) => {
    const listItem = document.createElement('li');
    listItem.textContent = `${project.apCode} - ${project.name}`;
    listItem.addEventListener('click', () => openProject(index));
    projectList.appendChild(listItem);
  });
}


function openProject(index) {
    const projectsData = JSON.parse(localStorage.getItem('projects')) || [];
    const project = projectsData[index];
    const rightColumn = document.querySelector('.right-column');
    
    const rowData = project.data.map(entry => {
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
        downloadTableAsExcel('project-details', `${project.name}-redirects.xlsx`);
    });
}

function downloadTableAsExcel(tableId, filename) {
    const table = document.getElementById(tableId);
    const ws = XLSX.utils.table_to_sheet(table);
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, filename, { bookType: 'xlsx', type: 'binary' });
}

window.onload = () => {
  console.log('window.onload called');
  const projectList = document.getElementById('project-list');
  if (projectList) {
    populateProjectList();
  }

  const createProjectForm = document.getElementById('create-project-form');
  if (createProjectForm) {
    createProjectForm.addEventListener('submit', (event) => {
      event.preventDefault();
      createNewProject();
    });
  }
};

function createNewProject() {
  const apCode = document.getElementById('ap-code').value;
  const projectName = document.getElementById('project-name').value;
  const proj = generateRandomID();

  const newProject = {
    apCode,
    name: projectName,
    proj,
    data: []
  };

  // Save the new project to local storage
  const projectsData = JSON.parse(localStorage.getItem('projects')) || [];
  console.log('Before saving:', projectsData); // Add this line
  projectsData.push(newProject);
  localStorage.setItem('projects', JSON.stringify(projectsData));
  console.log('After saving:', projectsData); // Add this line

  console.log('Updated projectsData:', projectsData); // Add this line

  alert('Project created successfully.');
  window.location.reload();
}

function generateRandomID() {
  return Math.random().toString(36).substr(2, 10);
}
