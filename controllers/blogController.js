const Post = require('../models/post');
const Tag = require('../models/tag')
const User = require('../models/user')
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
require('dotenv').config()

exports.index = function(req, res, next) {
    Post.find({}, 'title content date tags formatted_date')
    .sort({date : -1})
    .populate('tags')
    .exec(function (err, list_posts) {
      if (err) { return next(err); }
      //Successful, so render
      res.render('index', { title: `Filip's Development Journal`, post_list: list_posts, user: req.user, home: true });
    });

};

exports.post_create_get = [ 
        
    function(req, res, next) {
        console.log(req)
        next()
    },

    function(req, res, next) {
        Tag.find({}, 'name')
        .exec(function (err, tag_list) {
          if (err) { return next(err); }
          //Successful, so render
          console.log(tag_list)
          res.render('new', { title: `New Post`, post_title: "", post_content: req.body.post_content, tags: tag_list, user: req.user});
        });
    
    }
]


exports.post_create_post = [
    function(req, res, next) {
    console.log(req.body);
    next();
},

(req, res, next) => {
    if(!(req.body.post_tags instanceof Array)){
        if(typeof req.body.post_tags ==='undefined')
        req.body.post_tags = [];
        else
        req.body.post_tags = new Array(req.body.post_tags);
    }
    next();
},

    body('title', 'Please input a title.').trim().isLength({ min: 1, max: 70 }).withMessage('title must be between 1 and 70 characters').escape(),
    body('content', 'Please input some content').trim().isLength({ min: 1 }).escape(),

    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Book object with escaped and trimmed data.
        const post = new Post(
            { title: req.body.title,
            content: req.body.content,
            date: new Date(),
            tags: req.body.post_tags,
            });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all authors and genres for form.
            async.parallel({
                tags: function(callback) {
                    Tags.find(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }

                // Mark our selected tags as checked.
                for (let i = 0; i < results.post_tags.length; i++) {
                    if (post.post_tags.indexOf(results.post_tags[i]._id) > -1) {
                        results.post_tags[i].checked='true';
                    }
                }
                res.render('new', { title: `New Post`, post_title: results.title, post_content: results.content, post_tags: results.post_tags, user: req.user, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Save book.
            post.save(function (err) {
                if (err) { return next(err); }
                   //successful - redirect to home page
                   Post.find({}, 'title content date tags')
                    .sort({date : -1})
                    .populate('tags')
                    .exec(function (err, list_posts) {
                    if (err) { return next(err); }
                    //Successful, so render
                    res.redirect('/');
                    });

                });
        }
    }
    ];

exports.post_delete_get = function(req, res, next) {
    console.log(req.params);
    console.log("done!")
    Post.findById(req.params.id)
        .populate('tags')
        .exec(function (err, post_details) {
            if (err) { return next(err); }
            console.log(post_details)
            res.render('post_details', {post: post_details, user: req.user} )
        }
    )
}

exports.post_delete_post = function(req, res, next) {
    Post.findByIdAndRemove(req.params.id, function deletePost(err) {
        if (err) { return next(err); }
            res.render('post_details', {user: req.user} )
        }
    )
}

exports.signup_get = function(req, res, next) {
    res.render('signup', {user: req.user})
}

exports.signup_post = function(req, res, next) {
    {
        bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
            let lowerUser = req.body.username.toLowerCase();
            const user = new User({
                username: lowerUser,
                password: hashedPassword
              }).save(err => {
                if (err) { 
                  return next(err);
                }
                res.redirect("/login");
              });
        })       
    }
}

exports.login_get = function(req, res, next) {
    res.render('login', {user: req.user})
}

exports.login_post = function(req, res, next) {
   passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/login"
        })(req, res, next);
};

exports.logout = function(req, res, next) {
    req.logout();
    res.redirect('/')
 };
