const Vacante = require('../models/vacantes');
const {body, validationResult} = require('express-validator');



exports.formularioNuevaVacante = (req, res) => {
    res.render('nueva-vacante', {
        nombrePagina: 'Nueva Vacante',
        tagline: 'Llena el formulario y publica tu vacante',
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen
    })
}

// Agregar las vacantes a las bases de datos 
exports.agregarVacante = async (req, res) => {
    const vacante = new Vacante(req.body);

    // Usuario autor de la vacante
    vacante.autor = req.user._id;

    //Crear arreglo de habilidades
    vacante.skills = req.body.skills.split(',');

    // Almacenarlo en la base de datos 
    const nuevaVacante = await vacante.save()

    //Redireccionar 
    res.redirect(`/vacantes/${nuevaVacante.url}`)
}

//Muestra uan vacante
exports.mostrarVacante = async (req, res, next) => {
    const vacante = await Vacante.findOne({url: req.params.url}).populate('autor');

    // si no hay resultados
    if(!vacante){
        return next();
    }

    res.render('vacante', {
        vacante,
        nombrePagina: vacante.titulo,
        barra: true
    })
}

exports.formEditarVacante = async (req, res, next) => {
    const vacante = await Vacante.findOne({url: req.params.url});

    if(!vacante){
        return next();
    }

    res.render('editar-vacante', {
        vacante,
        nombrePagina: `Editar Vacante: ${vacante.titulo}`,
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen
    })
}

exports.editarVacante = async (req, res) => {
    const vacanteActualizada = req.body;

    vacanteActualizada.skills = req.body.skills.split(',');

    const vacante = await Vacante.findOneAndUpdate({url: req.params.url}, vacanteActualizada, {
        new: true,
        runValidators: true
    });
    res.redirect(`/vacantes/${vacante.url}`);

}

// Validar y sanitizar los campos de las nuevas vacantes
exports.validarVacante = async (req, res, next) => {

    const rules = [
        body('titulo').not().isEmpty().withMessage('Agregar un Titulo de la Vacante').escape(),
        body('empresa').not().isEmpty().withMessage('Agregar una Empresa').escape(),
        body('ubicacion').not().isEmpty().withMessage('Agregar una Ubicación').escape(),
        body('contrato').not().isEmpty().withMessage('Agregar un Tipo de Contrato').escape(),
        body('skills').not().isEmpty().withMessage('Selecciona al menos una habilidad').escape()
    ];

    await Promise.all(rules.map(validation => validation.run(req)));
    const errores = validationResult(req);

    if (!errores.isEmpty()) {
        req.flash('error', errores.array().map(error => error.msg));
        res.render('nueva-vacante', {
            nombrePagina: 'Nueva Vacante',
            tagline: 'Llena el formulario y publica tu vacante',
            cerrarSesion: true,
            nombre: req.user.nombre,
            mensajes: req.flash()
        })
        return;
    }

    next();
}

exports.eliminarVacante = async (req, res) => {
    const {id} = req.params;

    const vacante = await Vacante.findById(id);

    if (verificarAutor(vacante, req.user)){
        // Todo bien, si es el usuario, eliminar
        vacante.remove();
        res.status(200).send('Vacante Eliminada Correctamente');
    }
    else{ //No permitido
        res.status(403).send('Error');
    }

    
}

const verificarAutor = (vacante = {}, usuario = {}) => {
    if(!vacante.autor.equals(usuario._id)){
        return false
    }
    return true;
}