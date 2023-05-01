const express = require("express");
const app = express();
const ejs = require("ejs");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const User = require("./models/user");
const Record = require("./models/record");
const methodOverride = require("method-override");
const Admin = require("./models/admin")
const session = require("express-session")
const cookieParser = require("cookie-parser")
const crypto = require("crypto");
const randomGenerator = require("./utils/randomGenerator");
const encryptPassword = require("./utils/encryptPassword");
const validatePassword = require("./utils/validatePassword");

app.use(cookieParser())
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.set("view engine", "ejs");

/**
 * Express middleware for adding session functionality.
 *
 * @function
 * @param {object} session - An session object
 * @param {string|function} session.secret - The session secret, which can be a string or a function for generating the secret.
 * @param {boolean} [session.resave=false] - Whether to force the session to be saved on every request.
 * @param {boolean} [session.saveUninitialized=true] - Whether to initialize the session on every request.
 */
app.use(session({
  secret: randomGenerator(),
  resave: false,
  saveUninitialized: true,
}))

/**
 * Middleware function to verify whether a user is logged in or not.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function to be called.
 */
const loginverify = (req, res, next) => {
  // Check if the user is verified by checking the `isVerified` flag in the session.
  if (req.session.isVerifed) {
    // If the user is verified, call the next middleware function in the chain.
    next();
  } else {
    // If the user is not verified, redirect them to the login page.
    res.redirect("login");
  }
};

// Disable the use of deprecated methods in MongoDB's driver.
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

app.post("/login", async(req, res) => {
  let {username , password} = req.body

    let foundUser = await Admin.findOne({username : username})
    if (!foundUser){
      res.send("UserName incorrect")
    }else{
      if(validatePassword(password, foundUser.userhash, foundUser.salt)){
        req.session.isVerifed = true
        console.log(req.session.isVerifed)
        console.log(req.cookies)
        res.send("Login successfully , This is Homepage of Billing Service.");
      }else{
        res.send("Password incorrect")
      }
    }
});

app.get("/login", (req, res) => {
  res.render("login");
});


app.post("/signup", async(req, res) => {
  let {username , password} = req.body
  // Generate a random salt value
  let salt = randomGenerator();
  // Encrypt the password with salt
  let userhash = encryptPassword(password, salt);

  let foundUser = await Admin.findOne({username : username})
  if(!foundUser){
    let newAdmin = new Admin({username , salt, userhash})
    newAdmin.save().then(() =>{
      res.send("Signup successfully , This is Homepage of Billing Service.");
    }).catch(()=>{
      res.send("Error!")
    })
  }else{
    res.send("UserName exist")
  }
  
});

app.get("/signup", (req, res) => {
  res.render("signup.ejs");
});

// List all users
app.get("/users", loginverify , async (req, res) => {
  try {
    let data = await User.find({});
    res.render("users.ejs", { data });
  } catch {
    res.send("Error with finding data.");
  }
});

// Get the insert page
app.get("/users/create", loginverify, (req, res) => {
  res.render("userCreate.ejs");
});

// Get the operation page
app.get("/users/operation", loginverify,(req, res) => {
  res.render("userOperation.ejs");
});

// List all records given the id
app.get("/users/:id", loginverify, async (req, res) => {
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
  } catch(e) {
    res.send("Error!!");
    console.log(e);
  }
});

// Create a new users
app.post("/users/create", loginverify, async (req, res) => {
  let { id, name } = req.body;
  let service_type = "Create Account";
  let previous_balance = 0;
  let change_amount = 100;
  let current_balance = change_amount;

  let data = await User.findOne({ id: id });
  if (data !== null) {
    res.send("ID conflict.");
  } else {
    try {
      let newUser = new User({
        id,
        name,
        current_balance,
      });

      let newRecord = new Record({
        id,
        service_type,
        previous_balance,
        change_amount,
        current_balance,
      });

      await newUser.save();
      await newRecord.save();

      console.log("user and record accepted.");
      res.render("accept.ejs");
    } catch (e) {
      console.log("user and record not accepted.");
      console.log(e);
      res.render("reject.ejs");
    }
  }
});

app.post("/users/operation", loginverify, async (req, res) => {
  let { id, name, service_type, change_amount } = req.body;
  try {
    let user = await User.findOne({ id: id });
    if (!user) {
      res.send("User not found.");
      return;
    }
    
    let previous_balance = Number(user.current_balance);
    change_amount = Number(change_amount);
    let current_balance;

    if (
      (service_type == "Deposit" || service_type == "Credit") &&
      change_amount > 0
    ) {
      current_balance = previous_balance + change_amount;
    } else if (
      (service_type == "Withdraw" || service_type == "Billing") &&
      change_amount > 0 &&
      change_amount <= previous_balance
    ) {
      current_balance = previous_balance - change_amount;
    } else {
      res.send("Invalid Service Type or Amount.");
      return;
    }

    await User.updateOne(
      { id: id },
      { current_balance: current_balance }
    );

    let newRecord = new Record({
      id,
      service_type,
      previous_balance,
      change_amount,
      current_balance,
    });

    await newRecord.save();
    console.log("record accepted.");
    res.render("accept.ejs");
  } catch (e) {
    console.log("record not accepted.");
    console.log(e);
    res.render("reject.ejs");
  }
});

app.get("/users/edit/:id",loginverify, async (req, res) => {
  let { id } = req.params;
  try {
    let data = await User.findOne({ id : id});
    if (data !== null) {
      res.render("edit.ejs", { data });
    } else {
      res.send("Cannot find user.");
    }
  } catch {
    res.send("Error!");
  }
});

app.put("/users/edit/:id",loginverify, async (req, res) => {
  let { id, name } = req.body;
  try {
    let d = await User.findOneAndUpdate(
      { id: id },
      {name: name}
    );
    res.redirect(`/users/${id}`);
  } catch {
    res.render("reject.ejs");
  }
});


app.delete("/users/delete/:id", loginverify, (req, res) => {
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

app.get('/logout', function(req, res) {
  req.session.destroy(function(err) {
    if (err) {
      console.log(err);
    } else {
      res.redirect('/');
    }
  });
});

app.get("/*", (req, res) => {
  res.status(404);
  res.send("Not allowed.");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000.");
});
