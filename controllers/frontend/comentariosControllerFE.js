const Comentarios = require('../../models/Comentarios');
const Meeti = require('../../models/Eventos');


exports.agregarComentario = async ( req, res, next) => {

    // OBTENER EL COMENTARIO
    const {comentario} = req.body;


    //crear comentario en la base de datos
    await Comentarios.create({
        mensaje: comentario,
        usuarioId: req.user.id,
        meetiId: req.params.id
    });


    //redireccionar
    res.redirect('back');
    next();
}




//ELIMINA UN COMENTARIO DE BASE DE DATOS

exports.eliminarComentario = async ( req, res, next) => {

   // TOMAR EL ID DEL COMENTARIo
    const {comentarioId} = req.body;

   // CONSULTAR EL COMENTARIO
    const comentario = await Comentarios.findOne({ where: { id: comentarioId}});



   // VERIFICAR SI EXISTE EL COMENTARIO
    if(!comentario){
        res.status(404).send('Accion no valida');
        return   next();
    }

        //consultar el meeti del comentario
        const meeti = await Meeti.findOne({ where: { id: comentario.meetiId}});
    


   // VERIFICAR QUE QUIEN LO BORRRA SEA EL CREADOR
    if(comentario.usuarioId === req.user.id || meeti.usuarioId === req.user.id) {
        await Comentarios.destroy({
            where:{
                id: comentarioId
            }
        });
        res.status(200).send('eliminado  Correctamente');
        return next();
    } else {
        res.status(403).send('Accion no valida');
        return next();
    }
}