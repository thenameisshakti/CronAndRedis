import asyncHandler from "../utils/asyncHandler.js";
import apiResponse from "../utils/apiResponse.js";
import apiError from "../utils/apiError.js";
import Team from "../module/team.module.js";
import User from "../module/user.module.js";

const createTeam = asyncHandler(async (req, res) => {
    console.log(req.body)
  const { name } = req.body;

  if (!name || name.trim() === "") {
    throw new apiError(400, "Team name is required");
  }

  const team = await Team.create({
    title: name.trim(),
    creator: req.user._id,
    members: [req.user._id],
  });

  return res
    .status(201)
    .json(new apiResponse(201, { team }, "Team created successfully"));
});

const addMember = asyncHandler(async (req, res) => {
  const { memberId } = req.body;
  const team = req.team;

  if (!memberId) {
    throw new apiError(400, "memberId is required");
  }

  const validMemberId = await User.findOne({_id: memberId})

  if(!validMemberId) {
    throw new apiError(404,"this user does not exist in our database")
  }

  if (team.members.includes(memberId)) {
    throw new apiError(409, "User is already a member of the team");
  }

  team.members.push(memberId);
  await team.save();

  return res
    .status(200)
    .json(
      new apiResponse(200, { team }, "Member added to the team successfully")
    );
});

const removeMember = asyncHandler(async (req, res) => {
  const { memberId } = req.params;
  const team = req.team;

  if (memberId === team.creator.toString()) {
    throw new apiError(400, "Team creator cannot be removed from the team");
  }

  team.members = team.members.filter((id) => id.toString() !== memberId);

  await team.save();

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        { team },
        "Member removed from the team successfully"
      )
    );
});

const getTeamMembers = asyncHandler(async (req, res) => {
  const team = await req.team.populate("members", "email");

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        { members: team.members },
        "Team members fetched successfully"
      )
    );
});

export { createTeam, addMember, removeMember, getTeamMembers };
