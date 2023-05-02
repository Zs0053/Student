const express = require('express');
const router = express.Router();
const validatePassword = require("./utils/validatePassword");
const Admin = require("./models/admin");

router.get("/", (req, res) => {
    res.render("login");
});

router.post("/", async(req, res) => {
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

module.exports = router;