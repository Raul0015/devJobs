const { default: mongoose } = require('mongoose');
const passport = require('passport');
const Vacante = require('../models/vacantes');
const Usuarios = require('../models/usuarios')
const crypto = require('crypto');
const enviarEmail = require('../handlers/email');

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
    const resetUrl = `http://${req.headers.host}/reestablecer-password/${usuario.token}`;
    // console.log(resetUrl);

    // Enviar notificacion por email
    await enviarEmail.enviar({
        usuario,
        subject: 'Password Reset',
        resetUrl,
        archivo: 'reset'
    });

    // Todo Correcto
    req.flash('correcto', 'Revisa tu email para las indicaciones');
    res.redirect('/iniciar-sesion');

}

// Valida si el token es valido y el usuario existe, muestra la vista
exports.reestablecerPassword = async (req, res) => {
    const usuario = await Usuarios.findOne({
        token: req.params.token,
        expira: {
            $gt: Date.now()
        }
    });
    if(!usuario){
        req.flash('error', 'El formulario ya no es valido, intenta de nuevo');
        return res.redirect('/reestablecer-password');
    }

    // Mostrar el formulario
    res.render('nuevo-password', {
        nombrePagina: 'Nuevo Password'
    })
}

// Almacenar el nuevo password en la BD
exports.guardarPassword = async (req, res) => {
    const usuario = await Usuarios.findOne({
        token: req.params.token,
        expira: {
            $gt: Date.now()
        }
    });

    // No existe el usuario o  el token es invalido
    if(!usuario){
        req.flash('error', 'El formulario ya no es valido, intenta de nuevo');
        return res.redirect('/reestablecer-password');
    }

    // Asignar nuevo password, limpiar valores previos
    usuario.password = req.body.password;
    usuario.token = undefined;
    usuario.expira = undefined;

    // agregar y eliminar valores del objeto
    await usuario.save();

    // redirigir
    req.flash('correcto', 'Password Modicado Correctamente');
    res.redirect('/iniciar-sesion');
}
