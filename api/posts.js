const express = require('express');
const postsRouter = express.Router();
const { requireUser } = require('./utils');
// const usersRouter = require("./users");
const { getPostById, updatePost, getAllPosts, createPost } = require('../db');

postsRouter.post('/', requireUser, async (req, res, next) => {
  // res.send({ message: 'under construction' });
  const { title, content, tags = "" } = req.body;

  const tagArr = tags.trim().split(/\s+/)
  const postData = {};

  if (tagArr.length) {
    postData.tags = tagArr;
  }

  try {
    // add authorId, title, content to postData object
    postData.authorId = req.user.id;
    postData.title = title;
    postData.content = content;

    const post = await createPost(postData);
    // this will create the post and the tags for us
    // if the post comes back, res.send({ post });
    if (post){
      res.send({post});
    }
    // otherwise, next an appropriate error object 
    next(
      {name: "PostError", message: "Error creating post"}
      );
  } catch ({ name, message }) {
    next({ name, message });
  }
});

postsRouter.use((req, res, next) => {
    console.log("A request is being made to /posts");
  
    next(); // THIS IS DIFFERENT
  });

  // const { getAllPosts } = require('../db');

  postsRouter.get('/', async (req, res, next) => {
    try {
      const allPosts = await getAllPosts();
  
      const posts = allPosts.filter(post => {
          return post.active || (req.user && post.author.id === req.user.id);
  //       // keep a post if it is either active, or if it belongs to the current user
      });
  
      res.send({
        posts,
      });
    } catch ({ name, message }) {
      next({ name, message });
    }
  });
  
  // postsRouter.get('/', async (req, res, next) => {
  //   const posts = await getAllPosts();
  //   res.send({
  //     posts: [],
  //   });
  // });

  postsRouter.patch('/:postId', requireUser, async (req, res, next) => {
    const { postId } = req.params;
    const { title, content, tags } = req.body;
  
    const updateFields = {};
  
    if (tags && tags.length > 0) {
      updateFields.tags = tags.trim().split(/\s+/);
    }
  
    if (title) {
      updateFields.title = title;
    }
  
    if (content) {
      updateFields.content = content;
    }
  
    try {
      const originalPost = await getPostById(postId);
  
      if (originalPost.author.id === req.user.id) {
        const updatedPost = await updatePost(postId, updateFields);
        res.send({ post: updatedPost })
      } else {
        next({
          name: "UnauthorizedUserError",
          message: "You cannot update a post that is not yours",
        })
      }
    } catch ({ name, message }) {
      next({ name, message });
    }
  });

  postsRouter.delete('/:postId', requireUser, async (req, res, next) => {
    try {
      const post = await getPostById(req.params.postId);
  
      if (post && post.author.id === req.user.id) {
        const updatedPost = await updatePost(post.id, { active: false });
  
        res.send({ post: updatedPost });
      } else {
        // if there was a post, throw UnauthorizedUserError, otherwise throw PostNotFoundError
        next(post ? { 
          name: "UnauthorizedUserError",
          message: "You cannot delete a post which is not yours"
        } : {
          name: "PostNotFoundError",
          message: "That post does not exist"
        });
      }
  
    } catch ({ name, message }) {
      next({ name, message })
    }
  });

  // postsRouter.get("/", async (req, res) => {
  //   const allPosts = await getAllPosts();
  //   res.send({
  //     posts,
  //   });
  // });

module.exports = postsRouter;