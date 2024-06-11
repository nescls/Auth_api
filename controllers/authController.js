const { User } = require('../models/users.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { MiniToken } = require('../models/minitoken.js');
require('dotenv').config();

const handleLogin = async (req, res) => {
    const { user, pwd } = req.body;
    if (!user || !pwd) return res.status(400).json({ 'message': 'Username and password are required.' });
    const foundUser = await User.findOne({ where: { id_number: user } });
    if (!foundUser) return res.sendStatus(401); //Unauthorized 
    // evaluate password 
    const match = await bcrypt.compare(pwd, foundUser.password);
    if (match) {
        const role = foundUser.rol;
        // create JWTs
        const accessToken = jwt.sign(
            {
                "UserInfo": {
                    "username": foundUser.id_number,
                    "role": role
                }
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '1d' }
        );
        const refreshToken = jwt.sign(
            { "username": foundUser.id_number },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '1d' }
        );
        // Saving refreshToken with current user
        foundUser.refreshToken = refreshToken;
        console.log(refreshToken);
        await foundUser.save();
        
        // Generate and save new minitoken
    const minitokenValue = Math.floor(100000 + Math.random() * 900000); // Generate 6-digit integer value
    const minitoken = await MiniToken.findOne({ where: { user_id: foundUser.id, status: 'activo' } });
    if (minitoken) {
      minitoken.status = 'caducado';
      await minitoken.save();
    }
    await MiniToken.create({ user_id: foundUser.id, minitoken: minitokenValue, status: 'activo' });

        res.cookie('jwt', refreshToken, { httpOnly: true, sameSite: 'None', secure: true, maxAge: 24 * 60 * 60 * 1000 });
        res.json({ accessToken });
    } else {
        res.sendStatus(401);
    }
}

const handleLoginWithTkn = async (req, res)=>{
    if(req.user){
        const foundUser = await User.findOne({ where: { id_number: req.user } });
        if (!foundUser) return res.sendStatus(401); //Unauthorized 
        const role = foundUser.rol;
        // create JWTs
        const accessToken = jwt.sign(
            {
                "UserInfo": {
                    "username": foundUser.id_number,
                    "role": role
                }
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '1d' }
        );
        const refreshToken = jwt.sign(
            { "username": foundUser.id_number },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '1d' }
        );
        // Saving refreshToken with current user
        foundUser.refreshToken = refreshToken;
        console.log(refreshToken);
        await foundUser.save();
        
        res.cookie('jwt', refreshToken, { httpOnly: true, sameSite: 'None', secure: true, maxAge: 24 * 60 * 60 * 1000 });
        res.json({ accessToken, user: req.user });
    }else{
        res.sendStatus(401);
    }
}

module.exports = { handleLogin, handleLoginWithTkn };