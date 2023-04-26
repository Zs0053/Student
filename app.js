const express = require("express");
const app = express();
const ejs = require("ejs");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const User = require("./models/user");
const Record = require("./models/record");
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

// Complete
// List all users
app.get("/users", async (req, res) => {
  try {
    let data = await User.find({});
    res.render("users.ejs", { data });
  } catch {
    res.send("Error with finding data.");
  }
});
// Get the insert page
app.get("/users/insert", (req, res) => {
  res.render("userInsert.ejs");
});
// Get the operation page
app.get("/users/operation", (req, res) => {
  res.render("userOperation.ejs");
});
// Complete
// List all records given the id
app.get("/users/:id", async (req, res) => {
  let { id } = req.params;
  try {
    // All records
    let records = await Record.find({ id: id });
    // User info
    let data = await User.findOne({ id: id });
    if (data !== null) {
      res.render("userPage.ejs", { data, records });
    } else {
      res.send("Cannot find this user. Please enter a valid id.");
    }
  } catch (e) {
    res.send("Error!!");
    console.log(e);
  }
});


// Complete
// Create a new users
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
    current_balance
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
  let newRecord = new Record({
    id,
    service_type,
    previous_balance,
    change_amount,
    current_balance,
  });
  newRecord
    .save()
    .then(() => {
      console.log("record accepted.");
      res.render("accept.ejs");
    })
    .catch((e) => {
      console.log("record not accepted.");
      console.log(e);
      res.render("reject.ejs");
    });
  }
});

app.post("/users/operation", async(req, res) => {
  let { id, name, service_type, change_amount} = req.body;
  let user = await User.findOne({ id: id });
  let previous_balance = Number(user.current_balance);
  let break_flag = false;
  change_amount = Number(change_amount);
  if (service_type == "Deposit" && change_amount > 0) {
    var current_balance = previous_balance + change_amount;
  } else if ((service_type == "Withdraw" || service_type == "Billing") && change_amount > 0 && change_amount < previous_balance) {
    var current_balance = previous_balance - change_amount;
  } else {
    res.send("Invalid Service Type or Amount.");
    break_flag = true;
  }

  if (break_flag !== true) {
    User.updateOne({ id: id}, { current_balance: current_balance }, function(error, result) {
      if (error) {
        console.log(error);
      } else {
        console.log(result);
      }
    });
    let newRecord = new Record({
      id,
      service_type,
      previous_balance,
      change_amount,
      current_balance,
    });
    newRecord
    .save()
    .then(() => {
      console.log("record accepted.");
      res.render("accept.ejs");
    })
    .catch((e) => {
      console.log("record not accepted.");
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
  console.log(id)
  User.deleteOne({ id })
    .then((meg) => {
      console.log(meg);
    })
    .catch((e) => {
      console.log(e);
    });
    Record.deleteMany({ id })
    .then((meg) => {
      console.log(meg);
      res.send("Record and user Deleted successfully.");
    })
    .catch((e) => {
      console.log(e);
      res.send("Record and user  Delete failed.");
    });
});

app.get("/*", (req, res) => {
  res.status(404);
  res.send("Not allowed.");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000.");
});
