import express from "express";
import {
  verifyJwt,
  isTeamCreator,
  isTeamMember,
} from "../middleware/auth.middleware.js";
import {
  createTeam,
  addMember,
  removeMember,
  getTeamMembers,
} from "../controller/team.controller.js";

import {
  createTask,
  updateTask,
  deleteTask,
  moveTask,
  assignTask,
  commentOnTask,
  getTask
} from "../controller/task.controller.js";
import { cacheTask } from "../middleware/cacheRedis.js";

const teamRouter = express.Router();

teamRouter.route("/create").post(verifyJwt, createTeam);
teamRouter.route("/:teamId/member").post(verifyJwt, isTeamCreator, addMember);
teamRouter
  .route("/:teamId/member/:memberId")
  .delete(verifyJwt, isTeamCreator, removeMember);
teamRouter
  .route("/:teamId/members")
  .get(verifyJwt, isTeamMember, getTeamMembers);
teamRouter
  .route("/:teamId/tasks")
  .post(verifyJwt, isTeamMember, createTask);
teamRouter
  .route("/:teamId/task/:taskId")
  .patch(verifyJwt, isTeamMember, updateTask);
teamRouter
  .route("/:teamId/task/:taskId")
  .delete(verifyJwt, isTeamMember, deleteTask);
teamRouter
  .route("/:teamId/task/:taskId/status")
  .patch(verifyJwt, isTeamMember, moveTask);
teamRouter
  .route("/:teamId/task/:taskId/assign")
  .patch(verifyJwt, isTeamMember, assignTask);
teamRouter
  .route("/:teamId/task/:taskId/comments")
  .post(verifyJwt, isTeamMember, commentOnTask);
teamRouter
  .route('/:teamId/tasks')
  .get(verifyJwt,isTeamMember,cacheTask,getTask)

export default teamRouter;
