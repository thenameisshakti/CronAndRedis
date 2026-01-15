import asyncHandler from "../utils/asyncHandler.js";
import apiResponse from "../utils/apiResponse.js";
import apiError from "../utils/apiError.js";
import User from "../module/user.module.js";
import generateToken from "../utils/tokenGenerator.js";


const registerUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  console.log(req.body)
  if (!email || !password) {
    throw new apiError(400, "email and password required");
  }

  const trimEmail = email.trim().toLowerCase();
  const trimPassword = password.trim();

  if (trimEmail === "" || trimPassword === "") {
    throw new apiError(400, "email and password cannot be empty");
  }

  // if(trimPassword.length < 8) {
  //     throw new apiError(400, "password must be at least 8 characters long")
  // }

  const existingUser = await User.findOne({ email: trimEmail });

  if (existingUser) {
    throw new apiError(409, "User is already exists");
  }

  const user = await User.create({
    email: trimEmail,
    password,
  });

  if (!user) {
    throw new apiError(500, "Unable to create user. Try again");
  }

  return res
    .status(201)
    .json(new apiResponse(201, { user }, "User Register Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const trimEmail = email.trim().toLowerCase();
  if (trimEmail === "") {
    throw new apiError(400, "email cannot be empty");
  }

  const user = await User.findOne({ email: trimEmail });

  if (!user) {
    throw new apiError(404, "User not found");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new apiError(401, "Invalid Password");
  }

  const { accessToken, refreshToken } = await generateToken(user._id);

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const option = {
    httpOnly: true,
    secure: false,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, option)
    .cookie("refreshToken", refreshToken, option)
    .json(
      new apiResponse(200, { loggedInUser }, "user logged in successfully")
    );
});

export { registerUser, loginUser };
