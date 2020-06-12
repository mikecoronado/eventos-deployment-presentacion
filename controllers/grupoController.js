const Categorias = require('../models/Categorias');
const Grupos = require('../models/Grupos');
const { check, validationResult} = require('express-validator');
const multer = require('multer');
const shortid = require('shortid');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');




const configuracionMulter = {
    limits : { fileSize : 1000000 },
    storage: fileStorage = multer.diskStorage({
        destination: (req, file, next) => {
            next(null, __dirname+'/../public/uploads/grupos/');
        },
        filename : (req, file, next) => {
            const extension = file.mimetype.split('/')[1];
            next(null, `${shortid.generate()}.${extension}`);
        }
    })
}

const upload = multer(configuracionMulter).single('imagen');

exports.subirImagen = (req, res, next) => {
    upload(req, res, function(error) {
        if(error) {
            if(error instanceof multer.MulterError) {
                if(error.code === 'LIMIT_FILE_SIZE') {
                    req.flash('error', 'El Archivo es muy grande')
                } else {
                    req.flash('error', error.message);
                }
            } else if(error.hasOwnProperty('message')) {
                req.flash('error', error.message);
            }
            res.redirect('back');
            return;
        } else {
            next();
        }
    })
}







exports.formNuevoGrupo = async(req, res) => {
    const categorias = await Categorias.findAll();

    res.render('nuevo-grupo', {
        nombrePagina: 'Crea un nuevo grupo',
        categorias
    })
}


// Almacena los grupos en la BD
exports.crearGrupo = async (req, res) => {
 
    const rules = [
        check('nombre').not().isEmpty().withMessage('El nombre es obligatorio'),
        check('descripcion').not().isEmpty().withMessage('La descripcion es obligaatoria ')
       ];
 
    await Promise.all(rules.map(validation => validation.run(req)));
    const errores = validationResult(req);

    const grupo = req.body;

    //almacena el usuario autenticado como el creador del grupo
    grupo.usuarioId = req.user.id;
    grupo.categoriaId = req.body.categoria;

    if(req.file) {
        grupo.imagen = req.file.filename;
    }

    grupo.id = uuidv4();

    try {
        await Grupos.create(grupo);
        req.flash('exito', 'Se ha creado correctamente');
        res.redirect('/administracion');
    } catch (error) {
        erroresSequelize = error.errors.map(err => err.message);
        req.flash('error', erroresSequelize);
        res.redirect('/nuevo-grupo');
        
    }
}



exports.formEditarGrupo = async (req,res) => {
    const consultas = [];
    consultas.push( Grupos.findByPk(req.params.grupoId));
    consultas.push( Categorias.findAll());


    // PROMISE CON AWAIT
    const [grupo, categorias] = await Promise.all(consultas);

    res.render('editar-grupo', {
        nombrePagina: `Editar Grupo : ${grupo.nombre}`,
        grupo,
        categorias
    })
}



// guarda los cambios en la BD
exports.editarGrupo = async (req, res, next) => {
    const grupo = await Grupos.findOne({ where : { id : req.params.grupoId, usuarioId : req.user.id }});

    // si no existe ese grupo o no es el dueño
    if(!grupo) {
        req.flash('error', 'Operación no válida');
        res.redirect('/administracion');
        return next();
    }

    // todo bien, leer los valores
    const { nombre, descripcion, categoriaId, url } = req.body;

    // asignar los valores
    grupo.nombre =  nombre;
    grupo.descripcion = descripcion;
    grupo.categoriaId = categoriaId;
    grupo.url = url;

    // guardamos en la base de datos
    await grupo.save();
    req.flash('exito', 'Cambios Almacenados Correctamente');
    res.redirect('/administracion');

}




// MUESTRA EL FORMULARIO PARA EDITAR LA IMAGEN
exports.formEditarImagen = async (req, res) => {
    const grupo = await Grupos.findOne({ where : { id : req.params.grupoId, usuarioId : req.user.id }});


    res.render('imagen-grupo', {
        nombrePagina: `Editar imagen Grupo : ${grupo.nombre}`,
        grupo
    })
}


// modificar la imagen en la base de datos y eliminar la anterior
exports.editarImagen = async (req, res, next) => {

    const grupo = await Grupos.findOne({ where : { id : req.params.grupoId, usuarioId : req.user.id }});

    //si el grupo no existe
    if(!grupo){
        req.flash('error', 'Operacion no valida');
        res.redirect('/iniciar-sesion');
        return next();
    }


    // //verificar que el archivo sea nuevo
    // if(req.file) {
    //     console.log(req.file.filename);

    // }

    // //revisar que exista un archivo anterior
    // if(grupo.imagen){
    //     console.log(grupo.imagen);
    // }

    if(req.file && grupo.imagen) {
        const imagenAnterior = __dirname + `/../public/uploads/grupos/${grupo.imagen}`;

        // ELIMINAR ARCHIVO CON FILESYSTEM 

        fs.unlink(imagenAnterior, (error ) => {
            if(error){
                console.log(error);
            }
            return;
        })
    }

    if(req.file){
        grupo.imagen = req.file.filename;
    }


    //GUARDAR EN LA BASE DE DATOS
    await grupo.save();
    req.flash('exito', 'Cambios Almacenados Correctamente');
    res.redirect('/administracion');
}




// MUESTRA EL FORMULARIO DE ELIMINAR GRUPO

exports.formEliminarGrupo = async( req, res, next) => {
    const grupo = await Grupos.findOne({ where : {id : req.params.grupoId, 
                                                     usuarioId: req.user.id}});

    if(!grupo){
        req.flash('error', 'operacion no valida');
        res.redirect('/administracion');
        return next();
    }

    res.render('eliminar-grupo', {
        nombrePagina: `Eliminar grupo : ${grupo.nombre}`
    })
}


//ELIMINAR GRUPO E IMAGEN

exports. eliminarGrupo= async(req,res, next) => {
    const grupo = await Grupos.findOne({where: {id: req.params.grupoId, usuarioId: req.user.id}});

    if(!grupo){
        req.flash('error', 'operacion no valida');
        res.redirect('/administracion');
        return next();
    }

    // SI HAY UNA IMAGEN, ELIMINAR !!! 
    if(grupo.imagen){
        const imagenAnterior = __dirname + `/../public/uploads/grupos/${grupo.imagen}`;

        // ELIMINAR ARCHIVO CON FILESYSTEM 

        fs.unlink(imagenAnterior, (error ) => {
            if(error){
                console.log(error);
            }
            return;
        });
    }

    //ELIMINAR
    await Grupos.destroy({
        where: {
            id: req.params.grupoId
        }
    });


    // Redireccionar al usuario
    req.flash('exito', 'Grupo Eliminado');
    res.redirect('/administracion');
}