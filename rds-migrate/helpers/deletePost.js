const {Sequelize} = require('sequelize');
const { loadSequelize } = require('../loadUmzug');

let Post;
let sequelize;
exports.deletePost = async function(id) {
    
    if(sequelize == null) {
        sequelize = await loadSequelize();
    } 
    if(Post == null) {
        Post = require('../models/post')(sequelize, Sequelize);
    } 

    return await Post.destroy({
        where: {id: id}
    })
}

exports.deletePostsByUser = async function(user) {
    
    if(sequelize == null) {
        sequelize = await loadSequelize();
    } 
    if(Post == null) {
        Post = require('../models/post')(sequelize, Sequelize);
    } 

    return await Post.destroy({
        where: {user}
    })
}