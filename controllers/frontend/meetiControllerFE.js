const Meeti = require('../../models/Eventos');
const Grupos = require('../../models/Grupos');
const Usuarios = require('../../models/Usuarios');
const Categorias = require('../../models/Categorias');
const Comentarios = require('../../models/Comentarios');
const moment = require('moment');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;



exports.mostrarMeeti = async (req, res ) => {
    const meeti = await Meeti.findOne({
        where: {
            slug: req.params.slug
        },
        include: [
            {
                model: Grupos
            },
            {
                model: Usuarios,
                attributes : ['id', 'nombre', 'imagen']
            }
        ]
    });

    // SINO EXISTE
    if(!meeti){
        res.redirect('/');
    }


    // Consultar por meeti's cercanos
    const ubicacion = Sequelize.literal(`ST_GeomFromText( 'POINT( ${meeti.ubicacion.coordinates[0]} ${meeti.ubicacion.coordinates[1]} )' )`);

    // ST_DISTANCE_Sphere = Retorna una linea en metros
    const distancia = Sequelize.fn('ST_Distance_Sphere', Sequelize.col('ubicacion'), ubicacion);

    const cercanos = await Meeti.findAll({
        order: distancia, // ORDENA DE MAS CERCANO A LEJANO
        where : Sequelize.where(distancia, { [Op.lte] : 2000}), // 2mil metros
        limit: 3,
        offset: 1,
        include: [
            {
                model: Grupos
            },
            {
                model: Usuarios,
                attributes : ['id', 'nombre', 'imagen']
            }
        ]

    })




    // CONSULTAR DDESPUES DE VERIFICAR QUE EXISTE EL MEETI
    const comentarios = await Comentarios.findAll({
        where: { meetiId: meeti.id},
        include : [
            {
                model: Usuarios,
                attributes: ['id', 'nombre', 'imagen']
            }
        ]
})






    // PASAR EL RESULTADO A LA VISTA
    res.render('mostrar-meeti', {
        nombrePagina: meeti.titulo,
        meeti,
        comentarios,
        cercanos,
        moment
    })
}


//CONFIRMAR O CANCELA SI EL USUARIO ASISTIR AL MEETI
exports.confirmarAsistencia = async(req, res) => {

    console.log(req.body);

    const {accion} = req.body;

    if(accion === 'confirmar'){
        // AGREGAR EL USUARIO
        
        Meeti.update(
            {'interesados' : Sequelize.fn('array_append', Sequelize.col('interesados'),
            req.user.id)},
            {'where' : {'slug' : req.params.slug}}
        );

            //MENSAJE
            res.send('has confirmado tu asistencia');

    } else {
        Meeti.update(
            {'interesados' : Sequelize.fn('array_remove', Sequelize.col('interesados'),
            req.user.id)},
            {'where' : {'slug' : req.params.slug}}
        );
    
            //MENSAJE
            res.send('has cancelado la asistencia');
    

    }
}


// muestra el listado de asistentes
exports.mostrarAsistentes = async (req, res) => {
    const meeti = await Meeti.findOne({
                                    where: { slug : req.params.slug },
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
        nombrePagina : 'Listado Asistentes Meeti',
        asistentes
    })
}


// MUESTRA LOS eventos AGRUPADOS A LA CATEGORIA 

exports.mostrarCategoria = async (req, res, next) => {
    const categoria = await Categorias.findOne({ 
                                    attributes: ['id', 'nombre'],
                                    where: { slug : req.params.categoria}
    });
    

    const meetis = await Meeti.findAll({
                                order: [
                                    ['fecha', 'ASC'],
                                    
                                ],
                                include: [
                                    {
                                        model:Grupos, 
                                        where: { categoriaId: categoria.id}
                                    },
                                    {
                                        model: Usuarios
                                    }
                                ]
    });


    res.render('categoria', {
        nombrePagina: `Categoria: ${categoria.nombre}`,
        meetis,
        moment
    })

    console.log(categoria.id);
}