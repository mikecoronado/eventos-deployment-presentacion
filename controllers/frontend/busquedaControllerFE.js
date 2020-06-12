const Meeti = require('../../models/Eventos');
const Usuarios = require('../../models/Usuarios');
const Grupos = require('../../models/Grupos');

const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const moment = require('moment');

exports.resultadosBusqueda = async (req, res) => {


    // LEEER DATOS DE LA URL 
    const { categoria, titulo, ciudad, pais} = req.query;


    // si la categoria esta vacia 
    let query; 
    if(categoria === ''){
        query = '';
    } else {
        query = `where: {
            categoriaId : { [Op.eq] : ${categoria} }, 
        }`
    }


    // consultar eventos
    const meetis = await Meeti.findAll({
        where:{
            titulo: { [Op.iLike] : '%'+ titulo  + '%'},
            ciudad: { [Op.iLike] : '%'+ ciudad  + '%'},
            pais: { [Op.iLike] : '%'+ pais  + '%'},
        },
        include: [
            {
                model: Grupos,
                query
            },
            {
                model: Usuarios,
                attributes : ['id', 'nombre', 'imagen']
            }
        ]
    });

    // pasar los resultados a la vista
    res.render('busqueda', {
        nombrePagina: 'Resultados Busqueda',
        meetis,
        moment
    })

}