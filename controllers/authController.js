const passport = require('passport');
const Vacante = require('../models/vacantes');

exports.autenticarUsuario =passport.authenticate('local', {
    successRedirect: '/administracion',
    failureRedirect: '/iniciar-sesion',
    failureFlash: true,
    badRequestMessage: 'Ambos Campos son Obligatorios'
})

// raulsilgon
// hola

// Revisar si el usuario esta autenticado o no
exports.verificarUsuario = (req, res, next) => {
    // Resivar el usuarioi
    if(req.isAuthenticated()){
        return next();
    }
    else{
        res.redirect('/iniciar-sesion');
    }
}

exports.mostrarPanel = async (req, res) => {

    // Consultar el usuario autrnticado
    const vacantes = await  Vacante.find({ autor: req.user._id});

    res.render('administracion', {
        nombrePagina: 'Panel de Administración',
        tagline: 'Crea y Administra tu vacantes desde aquí',
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen,
        vacantes
    })
}

exports.cerrarSesion = (req, res, next) => {
    req.logout(function(err){
        if(err) {
            return next(err);
        }
        req.flash('correcto', 'Cerraste Sesion Correctamente');
        return res.redirect('/iniciar-sesion')
    });

    
}