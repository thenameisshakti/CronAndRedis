import asyncHandler from "../utils/asyncHandler.js";
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
import Task from "../module/task.module.js";
import User from "../module/user.module.js";
import { redisClient } from "../config/redis.js";
import { clearOutdatedCahcheData } from "../utils/clearCache.js";
import { pushInActivityQueue } from "../utils/activityLogger.js";
import { isTeamMember } from "../middleware/auth.middleware.js";

const createTask = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const team = req.team;

  if (!title || title.trim() === "") {
    throw new apiError(400, "task title is required");
  }

  const task = await Task.create({
    teamId: team._id,
    title,
    description,
  });
 console.log(team._id)
  pushInActivityQueue({
    action : "TASK_CREATED",
    teamId: team._id,
    taskId: task._id,
    performedBy: req.user._id
  })

  clearOutdatedCahcheData(team._id)

  return res.status(201).json(new apiResponse(201, { task }, "Task created"));
});

const updateTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const { title, description } = req.body;
  const {teamId} = req.params

  const task = await Task.findById(taskId);
  if (!task) {
    throw new apiError(400, "Task is not found");
  }

  if (task.teamId.toString() !== teamId) {
    throw new apiError(403, "Task does not belong to this team");
  }

  if (title !== undefined) {
    if (title.trim() === "") {
      throw new apiError(400, "Title can not be empty");
    }
    task.title = title.trim();
  }

  if (description !== undefined) {
    task.description = description;
  }

  await task.save();

  pushInActivityQueue({
    action: "TASK_UPDATE",
    teamId,
    taskId: task._id,
    performedBy: req.user._id
  })

  clearOutdatedCahcheData(req.params.teamId)

  return res.status(200).json(new apiResponse(200, { task }, "Task updated"));
});

const deleteTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const task = await Task.findByIdAndDelete(taskId);
  if (!task) {
    throw new apiError(404, "Task not Found");
  }

  clearOutdatedCahcheData(req.params.teamId)

  return res
    .status(200)
    .json(new apiResponse(200, {}, "Task delte successfully"));
});

const moveTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const { status } = req.body;

  if (!["TODO", "DOING", "DONE"].includes(status)) {
    throw new apiError(400, "Invalid Status");
  }

  const task = await Task.findById(taskId);

  if (!task) {
    throw new apiError(404, "Task is not found");
  }
  const oldStatus = task.status
  task.status = status;
  await task.save();

  pushInActivityQueue({
    action: "TASK_MOVED",
    teamId: req.team._id,
    taskId,
    performedBy: req.user._id,
    meta: {from: oldStatus, to: status}
  })

  clearOutdatedCahcheData(req.params.teamId)

  return res
    .status(200)
    .json(new apiResponse(200, { task }, "Task moved successfully"));
});

const assignTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const { memberId } = req.body;
  const team = req.team;

  if (!memberId) {
    throw new apiError(400, "User id is required");
  }

  const task = await Task.findById(taskId);
  if (!task) {
    throw new apiError(404, "Task is not found");
  }

  const validUser = await User.findById(memberId);

  if (!validUser) {
    throw new apiError(404, "Assigned User are not in our database");
  }

  const isMember = team.members.some((id) => id.toString() === memberId);
  

  if (!isMember) {
    throw new apiError(400, "Assigned user is not TeamMember");
  }

  const alreadyAssigned = task.assignedTo.some((id) => id.toString() === memberId)

  if(alreadyAssigned){
    throw new apiError (400, "This member is already assigned")
  }

  task.assignedTo = memberId;
  await task.save();

  pushInActivityQueue({
    action: "TASK_ASSIGNED",
    teamId: team._id,
    taskId,
    performedBy: req.user._id,
    meta : { assignedTo: memberId}
  })

  clearOutdatedCahcheData(req.params.teamId)

  return res
    .status(200)
    .json(new apiResponse(200, { task }, "Task assigned successfully"));
});

const commentOnTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const { text } = req.body;

  if (!text || text.trim() === "") {
    throw new apiError(400, "comment text required");
  }

  const task = await Task.findById(taskId);

  if (!task) {
    throw new apiError(404, "Task not found");
  }

  task.comments.push({
    text,
    createdBy: req.user._id,
  });

  await task.save();

  return res
    .status(200)
    .json(new apiResponse(200, task, "Comments has been added successfully"));
});

const getTask = asyncHandler(async (req, res) => {
  const { teamId } = req.params;
  const { page = 1, limit = 10, search, assignedTo } = req.query;

  const pageNumber = Number(page);
  const limitNumber = Number(limit);

  if (pageNumber <= 0 || limitNumber <= 0) {
    throw new apiError(400, "Invalid pagination values");
  }

  const query = {
    teamId,
  };

  if (search !== undefined && search.trim() !== "") {
    query.title = { $regex: search.trim(), $options: "i" };
  }

  if (assignedTo !== undefined) {
    const isMember = req.team.members.some(
      (id) => id.toString() === assignedTo
    );

    if (!isMember) {
      throw new apiError(400, "assignedTo must be a team member");
    }

    query.assignedTo = assignedTo;
  }

  const skip = (pageNumber - 1) * limitNumber;

  const task = await Task.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNumber)
    .populate("assignedTo", "email");

  const totalTask = await Task.countDocuments(query);

  await redisClient.setEx(
    req.cacheKey,
    60,
    JSON.stringify({
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(totalTask / limitNumber),
        totalTask,
        task,
    })
  )

  return res.status(200).json(
    new apiResponse(
      200,
      {
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(totalTask / limitNumber),
        totalTask,
        task,
      },
      "Tasks fetch succesfully"
    )
  );
});

export {
  createTask,
  updateTask,
  deleteTask,
  moveTask,
  assignTask,
  commentOnTask,
  getTask,
};
