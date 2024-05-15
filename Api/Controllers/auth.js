import Users from "../Models/Users.js";
import jwt from "jsonwebtoken";
import { SerializeUser, answerObject } from "../Helpers/utils.js";
import Database from "../Database.js";
import { JWT_SECRET } from "../Config/index.js";
import validator from "validator";
import { __dirname } from "../App.js";
import { generateFilename } from "./conversations.js";

const validateUsername = async (req, res, next) => {
  await Database.getInstance();
  try {
    const username = req.body.username ? req.body.username.trim() : "";
    const error = {};
    if (!username) {
      error.username = "Username is required!";
    } else if (username.length < 3 || username.length > 20) {
      error.username = "Username must be between 3 and 20 characters.";
    } else {
      const user = await Users.findOne({ username });
      if (user) {
        error.username = "This username is already taken.";
      }
    }

    if (Object.keys(error).length > 0) {
      return res.status(200).json(answerObject("username", error.username));
    }

    next();
  } catch (error) {
    return res.status(500).json(answerObject("error", error.message));
  }
};

const validateEmail = async (req, res, next) => {
  await Database.getInstance();
  try {
    const email = req.body.email ? req.body.email.trim().toLowerCase() : ""; // Normalize email
    const error = {};
    if (!email) {
      error.email = "Email is required!";
    } else if (!validator.isEmail(email)) {
      // Use validator library for comprehensive check
      error.email = "Please enter a valid email address.";
    } else {
      const user = await Users.findOne({ email }); // Check for existing user with normalized email
      if (user) {
        error.email = "This email address is already registered.";
      }
    }

    if (Object.keys(error).length > 0) {
      return res.status(200).json(answerObject("email", error.email)); // Use 400 status code
    }

    next();
  } catch (error) {
    return res.status(500).json(answerObject("error", error.message));
  }
};

// Middleware for validating image file upload
export const validateImageFile = async (req, res, next) => {
  if (req.file) {
    const { mimetype, size } = req.file;
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    const maxSize = 1024 * 1024 * 2; // 2MB

    // Check if file is an image and size is within limit
    if (!allowedTypes.includes(mimetype)) {
      return res
        .status(200)
        .json(answerObject("image", "Only images are allowed"));
    } else if (size > maxSize) {
      return res
        .status(200)
        .json(answerObject("image", "Image size should not exceed 2MB"));
    }
  }
  next();
};

const register = async (req, res) => {
  await Database.getInstance();
  try {
    const user = new Users({
      username: req.body.username,
      email: req.body.email,
      hashed_password: req.body.password,
    });
    if (req.file) {
      user["profile-picture"] = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
        fileName: generateFilename(req.file.originalname),
      };
    }
    await user.save();
    return res
      .status(201)
      .json(answerObject("success", "User created successfully", user));
  } catch (error) {
    return res.status(500).json(answerObject("error", error.message));
  }
};

const validateLoginData = async (req, res, next) => {
  try {
    const db = await Database.getInstance();
    const user = await Users.findOne({
      $or: [{ username: req.body.username }, { email: req.body.username }],
    });
    if (!user) {
      return res
        .status(200)
        .json(
          answerObject(
            "username",
            `No user with this username: ${req.body.username}`
          )
        );
    }
    if (!user.isPasswordMatch(req.body.password)) {
      return res
        .status(200)
        .json(answerObject("password", `Incorrect password!`));
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(500).json(answerObject("error", err.message));
  }
};

const login = async (req, res) => {
  try {
    await Database.getInstance();
    const token = jwt.sign({ _id: req.user._id }, process.env.JWT_SECRET);
    req.user.hashed_password = undefined;
    req.user.salt = undefined;
    return res.status(200).json(
      answerObject("success", `Logged in successefully!`, {
        user: SerializeUser(req.user),
        token: token,
      })
    );
  } catch (error) {
    return res.status(500).json(answerObject("error", "Something went wrong!"));
  }
};
async function requireSingin(req, res, next) {
  try {
    await Database.getInstance(); // Ensure database connection
    const Authorization = req.headers.authorization;
    let token = Authorization
      ? Authorization.split(" ")[1]
      : req.query.token
      ? req.query.token
      : null;

    if (token !== null) {
      const verificationResponse = jwt.verify(token, JWT_SECRET);
      const userId = verificationResponse._id;

      const foundUser = await Users.findOne({ _id: userId });

      foundUser.hashed_password = undefined;
      foundUser.salt = undefined;
      if (foundUser) {
        req.current_user = foundUser;
        next();
      } else {
        res
          .status(401)
          .json(answerObject("error", "Wrong authentication token"));
      }
    } else {
      return res
        .status(404)
        .json(answerObject("error", "Authentication token missing"));
    }
  } catch (error) {
    res.status(401).json({
      error: "Wrong authentication token",
    });
  }
}

export {
  validateUsername,
  validateEmail,
  register,
  validateLoginData,
  login,
  requireSingin,
};
