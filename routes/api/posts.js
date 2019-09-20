const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');

const User = require('../../models/User');
const Profile = require('../../models/Profile');
const Post = require('../../models/Post');

//@route  POST api/posts
//@desc   Test route
//@access Public
router.post(
  '/',
  [
    auth,
    [
      check('text', 'Text is required')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select('-password');

      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      });

      const post = await newPost.save();

      res.json(post);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

//@route  GET api/posts
//@desc   GET all posts
//@access private

router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });

    res.send(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('server error');
  }
});

//@route  GET api/posts/:id
//@desc   GET post by ID
//@access Private

router.get('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      res.status(400).json({ msg: 'No posts for this user' });
    }

    res.send(post);
  } catch (err) {
    console.error(err.message);

    if (err.kind === 'ObjectId') {
      res.status(404).json({ msg: 'No posts for this user' });
    }

    res.status(500).send('Server error');
  }
});
module.exports = router;
