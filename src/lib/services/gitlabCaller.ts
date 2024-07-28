import axios from 'axios'

import type { Group, Project, Status } from './gitlabService';

interface GLPipeline {
  id: string;
  detailedStatus: {
    detailsPath: string;
  };
  status: Status;
  finishedAt: string;
  createdAt: string;
  coverage: number;
}

export interface GLProject {
  name: string;
  fullPath: string;
  webUrl: string;
  pipelines: {
    nodes: Array<GLPipeline>;
  };
}

export interface GitlabGroupsResponse {
  data: {
    data: {
      group: {
        id: string;
        name: string;
        projects: {
          pageInfo: {
            hasNextPage: boolean;
          };
          nodes: Array<GLProject>;
        };
      };
    };
  };
}

export interface GitlabProjectResponse {
  data: {
    data: {
      project: GLProject;
    };
  };
}

const projectQuery = `        name
        fullPath
        webUrl
        pipelines(first: 1) {
          nodes {
            id
            detailedStatus {
              detailsPath
            }
            status
            finishedAt
            createdAt
            coverage
          }`

const makeGroupQuery = (groupPath: string): string => `query {
  group(fullPath: "${groupPath}") {
    id
    name
    projects (includeSubgroups:true) {
      pageInfo {
        hasNextPage
      }
      nodes {
${projectQuery}
        }
      }
    }
  }
}`

const makeProjectQuery = (projectPath: string): string => `query {
  project(fullPath: "${projectPath}") {
${projectQuery}
    }
  }
}
`

const toProject = (project: GLProject): Project => {
  const pipeline = project.pipelines.nodes[0]
  const {
    detailedStatus,
    status
  } = pipeline

  return {
    name: project.name,
    path: project.fullPath,
    projectURL: project.webUrl,
    status,
    pipelinePath: detailedStatus.detailsPath,
    finishedAt: new Date(pipeline.finishedAt),
    createdAt: new Date(pipeline.createdAt),
    coverage: pipeline.coverage ? pipeline.coverage : 0
  }
}

const hasPipelines = (project: GLProject) => project.pipelines.nodes.length > 0

const emptyGroup = {
  projects: [],
  exceedPageLimit: false
}

const queryGitlab = (url: string, key: string, query: string): Promise<GitlabGroupsResponse | GitlabProjectResponse> => {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + key
  }
  return axios.post(
    url + '/api/graphql',
    { query },
    { headers }
  )
}

export const getProjectsForGroup = async (url: string, key: string, groupPath: string): Promise<Group> => {
  const result = await queryGitlab(url, key, makeGroupQuery(groupPath)) as GitlabGroupsResponse

  // On invalid auth rather than return a 403 response code it just returns an empty response!
  // There seems to be no way to tell the difference.
  const group = result.data.data.group
  if (!group) return emptyGroup

  const projects = group.projects.nodes
    .filter(hasPipelines)
    .map(toProject)

  return {
    projects,
    exceedPageLimit: group.projects.pageInfo.hasNextPage
  }
}

export const getProjectForProjectPath = async (url: string, key: string, projectPath: string): Promise<Group> => {
  const result = await queryGitlab(url, key, makeProjectQuery(projectPath)) as GitlabProjectResponse

  // On invalid auth rather than return a 403 response code it just returns an empty response!
  // There seems to be no way to tell the difference.
  const glProject = result.data.data.project

  if (!glProject || result.data.data.project.pipelines.nodes.length === 0) {
    return emptyGroup
  }

  return {
    projects: [toProject(glProject)],
    exceedPageLimit: false
  }
}
