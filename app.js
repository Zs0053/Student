const express = require("express");
const app = express();
const ejs = require("ejs");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const User = require("./models/user");
const methodOverride = require("method-override");
const { response } = require("express");

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.set("view engine", "ejs");
mongoose.set("useFindAndModify", false);

mongoose
  .connect("mongodb://localhost:27017/billingDB", {
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
  res.send("Homepage of Billing Service.");
});

app.get("/users", async (req, res) => {
  try {
    let data = await User.find({});
    /*
    let data = await User.aggregate([
      { $group: {_id: "$id"}},
      { $project: {_id: 0, id: "$_id"}}
    ]);
    */
    res.render("users.ejs", { data });
  } catch {
    res.send("Error with finding data.");
  }
});

app.get("/users/insert", (req, res) => {
  res.render("userInsert.ejs");
});

app.get("/users/:id", async (req, res) => {
  let { id } = req.params;
  try {
    let data = await User.findOne({ id: id });
    if (data !== null) {
      res.render("userPage.ejs", { data });
    } else {
      res.send("Cannot find this user. Please enter a valid id.");
    }
  } catch (e) {
    res.send("Error!!");
    console.log(e);
  }
});

app.post("/users/insert", async(req, res) => {
  let { id, name} = req.body;
  let service_type = "Create Account";
  let previous_balance = 0;
  let change_amount = 100;
  let current_balance = previous_balance + change_amount;
  let data = await User.findOne({ id: id });
  if (data !== null) {
    res.send("ID conflict.")
  } else {
  let newUser = new User({
    id,
    name,
    service_type,
    change_amount,
    current_balance,
  });
  newUser
    .save()
    .then(() => {
      console.log("user accepted.");
      res.render("accept.ejs");
    })
    .catch((e) => {
      console.log("user not accepted.");
      console.log(e);
      res.render("reject.ejs");
    });
  }
});

app.get("/users/edit/:id", async (req, res) => {
  let { id } = req.params;
  try {
    let data = await User.findOne({ id });
    if (data !== null) {
      res.render("edit.ejs", { data });
    } else {
      res.send("Cannot find user.");
    }
  } catch {
    res.send("Error!");
  }
});

app.put("/users/edit/:id", async (req, res) => {
  let { id, name } = req.body;
  try {
    let d = await User.findOneAndUpdate(
      { id },
      {name}
    );
    res.redirect(`/users/${id}`);
  } catch {
    res.render("reject.ejs");
  }
});

app.delete("/users/delete/:id", (req, res) => {
  let { id } = req.params;
  User.deleteOne({ id })
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
