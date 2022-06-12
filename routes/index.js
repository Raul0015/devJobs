const express = require('express');
const ruta = express.Router();
const homeController = require('../controllers/homeController');
const vacantesController = require('../controllers/vacantesController');
const usuariosController = require('../controllers/usuariosController');
const authController = require('../controllers/authController');

ruta.get('/', homeController.mostrarTrabajos);

// Crear vacante
ruta.get('/vacantes/nueva', 
    authController.verificarUsuario,
    vacantesController.formularioNuevaVacante
);

ruta.post('/vacantes/nueva', 
    authController.verificarUsuario,
    vacantesController.validarVacante,
    vacantesController.agregarVacante
);

//Mostrar vacante
ruta.get('/vacantes/:url', vacantesController.mostrarVacante);

//Editar Vacante
ruta.get('/vacantes/editar/:url', 
    authController.verificarUsuario,
    vacantesController.formEditarVacante
);

ruta.post('/vacantes/editar/:url', 
    authController.verificarUsuario,
    vacantesController.validarVacante,
    vacantesController.editarVacante
);

// ELiminar Vacantes
ruta.delete('/vacantes/eliminar/:id',
    vacantesController.eliminarVacante
)

// Crear Cuentas
ruta.get('/crear-cuenta', usuariosController.formCrearCuenta);
ruta.post('/crear-cuenta', 
    usuariosController.validarRegistro,
    usuariosController.crearUsuario);

// Autenticar Usuarios
ruta.get('/iniciar-sesion', usuariosController.formIniciarSesion);
ruta.post('/iniciar-sesion', authController.autenticarUsuario);

// Cerrar sesion
ruta.get('/cerrar-sesion',
    authController.verificarUsuario,
    authController.cerrarSesion);

//Panel de administracion
ruta.get('/administracion', 
    authController.verificarUsuario,
    authController.mostrarPanel);

// Editar perfil
ruta.get('/editar-perfil', 
    authController.verificarUsuario,
    usuariosController.formEditarPerfil    
);

ruta.post('/editar-perfil',
    authController.verificarUsuario,
    // usuariosController.validarPerfil,
    usuariosController.subirImagen,
    usuariosController.editarPerfil
);

module.exports = ruta