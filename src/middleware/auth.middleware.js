import apiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import User from "../module/user.module.js";
import Team from "../module/team.module.js";
import jwt from "jsonwebtoken";

export const verifyJwt = asyncHandler(async (req, _, next) => {
  try {
    const token =
      req.cookies?.accessToken || req.headers?.authorization?.split(" ")[1];

    if (!token) {
      throw new apiError(401, "Unauthorized access");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);


    const user = await User.findById(decodedToken?.id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new apiError(401, "Unauthorized access");
    }

    req.user = user;
    next();
  } catch (error) {
    console.log(error.message)
    throw new apiError(401, "Unauthorized access");
  }
});

export const isTeamCreator = asyncHandler(async (req, _, next) => {
  const team = await Team.findById(req.params.teamId);
  if (!team) {
    throw new apiError(404, "Team not found");
  }
  if (team.creator.toString() !== req.user._id.toString()) {
    throw new apiError(
      403,
      "Access denied. Only team creator can perform this action"
    );
  }
  req.team = team;
  next();
});

export const isTeamMember = asyncHandler(async (req, _, next) => {
  const team = await Team.findById(req.params.teamId);

  if (!team) {
    throw new apiError(404, "Team not found");
  }
  const isMember = team.members.some(
    (id) => id.toString() === req.user._id.toString()
  );

  if (!isMember) {
    throw new apiError(
      403,
      "Access denied. Only team members can perform this action"
    );
  }
  req.team = team;
  next();
});
