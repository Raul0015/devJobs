const { default: mongoose } = require('mongoose');
const passport = require('passport');
const Vacante = require('../models/vacantes');
const Usuarios = require('../models/usuarios')
const crypto = require('crypto');

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
    console.log(vacantes);
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

/** Formulario para Reiniciar el password */
exports.formReestablecerPassword = (req, res) => {
    res.render('reestablecer-password', {
        nombrePagina: 'Reestablecer tu Password',
        tagline: 'Si ya tienes una cuenta pero olvidaste tu password, coloca tu email'
    })
}

// Genera el Token en la tabla del usuario
exports.enviarToken = async (req, res) => {
    const usuario = await Usuarios.findOne({ email: req.body.email });

    if(!usuario) {
        req.flash('error', 'No existe esa cuenta');
        return res.redirect('/iniciar-sesion');
    }

    // el usuario existe, generar  token
    usuario.token = crypto.randomBytes(20).toString('hex');
    usuario.expira = Date.now() + 3600000;

    // Guardar el usuario
    await usuario.save();
    const resetUrl = `http://${req.headers.host}//reestablecer-password/${usuario.token}`;
    // console.log(resetUrl);
    req.flash('correcto', 'Revisa tu email para las indicaciones');
    res.redirect('/iniciar-sesion');

}