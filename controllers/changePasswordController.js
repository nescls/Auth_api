const { User } = require('../models/users.js');
const path = require('path');
const bcrypt = require('bcrypt');

const nodemailer = require('nodemailer');

const handleGenerateCode = async (req, res) => {
    const { user } = req.params;
    try {
        // check if the user exists in the db
        const userObj = await User.findOne({where: {id_number: user}});
        if (!userObj) return res.status(404).json({ 'message': 'User not found.' });
        // generate a random code
        const code = Math.floor(100000 + Math.random() * 900000);
        // store the code in the user's refreshToken field
        userObj.refreshToken = code.toString();
        await userObj.save();
        // send the code to the user's registered email
        const transporter = nodemailer.createTransport({
            // configure the email service provider here
        });
        await transporter.sendMail({
            from: 'your-email@example.com',
            to: userObj.correo,
            subject: 'Password reset code',
            text: `Your password reset code is: ${code}`,
        });
        res.status(200).json({ 'success': 'Code sent successfully.' });
    } catch (err) {
        res.status(500).json({ 'message': err.message });
    }
}

const handleChangePasswordWithOldPwd = async (req, res) => {
    const { oldPwd, newPwd } = req.body;
    const { user } = req.params;
    if (!oldPwd) return res.status(400).json({ 'message': 'Old password is required.' });
    if (!newPwd) return res.status(400).json({ 'message': 'New password is required.' });
    try {
        // check if the user exists in the db
        const userObj = await User.findOne({where: {id_number: user}});
        if (!userObj) return res.status(404).json({ 'message': 'User not found.' });
        // check if the old password matches
        if (!(await bcrypt.compare(oldPwd, userObj.password))) {
            return res.status(400).json({ 'message': 'Old password is incorrect.' });
        }
        // encrypt the new password
        const hashedPwd = await bcrypt.hash(newPwd, 10);
        // update the user's password
        userObj.password = hashedPwd;
        userObj.refreshToken = null;
        await userObj.save();
        res.status(200).json({ 'success': 'Password changed successfully.' });
    } catch (err) {
        res.status(500).json({ 'message': err.message });
    }
}
const handleChangePasswordWithCode = async (req, res) => {
    const { code, newPwd } = req.body;
    const { user } = req.params;
    if (!code) return res.status(400).json({ 'message': 'Code is required.' });
    if (!newPwd) return res.status(400).json({ 'message': 'New password is required.' });
    try {
        // check if the user exists in the db
        const userObj = await User.findOne({where: {id_number: user}});
        if (!userObj) return res.status(404).json({ 'message': 'User not found.' });
        // check if the code matches
        if (code !== userObj.refreshToken) {
            return res.status(400).json({ 'message': 'Code is incorrect or has expired.' });
        }
        // encrypt the new password
        const hashedPwd = await bcrypt.hash(newPwd, 10);
        // update the user's password
        userObj.password = hashedPwd;
        userObj.refreshToken = null;
        await userObj.save();
        res.status(200).json({ 'success': 'Password changed successfully.' });
    } catch (err) {
        res.status(500).json({ 'message': err.message });
    }
}



module.exports = { handleChangePasswordWithOldPwd, handleChangePasswordWithCode, handleGenerateCode };