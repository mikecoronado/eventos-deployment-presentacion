const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const bodyParser= require('body-parser');
const flash = require('connect-flash');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('./config/passport');
const router = require('./routes');


//CONFIGURACION Y MODELOS BASE DE DATOS
const db=require('./config/db');
require('./models/Usuarios');
require('./models/Categorias');
require('./models/Grupos');
require('./models/Eventos');
require('./models/Comentarios');




db.sync().then(() => console.log('Db conectada')).catch((error) => console.log(error));


//VARIABLES DE DESARROLLO
require('dotenv').config({path: 'variables.env'});



//APLICACION PRINCIPAL
const app= express();


//BODYPARSER, LEERFORM
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));



//VALIDACION Y FUNCIONES

//habilitar ejs como templete engine
app.use(expressLayouts);
app.set('view engine', 'ejs');

//Ubicacion vistas
app.set('views', path.join(__dirname, './views'));


//ARchivos estaticos
app.use(express.static('public'));


// HABILITAR COOCKE PARSER
app.use(cookieParser());


//CREAR LA SESSION 
app.use(session({
    secret: process.env.SECRETO,
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false
}))

//inicializar passport
app.use(passport.initialize());
app.use(passport.session());


//AGREGAR FLASH MESSAGES
app.use(flash());

//middleware (usuario loqueado, flash messages, fecha actual)
app.use((req, res, next)=> {
    res.locals.usuario = {...req.user} || null;
    res.locals.mensajes = req.flash();
    const fecha = new Date();
    res.locals.year = fecha.getFullYear();
    next();
});


//ROUTING
app.use('/', router());

//leer el host y el puerto
const host= process.env.HOST || '0.0.0.0';
const port = process.env.PORT  || 5000;


//Agrebar puerto
app.listen(port,host, () => {
    console.log('El servidor esta funcionando');
})