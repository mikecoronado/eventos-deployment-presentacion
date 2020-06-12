const passport = require('passport');


exports.autenticarUsuario = passport.authenticate('local', {

    successRedirect: '/administracion',
    failureRedirect: '/iniciar-sesion',
    failureFlash: true,
    badRequestMessage: 'Ambos campos son obligatorios' 
    
});


//revisa si el usuario esta autenticado  o no
exports.usuarioAutenticado = (req, res,next) => {
    // si el usuario esta uatenticado, adelante
    if(req.isAuthenticated()){
        return next();
    }
    // SI NO ESTA AUTENTICADO
    return res.redirect('/iniciar-sesion');
}





// CERRAR SESION
exports.cerrarSesion = (req, res,next) => {
    req.logout();
    req.flash('correcto', 'Cerraste sesion correctamente');
    res.redirect('/iniciar-sesion');
    next();
}