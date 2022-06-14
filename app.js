const mongoose = require('mongoose');
require('./config/db');

const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const ruta = require('./routes/index');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const createError = require('http-errors')
const passport = require('./config/passport');

require('dotenv').config({path: 'variables.env'})

const app = express();

//Habilitar body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Validacion de campos
//app.use(expressValidator());

// Haibilitar handlebar como view
app.engine(
    'handlebars',
    exphbs.engine({
        layoutsDir: './views/layouts/',
        defaultLayout: 'layout',
        extname: 'handlebars',
        runtimeOptions: {
            allowProtoPropertiesByDefault: true,
            allowProtoMethodsByDefault: true,
        },
        helpers: require('./helpers/handlebars')
    })
);
app.set('view engine', 'handlebars');

// Static files
app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieParser());

app.use(session({
    secret: process.env.SECRETO,
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({mongoUrl: process.env.DATABASE})
}));

// Iciaializar passport
app.use(passport.initialize());
app.use(passport.session());

// Alertas y flash messages
app.use(flash());

// Creacion de middleware
app.use((req, res, next) => {
    res.locals.mensajes = req.flash();
    next();
});

// Rutas
app.use('/', ruta);
app.use((req, res, next) => {
    next(createError(404, 'No Encontrado'));
});

// Administracion de los errores
app.use((error, req, res) => {
    res.locals.mensaje = error.message;
    const status = error.status || 500;
    res.locals.status = status;
    res.status(status);
    res.render('error');
})

// Puerto
const host = '0.0.0.0';
const port = process.env.PORT;

app.listen(port, host, () => {
    console.log('El servidor esta funcionando');
});

//app.listen(port);
// const port = process.env.PORT || 3000;
// app.listen(port, () => {
//     console.log(`Trabajando en el puerto ${port}`);
// })