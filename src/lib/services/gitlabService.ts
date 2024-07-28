import { compareDesc } from 'date-fns'
import { getProjectForProjectPath, getProjectsForGroup } from './gitlabCaller'

export type Status = 'SUCCESS' | 'FAILED' | 'SKIPPED' | 'RUNNING';

export interface Project {
  name: string;
  path: string;
  projectURL: string;
  status: Status;
  pipelinePath: string;
  finishedAt: Date;
  createdAt: Date;
  coverage: number;
}

export interface Group {
  projects: Array<Project>;
  exceedPageLimit: boolean;
}

const byDate = (a: Project, b: Project) => compareDesc(a.finishedAt, b.finishedAt)
const byStatus = (a: Project, b: Project) => a.status.localeCompare(b.status)

const getProjectOrGroup = async (url: string, key: string, path: string): Promise<Group> => {
  // first see if project, if not try group
  const groupFromProject = await getProjectForProjectPath(url, key, path)
  if (groupFromProject.projects.length > 0) return groupFromProject

  return getProjectsForGroup(url, key, path)
}

export const getProjects = async (url: string, key: string, groupPaths: Array<string>): Promise<Group> => {
  const groups = await Promise.all(groupPaths.map(groupPath => getProjectOrGroup(url, key, groupPath)))

  // todo could this be a flatmap?
  const allProjects = groups.reduce((accum: Array<Project>, group: Group) => {
    accum.push(...group.projects)
    return accum
  }, [])

  const projects = allProjects
    .sort(byDate)
    .sort(byStatus)

  const exceedPageLimit = groups.reduce((accum, group) => {
    accum = accum || group.exceedPageLimit
    return accum
  }, false)
  console.log('final', exceedPageLimit)

  return {
    projects,
    exceedPageLimit
  }
}
