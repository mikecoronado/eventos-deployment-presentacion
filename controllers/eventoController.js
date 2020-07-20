const Grupos = require('../models/Grupos');
const Meeti = require('../models/Eventos');
const Usuarios = require('../models/Usuarios');

const { check, validationResult} = require('express-validator');
const { v4: uuidv4 } = require('uuid');


// Muestra el formulario para nuevos Eventos
exports.formNuevoMeeti = async (req, res) => {
    const grupos = await Grupos.findAll({ where : { usuarioId : req.user.id }});

    res.render('nuevo-meeti', {
        nombrePagina : 'Crear Nuevo Evento',
        grupos
    })
}


// INSERTAR NUEVOS Eventos EN LA BD
exports.crearEvento = async(req,res) => {
    // obtener los datos
     // obtener los datos
     const meeti = req.body;

     // asignar el usuario
     meeti.usuarioId = req.user.id;
     
     // almacena la ubicación con un point
     const point = { type : 'Point', coordinates : [ parseFloat(req.body.lat), parseFloat(req.body.lng) ] };
     meeti.ubicacion = point;
 
     // cupo opcional
     if(req.body.cupo === '') {
         meeti.cupo = 0;
     }
 
     meeti.id = uuidv4();
 
     // almacenar en la BD
     try {
         await Meeti.create(meeti);
         req.flash('exito', 'Se ha creado el Meeti Correctamente');
         res.redirect('/administracion');
     } catch (error) {
         // extraer el message de los errores
         const erroresSequelize = error.errors.map(err => err.message);
         req.flash('error', erroresSequelize);
         res.redirect('/nuevo-meeti');
     }
}



// sanitizar los eventos
exports.sanitizarEventos = (req, res, next) => {


    const rules = [
        check('titulo').not().isEmpty(),
        check('invitado').not().isEmpty(),
        check('cupo').not().isEmpty(),
        check('fecha').not().isEmpty(),
        check('hora').not().isEmpty(),
        check('direccion').not().isEmpty(),
        check('ciudad').not().isEmpty(),
        check('estado').not().isEmpty(),
        check('pais').not().isEmpty(),
        check('lat').not().isEmpty(),
        check('lng').not().isEmpty(),
        check('grupoId').not().isEmpty()
       ];

       next();
 
}

// muestra el formulario para editar un evento
exports.formEditarEvento = async (req, res, next) =>{

    const consultas = [];
    consultas.push( Grupos.findAll({where: {usuarioId: req.user.id}}));
    consultas.push(Meeti.findByPk(req.params.id));


    // return un promise
    const [grupos, meeti] = await Promise.all(consultas);

    if(!grupos || !meeti){
        req.flash('error', 'Operacion no valida');
        res.redirect('/administracion');
        return next();
    }


    // MOSTRAMOS VISTA
    res.render('editar-meeti',{
        nombrePagina: `Editar Evento : ${meeti.titulo}`,
        grupos,
        meeti
    })
}



// Almacena los cambios en elevento
exports.editarEvento = async( req,res,next) =>{
    const meeti = await Meeti.findOne({ where : { id: req.params.id, usuarioId : req.user.id }});

    if(!meeti) {
        req.flash('error', 'Operación no valida');
        res.redirect('/administracion');
        return next();
    }

    // asignar los valores
    const { grupoId, titulo, invitado, fecha, hora, cupo, descripcion, direccion, ciudad, estado, pais, lat, lng } = req.body; 

    meeti.grupoId = grupoId;
    meeti.titulo = titulo;
    meeti.invitado = invitado;
    meeti.fecha = fecha;
    meeti.hora = hora;
    meeti.cupo = cupo;
    meeti.descripcion = descripcion;
    meeti.direccion = direccion;
    meeti.ciudad = ciudad;
    meeti.estado = estado;
    meeti.pais = pais;

    // asignar point (ubicacion)
    const point = { type: 'Point', coordinates: [parseFloat(lat), parseFloat(lng)]};
    meeti.ubicacion = point;

    // almacenar en la BD
    await meeti.save();
    req.flash('exito', 'Cambios Guardados Correctamente');
    res.redirect('/administracion');

}



exports.formEliminarEvento = async(req, res ,next) => {
    const meeti = await Meeti.findOne({where: {id: req.params.id, usuarioId: req.user.id}});

    if(!meeti){
        req.flash('error', 'Operacion no valida');
        res.redirect('/administracion');
        return next();
    }

    res.render('eliminar-meeti', {
        nombrePagina: `Eliminar Evento: ${meeti.titulo}`
    })
}
 

// ELIMINAR EVENTO DE BASE DE DATOS
exports.eliminarEvento = async (req, res) => {
    const meeti = await Meeti.destroy({
        where:{
            id: req.params.id
        }
    });

    req.flash('exito', 'Evento eliminado con exito');
    res.redirect('/administracion');
}




// muestra el listado de asistentes
exports.mostrarAsistentes = async (req, res) => {
    const meeti = await Meeti.findOne({
                                    where: { id: req.params.slug },
                                    attributes: ['interesados']
    });

    // extraer interesados
    const { interesados } = meeti;

    const asistentes = await Usuarios.findAll({
        attributes: ['nombre', 'imagen'],
        where : { id : interesados }
    });

    // crear la vista y pasar datos
    res.render('asistentes-meeti', {
        nombrePagina : 'Listado Asistentes Eventos',
        asistentes
    })
}
