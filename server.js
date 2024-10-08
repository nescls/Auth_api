const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const { logger } = require('./middleware/logEvents');
const errorHandler = require('./middleware/errorHandler');
const verifyJWT = require('./middleware/verifyJWT');
const cookieParser = require('cookie-parser');
const credentials = require('./middleware/credentials');
const verifyRoles = require('./middleware/verifyRoles');
const PORT = process.env.PORT || 3500;

// custom middleware logger
app.use(logger);

// Handle options credentials check - before CORS!
// and fetch cookies credentials requirement
app.use(credentials);

// Cross Origin Resource Sharing
app.use(cors(corsOptions));

// built-in middleware to handle urlencoded form data
app.use(express.urlencoded({ extended: false }));

// built-in middleware for json 
app.use(express.json());

//middleware for cookies
app.use(cookieParser());

//serve static files
app.use('/', express.static(path.join(__dirname, '/public')));

// routes
app.use('/', require('./routes/root'));
app.use('/register', require('./routes/register'));
app.use('/auth', require('./routes/auth'));
app.use('/refresh',verifyJWT, require('./routes/refresh'));
app.use('/logout', require('./routes/logout'));
app.use('/ticket',verifyJWT, require('./routes/ticket'));
app.use('/info',verifyJWT,require('./routes/api/info'));
app.use('/changePassword',require('./routes/changePassword'));
app.use('/asignacion', require('./routes/asignacion'));
app.use('/transaction',verifyJWT, require('./routes/transaction'));
app.use('/ruta',verifyJWT, verifyRoles(2001, 5150, 2002),require('./routes/ruta'))

    //gabo

app.use('/authTkn', require('./routes/authTkn'));
app.use('/user', require('./routes/user'));


app.all('*', (req, res) => {
    res.status(404);
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'));
    } else if (req.accepts('json')) {
        res.json({ "error": "404 Not Found" });
    } else {
        res.type('txt').send("404 Not Found");
    }
});

app.use(errorHandler);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));