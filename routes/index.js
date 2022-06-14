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

// Resetear password (emails)
ruta.get('/reestablecer-password', authController.formReestablecerPassword);
ruta.post('/reestablecer-password', authController.enviarToken);

// Resetear Password ( Almacenar en la BD )
ruta.get('/reestablecer-password/:token', authController.reestablecerPassword);
ruta.post('/reestablecer-password/:token', authController.guardarPassword);

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

// Recibir Mensajes de Candidatos
ruta.post('/vacantes/:url', 
    vacantesController.subirCV,
    vacantesController.contactar,
)

// Muestra los candidatos por vacante
ruta.get('/candidatos/:id',
    authController.verificarUsuario,
    vacantesController.mostrarCandidatos
)

// Buscador de Vacantes
ruta.post('/buscador', vacantesController.buscarVacantes);


module.exports = ruta