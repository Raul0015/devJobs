const Vacante = require('../models/vacantes');

exports.mostrarTrabajos = async (req, res, next) => {

    const vacantes = await Vacante.find();

    if(!vacantes){
        return next();
    }

    res.render('home', {
        nombrePagina: 'devJobs',
        tagline: 'Encuentra y Pública Trabajos para Desarrolladores Web',
        barra: true,
        boton: true,
        vacantes
    })
}