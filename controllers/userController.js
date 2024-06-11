const { User } = require('../models/users.js');
const { Sequelize } = require('sequelize');
const bcrypt = require('bcrypt');

async function getUserInfo (req, res) {
  console.log("este");
  const { user } = req.body;
  if ( !user) return res.status(400).json({ 'message': 'body incompleto.' });
    try {
      
      // Retrieve the user and their balance from the database
      const foundUser = await User.findOne({ where: { id_number: user }, attributes: { exclude: ['password'] },
        include: [
        {model : UserBalance ,  required: false,},
        
        // {model : MiniToken, where: {status: "activo"},  required: false,},
        // {model : Ticket,  where: { status: "activo",},
        // attributes: ["ruta_id", [Sequelize.fn("COUNT", Sequelize.col("ruta_id"))]],
        // group: ["ruta_id"],
        // },
      ]});
   
      if (!foundUser ) {
        return res.status(404).json({
          error: 'User not found'
        });
      }
      
      return res.status(200).json({
        foundUser: foundUser
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        error: 'Server error'
      });
    }
}

async function findAll(req, res){
    try {
      const users = await User.findAll();
      res.status(200).json(users);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
}

  async function editUser(req, res) {
    const { user } = req.body;
    const { id } = req.params;
    if (!user || !id) return res.status(400).json({ 'message': 'body incompleto.' });
    try {
      const foundUser = await User.findOne({ where: { id } });
      if (!foundUser) {
        return res.status(404).json({
          error: 'User not found'
        });
      }

      if(user.password){
        user.password = await bcrypt.hash(user.password, 10);
      }
      // Update the user information
      await User.update(user, { where: { id } });
  
      // Return the updated user information as a JSON response
      return res.status(200).json({
        message: 'User updated successfully',
        updatedUser: {
          ...foundUser.toJSON(),
          ...user,
        },
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        error: 'Server error'
      });
    }
  }
  async function deleteUser(req, res) {
    const { id } = req.params;
    if (!id) return res.status(400).json({ 'message': 'body incompleto.' });
    try {
      const foundUser = await User.findOne({ where: { id } });
      if (!foundUser) {
        return res.status(404).json({
          error: 'User not found'
        });
      }
      // Delete the user
      await User.destroy({ where: { id } });
  
      // Return a success message as a JSON response
      return res.status(200).json({
        message: 'User deleted successfully',
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        error: 'Server error'
      });
    }
  }
  
  module.exports = {
    getUserInfo,
    editUser,
    deleteUser,
    findAll
  }
