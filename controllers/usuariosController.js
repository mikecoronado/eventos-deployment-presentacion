const Usuarios = require('../models/Usuarios');
const enviarEmail = require('../handlers/emails');
const { check, validationResult} = require('express-validator');

const multer = require('multer');
const shortid = require('shortid');
const fs = require('fs');



const configuracionMulter = {
  limits : { fileSize : 100000 },
  storage: fileStorage = multer.diskStorage({
      destination: (req, file, next) => {
          next(null, __dirname+'/../public/uploads/perfiles/');
      },
      filename : (req, file, next) => {
          const extension = file.mimetype.split('/')[1];
          next(null, `${shortid.generate()}.${extension}`);
      }
  }), 
  fileFilter(req, file, next) {
      if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
          //el formato es valido
          next(null, true);
      } else {
          // el formato no es valido
          next(new Error('Formato no válido'), false);
      }
  }
}

const upload = multer(configuracionMulter).single('imagen');

// sube imagen en el servidor
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

exports.formCrearCuenta = (req,res) => {
    res.render('crear-cuenta', {
        nombrePagina: 'Crea tu cuenta'
    })
}


exports.crearNuevaCuenta = async (req, res) => {
    const usuario = req.body;
 
    //**************Reglas y Sanityze****************
    const rules = [   
        check('nombre').not().isEmpty().withMessage('El nombre esObligatorio').escape(),
    
        check('email').isEmail().normalizeEmail().withMessage('El email valido').escape(),
        
        check('password').not().isEmpty().withMessage('Password no puede irvacío').escape(),
    
        check('confirmar').equals(usuario.password).withMessage('El password es diferente').escape(),
    ];
 
    //***********Ejecutar Validaciones Express***********
    await Promise.all(rules.map( validation => validation.run(req)));
    // Meter en "errores" los errores de Express-Validator
    const errExp = validationResult(req).array();
   
    
    try {



      await Usuarios.create(usuario);

        // Url de confirmación
        const url = `http://${req.headers.host}/confirmar-cuenta/${usuario.email}`;
  // Enviar email de confirmación
     await enviarEmail.enviarEmail({
        usuario,
        url,
        subject: 'Confirmar tu cuenta en meeti',
        archivo: 'confirmar-cuenta'
      });

    
      //flash meessage y redireccionar
      req.flash('exito', 'hemos enviado un Email, confirmar tu cuenta');
      res.redirect('/iniciar-sesion');


    } catch (error) {
      let erroresSequelize = [];
      if (error.name === "SequelizeUniqueConstraintError") {
        erroresSequelize.push("Ese email ya existe");
      } else {
        erroresSequelize = error.errors.map(err => err.message);
      }
   
      const erroresExpressValidator = errExp.map(err => err.msg);
   
      const listaErrores = [...erroresSequelize, ...erroresExpressValidator];
      console.log(erroresSequelize);
      req.flash("error", listaErrores);
      res.redirect("/crear-cuenta");
    }
  };



//Confirmar subcripcion del usuario
exports.confirmarCuenta = async (req,res,next) => {
  //verificar si el usaurio existe
  const usuario = await Usuarios.findOne({ where: {email : req.params.correo}});


  //sino existe, redireccionar

  if(!usuario){
    req.flash('error', 'No existe esa cuenta');
    res.redirect('/crear-cuenta');
    return next();
  }
  //si existe, cofirmar sub y redireccionar
  usuario.activo = 1;
  await usuario.save();
  req.flash('exito', 'La cuenta se confirmo, ya puede iniciar sesion');
  res.redirect('/iniciar-sesion');
}






// Formulario Iniciar_sesion
exports.formIniciarSesion = (req,res) => {
    res.render('iniciar-sesion', {
        nombrePagina:'Iniciar Sesion'
    });
}


// MUESTRA EL FORMULARIO PARA EDITAR EL PERFIL
exports.formEditarPerfil = async (req,res) => {

  const usuario= await Usuarios.findByPk(req.user.id);

  res.render('editar-perfil', {
    nombrePagina: 'Editar Perfil',
    usuario
  })

}



// EDITAR PERFIL EN LA BASE DE DATOS
exports.editarPerfil = async (req, res) => {

  const usuario = await Usuarios.findByPk(req.user.id);


  const rules = [   
    check('nombre').not().isEmpty(),

    check('email').isEmail().normalizeEmail(),
    
    check('descripcion').not().isEmpty()

];

  // leer datos del formulario
  const { nombre, descripcion, email} = req.body;

  usuario.nombre = nombre; 
  usuario.email = email;
  usuario.descripcion=  descripcion;

  // GUARDAR EN BASE DE DATOS

  await usuario.save();
  req.flash('exito', 'Cambios guardados correctamente');
  res.redirect('/administracion');

}


exports.formCambiarPassword = (req, res) => {
  res.render('cambiar-password', {
    nombrePagina: 'Cambiar Password'
  })

}

exports.cambiarPassword = async (req, res,next) =>{

  const usuario = await Usuarios.findByPk(req.user.id);

  // VERIFICAR EL PASSWORD ANTERIOR SEA CORRECTO
    if(!usuario.validarPassword(req.body.anterior)){
      req.flash('error', 'El password actual es incorrecto');
      res.redirect('/administracion');
      return next();
    }

   

  // SI EL PASSWORD ES CORRECTO, HASHEAR DENUEVO

  const hash = usuario.hashPassword(req.body.nuevo);

  //ASIGNAR EL PASSWORD al usuario

  usuario.password = hash;

  // GUARDAS PASSWORD EN BASE DE DATOS
    await usuario.save();

  // REDIRECCIONAR
    req.logout();
    req.flash('exito', 'Password modificado correctamente, vuelve a iniciar sesion');
    res.redirect('/iniciar-sesion');
}



// muestra el formulario para subir imagen de perfil 

exports.formSubirImagenPerfil = async(req,res) =>{

  const usuario = await Usuarios.findByPk(req.user.id);

  //mostrar la vista
  res.render('imagen-perfil', {
    nombrePagina: 'Editar Imagen perfil',
    usuario
  })
 }

// Guarda la imagen nueva, elimina la anterior ( si aplica ) y guarda el registro en la BD
exports.guardarImagenPerfil = async (req, res) => {
  const usuario = await Usuarios.findByPk(req.user.id);

  
  if(req.file && usuario.imagen) {
    const imagenAnterior = __dirname + `/../public/uploads/uploads/${usuario.imagen}`;

    // ELIMINAR ARCHIVO CON FILESYSTEM 

    fs.unlink(imagenAnterior, (error ) => {
        if(error){
            console.log(error);
        }
        return;
    })
}

if(req.file){
    usuario.imagen = req.file.filename;
}


//GUARDAR EN LA BASE DE DATOS
await usuario.save();
req.flash('exito', 'Cambios Almacenados Correctamente');
res.redirect('/administracion');
}
