import { getProjects } from './projects.js';

export async function populateProjectList() {
  const projectList = document.getElementById('project-list');
  if (!projectList) {
    console.error('project-list element not found');
    return;
  }

  const projectsData = await fetchProjectData();

  projectsData.forEach((project, index) => {
    const listItem = document.createElement('li');
    listItem.textContent = `${project.apCode} - ${project.name}`;
    listItem.addEventListener('click', () => openProject(index));
    projectList.appendChild(listItem);
  });
}
