const express = require('express');
const router = express.Router();

router.get('/', function(req, res) {
    req.session.destroy(function(err) {
        if (err) {
        console.log(err);
        } else {
        res.redirect('/');
        }
    });
});

module.exports = router;