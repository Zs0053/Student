const express = require("express");
const app = express();
const ejs = require("ejs");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const Student = require("./models/student");
const methodOverride = require("method-override");
const { response } = require("express");

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.set("view engine", "ejs");
mongoose.set("useFindAndModify", false);

mongoose
  .connect("mongodb://localhost:27017/studentDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Successfully connected to mongoDB.");
  })
  .catch((e) => {
    console.log("Connection failed.");
    console.log(e);
  });

app.get("/", (req, res) => {
  res.send("This is homepage.");
});

app.get("/students", async (req, res) => {
  try {
    let data = await Student.find();
    res.render("students.ejs", { data });
  } catch {
    res.send("Error with finding data.");
  }
});

app.get("/students/insert", (req, res) => {
  res.render("studentInsert.ejs");
});

app.get("/students/:id", async (req, res) => {
  let { id } = req.params;
  try {
    let data = await Student.findOne({ id });
    if (data !== null) {
      res.render("studentPage.ejs", { data });
    } else {
      res.send("Cannot find this student. Please enter a valid id.");
    }
  } catch (e) {
    res.send("Error!!");
    console.log(e);
  }
});

app.post("/students/insert", (req, res) => {
  let { id, name, age, merit, other } = req.body;
  let newStudent = new Student({
    id,
    name,
    age,
    scholarship: { merit, other },
  });
  newStudent
    .save()
    .then(() => {
      console.log("Student accepted.");
      res.render("accept.ejs");
    })
    .catch((e) => {
      console.log("Student not accepted.");
      console.log(e);
      res.render("reject.ejs");
    });
});

app.get("/students/edit/:id", async (req, res) => {
  let { id } = req.params;
  try {
    let data = await Student.findOne({ id });
    if (data !== null) {
      res.render("edit.ejs", { data });
    } else {
      res.send("Cannot find student.");
    }
  } catch {
    res.send("Error!");
  }
});

app.put("/students/edit/:id", async (req, res) => {
  let { id, name, age, merit, other } = req.body;
  try {
    let d = await Student.findOneAndUpdate(
      { id },
      { id, name, age, scholarship: { merit, other } },
      {
        new: true,
        runValidators: true,
      }
    );
    res.redirect(`/students/${id}`);
  } catch {
    res.render("reject.ejs");
  }
});

app.delete("/students/delete/:id", (req, res) => {
  let { id } = req.params;
  Student.deleteOne({ id })
    .then((meg) => {
      console.log(meg);
      res.send("Deleted successfully.");
    })
    .catch((e) => {
      console.log(e);
      res.send("Delete failed.");
    });
});

app.get("/*", (req, res) => {
  res.status(404);
  res.send("Not allowed.");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000.");
});
