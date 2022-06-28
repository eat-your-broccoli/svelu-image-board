const {Sequelize} = require('sequelize');
const { loadSequelize } = require('../loadUmzug');

let Comment;
let sequelize;
exports.deleteComment = async function(id) {
    
    if(sequelize == null) {
        sequelize = await loadSequelize();
    } 
    if(Comment == null) {
        Comment = require('../models/comment')(sequelize, Sequelize);
    } 

    return await Comment.destroy({
        where: {id: id}
    })
}

exports.deleteCommentByUser = async function(user) {
    
    if(sequelize == null) {
        sequelize = await loadSequelize();
    } 
    if(Comment == null) {
        Comment = require('../models/comment')(sequelize, Sequelize);
    } 

    return await Comment.destroy({
        where: {user}
    })
}