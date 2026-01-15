import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
    },
    assignedTo: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
    status: {
      type: String,
      enum: ["TODO", "DOING", "DONE"],
      default: "TODO",
    },
    comments: [
      {
        text: { type: String, required: true },
        createdBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Task = mongoose.model("Task", taskSchema);

export default Task;
