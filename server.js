const express = require("express");
const app = express();
const mongoose = require("mongoose");
const { Schema } = mongoose;

mongoose.connect(
  "mongodb+srv://raghukiran1414:Raghu%40123@cluster0.m82pxwz.mongodb.net/studentmentorassign?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);
mongoose.set("strictQuery", true);

const mentorSchema = new Schema({
  name: String,
  email: String,
});

const studentSchema = new Schema({
  name: String,
  email: String,
  mentorId: {
    type: Schema.Types.ObjectId,
    ref: "Mentor",
  },
});

const Mentor = mongoose.model("Mentor", mentorSchema);

const Student = mongoose.model("Student", studentSchema);
app.use(express.json());

app.post("/mentors", async (req, res) => {
  const { name, email } = req.body;
  try {
    const mentor = await Mentor.create({ name, email });
    res.status(201).json(mentor);
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
});

app.post("/students", async (req, res) => {
  const { name, email } = req.body;
  try {
    const student = await Student.create({ name, email });
    res.status(201).json(student);
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
});

app.post("/mentors/:mentorId/students/:studentId/assign", async (req, res) => {
  const { mentorId, studentId } = req.params;
  try {
    const mentor = await Mentor.findById(mentorId);
    const student = await Student.findById(studentId);

    if (mentor && student) {
      student.mentorId = mentorId;
      await student.save();
      res.sendStatus(204);
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
});

app.post("/mentors/:mentorId/students/add", async (req, res) => {
  const { mentorId } = req.params;
  const { studentIds } = req.body;
  try {
    const mentor = await Mentor.findById(mentorId);

    if (mentor) {
      await Student.updateMany(
        { _id: { $in: studentIds } },
        { mentorId: mentorId }
      );
      res.sendStatus(204);
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
});

app.put("/students/:studentId/mentor", async (req, res) => {
  const { studentId } = req.params;
  const { mentorId } = req.body;
  try {
    const student = await Student.findById(studentId);
    const mentor = await Mentor.findById(mentorId);

    if (student && mentor) {
      student.mentorId = mentorId;
      await student.save();
      res.sendStatus(204);
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
});

app.get("/mentors/:mentorId/students", async (req, res) => {
  const { mentorId } = req.params;
  try {
    const mentor = await Mentor.findById(mentorId);

    if (mentor) {
      const students = await Student.find({ mentorId: mentorId });
      res.status(200).json({ students });
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
});

app.get("/students/:studentId/mentor", async (req, res) => {
  const { studentId } = req.params;
  try {
    const student = await Student.findById(studentId).populate("mentorId");

    if (student) {
      const mentor = student.mentorId;
      if (mentor) {
        res.status(200).json({
          mentorId: mentor._id,
          mentorName: mentor.name,
          mentorEmail: mentor.email,
        });
      } else {
        res.sendStatus(404);
      }
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
});

app.listen(5252, () => {
  console.log(`Listening on 5252`);
});
