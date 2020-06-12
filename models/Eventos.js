const Sequelize = require('sequelize');
const db = require('../config/db');
const uuid = require('uuid');
const slug = require('slug');
const shortid = require('shortid');


const Usuarios = require('../models/Usuarios');
const Grupos = require('../models/Grupos');


const Evento = db.define(

    'meeti', {
        id: {
            type: Sequelize.UUID,
            primaryKey: true,
            allowNull: false,
        },
        titulo: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: 'Agrega un Titulo'
                }
            }
        },
        slug:{
            type:Sequelize.STRING,
        },
        invitado: Sequelize.STRING,
        cupo: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        },
        descripcion: {
            type: Sequelize.TEXT,
            allowNull: false,
            validate:{
                notEmpty: {
                    msg: 'Agrega una descripcion'
                }
            }
        },
        fecha: {
            type: Sequelize.DATEONLY,
            allowNull: false,
            validate:{
                notEmpty: {
                    msg: 'Agrega una fecha para el evento'
                }
            }
        },
        hora: {
            type: Sequelize.TIME,
            allowNull: false,
            validate:{
                notEmpty: {
                    msg: 'Agrega una hora para el evento'
                }
            }
        },
        direccion: {
            type: Sequelize.STRING,
            allowNull: false,
            validate:{
                notEmpty: {
                    msg: 'Agrega una direccion al evento'
                }
            }
        },
        ciudad: {
            type: Sequelize.STRING,
            allowNull: false,
            validate:{
                notEmpty: {
                    msg: 'Agrega una ciudad al evento'
                }
            }
        },
        estado: {
            type: Sequelize.TEXT,
            allowNull: false,
            validate:{
                notEmpty: {
                    msg: 'Agrega un estado'
                }
            }
        },
        pais: {
            type: Sequelize.STRING,
            allowNull: false,
            validate:{
                notEmpty: {
                    msg: 'Agrega un pais'
                }
            }
        },
        ubicacion: {
            type: Sequelize.GEOMETRY('POINT'),
           
        },
        interesados: {
            type: Sequelize.ARRAY(Sequelize.INTEGER),
            defaultValue: []
        }
    }, {
        hooks: {
            async beforeCreate(meeti){
                const url = slug(meeti.titulo).toLowerCase();
                meeti.slug = `${url}-${shortid.generate()}`;
            }
        }
    }
);

Evento.belongsTo(Usuarios);
Evento.belongsTo(Grupos);

module.exports = Evento;