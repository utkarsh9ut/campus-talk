const Post = require('../models/post');
const Comment = require('../models/comment');
const fs = require('fs');
const path = require('path');
const Like = require('../models/like');

module.exports.create = async function(req, res){
    //console.log('body is' ,req.body);
    try{
        
            
            //console.log(req.file)
            
            await Post.uploadedAvatar(req, res, async function(err){
                if (err) {console.log('*****Multer Error: ', err)}
                var post = await Post.create({
                    content: req.body.content,
                    user: req.user._id,
                });
                if(req.file){
                post.avatar = Post.avatarPath + '/' + req.file.filename;}
                console.log(req.file);
               
                post.save();
                
            });
            
            //  if (req.xhr){
            //      //console.log(post);
            //      return res.status(200).json({
            //          data: {
            //            post: post
            //          },
            //          message: "Post Created"
            //      });
            //  }

        
        req.flash('success', 'Post published!');
        return res.redirect('back');

    }
    catch(err){
        req.flash('error', err);
        // added this to view the error on console as well
        console.log(err);
        return res.redirect('back');
    }
  
}


module.exports.destroy = async function(req, res){

    try{
        let post = await Post.findById(req.params.id);

        if (post.user == req.user.id){
            await Like.deleteMany({Likeable:post, onModel:'Post'});
            await Like.deleteMany({_id:{$in:post.comments}});

            post.remove();

            await Comment.deleteMany({post: req.params.id});
            

            if (req.xhr){
                return res.status(200).json({
                    data: {
                        post_id: req.params.id
                    },
                    message: "Post deleted"
                });
            }

            req.flash('success', 'Post and associated comments deleted!');

            return res.redirect('back');
        }else{
            req.flash('error', 'You cannot delete this post!');
            return res.redirect('back');
        }

    }catch(err){
        req.flash('error', err);
        return res.redirect('back');
    }
    
}