import mongoose from "mongoose";

const { Schema, models, model } = mongoose;

const conversationsSchema = new Schema(
  {
    startedBy: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    to: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    last_message: {
      type: Schema.Types.ObjectId,
      ref: "Messages",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// populate last_message param
const objectToPopulate = [
  {
    path: "last_message",
    populate: [
      {
        path: "sender receiver",
        select: "username profile-picture last_seen",
      },
      {
        path: "content",
        select: "message contentType fileName fileSize",
      },
    ],
  },
  {
    path: "startedBy to",
    select: "username profile-picture last_seen",
  },
];

// populate last_message
conversationsSchema.pre("save", async function (next) {
  try {
    if (!this.isNew) {
      await this.populate(objectToPopulate);
    }
    next();
  } catch (error) {
    next(error);
  }
});

// populate last_message on find and findOne methods
conversationsSchema.pre("find", function () {
  this.populate(objectToPopulate);
});

conversationsSchema.pre("findOne", function () {
  this.populate(objectToPopulate);
});

export default models.Conversations ||
  model("Conversations", conversationsSchema);
