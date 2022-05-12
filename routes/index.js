var express = require('express');
var router = express.Router();

// Require controller modules.
var blogController = require('../controllers/blogController');

/* GET home page. */
router.get('/', blogController.index);

router.get('/new', blogController.post_create_get);
router.post('/new', blogController.post_create_post)

router.get('/:id/delete', blogController.post_delete_get);
router.post('/:id/delete', blogController.post_delete_post);


// router.get('/signup', blogController.signup_get);
// router.post('/signup', blogController.signup_post);


router.get('/login', blogController.login_get);
router.post('/login', blogController.login_post);

router.post('/logout', blogController.logout);

module.exports = router;
