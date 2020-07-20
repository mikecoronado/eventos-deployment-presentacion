const express = require('express');
const router = express.Router();

const homeController = require('../controllers/homeController');
const usuariosController = require('../controllers/usuariosController');
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');
const gruposController = require('../controllers/grupoController');
const meetiController = require('../controllers/eventoController');
const meetiControllerFE = require('../controllers/frontend/meetiControllerFE');
const usuariosControllerFE = require('../controllers/frontend/usuariosControllerFe');
const gruposControllerFE = require('../controllers/frontend/gruposControllerFE');
const comentariosControllerFE = require('../controllers/frontend/comentariosControllerFE');
const busquedaControllerFE = require('../controllers/frontend/busquedaControllerFE');


module.exports = function() {
// PAGINA PRINCIPAL
    router.get('/', homeController.home);

    router.get('/meeti/:slug',
        meetiControllerFE.mostrarMeeti
    );


    // CONFIRMAR ASISTENCIA AL EVENTO
    router.post('/confirmar-asistencia/:slug',
        meetiControllerFE.confirmarAsistencia
    );

    /** Muestra asistentes al meeti */
    router.get('/asistentes/:slug',
        meetiControllerFE.mostrarAsistentes
    );

    


    // AGREGAR COMENTARIOS A LOS EVENTOS
    router.post('/meeti/:id',
        comentariosControllerFE.agregarComentario
    );

    // ELIMINAR COMENTARIOS EN EL MEETI
    router.post('/eliminar-comentario',
        comentariosControllerFE.eliminarComentario
    );





    //MUESTRA PERFILES DE USUARIOS
    router.get('/usuarios/:id',
        usuariosControllerFE.mostrarUsuario
    );


    // muestra los grupos en el front end
    router.get('/grupos/:id', 
        gruposControllerFE.mostrarGrupo
    );

       // Muestra meeti's por categoria
       router.get('/categoria/:categoria',
       meetiControllerFE.mostrarCategoria
   );





    // AÑADE LA BUSQUEDA
    router.get('/busqueda',
         busquedaControllerFE.resultadosBusqueda
    );





    //CREAR Y CONFIRMAR CUENTA
    router.get('/crear-cuenta', usuariosController.formCrearCuenta);
    router.post('/crear-cuenta', usuariosController.crearNuevaCuenta);
    router.get('/confirmar-cuenta/:correo', usuariosController.confirmarCuenta);

    //INICIAR SESION
    router.get('/iniciar-sesion', usuariosController.formIniciarSesion);
    router.post('/iniciar-sesion', authController.autenticarUsuario); 


    router.get('/cerrar-sesion', 
        authController.usuarioAutenticado,
        authController.cerrarSesion
    );


    //PANEL DE ADMINISTRACION
    router.get('/administracion',
        authController.usuarioAutenticado,
        adminController.panelAdministracion
    );


    // NUEVOS GRUPOS
    router.get('/nuevo-grupo', 
        authController.usuarioAutenticado,
        gruposController.formNuevoGrupo
    );

    router.post('/nuevo-grupo',
        authController.usuarioAutenticado,
        gruposController.subirImagen, 
        gruposController.crearGrupo 
    );


    // EDITAR GRUPOS
    router.get('/editar-grupo/:grupoId',
        authController.usuarioAutenticado,
        gruposController.formEditarGrupo
    );

    router.post('/editar-grupo/:grupoId',
        authController.usuarioAutenticado,
        gruposController.editarGrupo
    );

    // Editar la imagen del grupo
    router.get('/imagen-grupo/:grupoId', 
        authController.usuarioAutenticado,
        gruposController.formEditarImagen
    );
    router.post('/imagen-grupo/:grupoId', 
        authController.usuarioAutenticado,
        gruposController.subirImagen,
        gruposController.editarImagen
    );


    // ELIMINAR GRUPOS 
    router.get('/eliminar-grupo/:grupoId',
        authController.usuarioAutenticado,
        gruposController.formEliminarGrupo
    );

    router.post('/eliminar-grupo/:grupoId',
        authController.usuarioAutenticado,
        gruposController.eliminarGrupo
    );


    // NUEVOS EVENTOS
    router.get('/nuevo-meeti', 
        authController.usuarioAutenticado,
        meetiController.formNuevoMeeti
    );

    // NUEVOS EVEntOS
    router.post('/nuevo-meeti',
    authController.usuarioAutenticado,
    meetiController.sanitizarEventos,
    meetiController.crearEvento
    );


    // EDITAR EVENTO
    router.get('/editar-meeti/:id',
        authController.usuarioAutenticado,
        meetiController.formEditarEvento
    );

    router.post('/editar-meeti/:id',
        authController.usuarioAutenticado,
         meetiController.editarEvento
    );


    router.get('/asistentes/:slug',
        authController.usuarioAutenticado,
         meetiController.mostrarAsistentes
    );

    // ELIMINAR EVENTO
    router.get('/eliminar-meeti/:id',
        authController.usuarioAutenticado,
        meetiController.formEliminarEvento
    );

    router.post('/eliminar-meeti/:id',
        authController.usuarioAutenticado,
        meetiController.eliminarEvento
    );

    // EDITAR INFORMACION DEL PERFIL
    router.get('/editar-perfil',
        authController.usuarioAutenticado,
        usuariosController.formEditarPerfil
    );

    router.post('/editar-perfil',
        authController.usuarioAutenticado,
        usuariosController.editarPerfil
    );

    // MODIFICAR PASSWORD
    router.get('/cambiar-password',
        authController.usuarioAutenticado,
        usuariosController.formCambiarPassword
    );
    router.post('/cambiar-password',
        authController.usuarioAutenticado,
        usuariosController.cambiarPassword
    );

    // IMAGENES DE PERFIL
    router.get('/imagen-perfil', 
        authController.usuarioAutenticado,
        usuariosController.formSubirImagenPerfil
    );
    router.post('/imagen-perfil', 
        authController.usuarioAutenticado,
        usuariosController.subirImagen,
        usuariosController.guardarImagenPerfil
    );


    
    

    return router;
};