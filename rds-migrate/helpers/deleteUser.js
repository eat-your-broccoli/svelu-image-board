const {Sequelize} = require('sequelize');
const { loadSequelize } = require('../loadUmzug');

let User;
let sequelize;
exports.deleteUser = async function(id) {
    
    if(sequelize == null) {
        sequelize = await loadSequelize();
    } 
    if(User == null) {
        User = require('../models/user')(sequelize, Sequelize);
    } 

    return await User.destroy({
        where: {id: id}
    })
}

exports.deleteUserByName = async function(username) {
    
    if(sequelize == null) {
        sequelize = await loadSequelize();
    } 
    if(User == null) {
        User = require('../models/user')(sequelize, Sequelize);
    } 

    return await User.destroy({
        where: {username}
    })
}