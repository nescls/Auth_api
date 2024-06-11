const { User } = require('../models/users.js');
const path = require('path');
const bcrypt = require('bcrypt');
const { UserBalance } = require('../models/userBalance.js');



const handleNewUser = async (req, res) => {
    const { user, pwd , roll, mail, telefono, serial} = req.body;
    if (!user || !pwd || !mail ) return res.status(400).json({ 'message': 'Username and password and mail are required.' });
    // check for duplicate usernames in the db
    const duplicate = await User.findOne({where: {id_number: user}});
    if (duplicate != null) return res.status(400).json({ 'message': 'Numero de cedula ya registrada'}); //Conflict 
    try {
        //encrypt the password
        const hashedPwd = await bcrypt.hash(pwd, 10);
        //store the new user
        console.log(mail)

        const newUser  =  User.create({
            id_number:user,
            serial:serial,
            password: hashedPwd,
            correo: mail.toString(),
            isActive: true,
            telefono: telefono,
            rol: roll ? roll : 2001,
        });
       
        res.status(201).json({ 'success': `New user ${newUser} created!` });
    } catch (err) {
        res.status(500).json({ 'message': err.message });
    }
}

module.exports = { handleNewUser };