const Vacante = require('../models/vacantes');
const {body, validationResult} = require('express-validator');

const multer = require('multer');
const shortid = require('shortid');


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

//Muestra una vacante
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

// Subir archivos en PDF
exports.subirCV = (req, res, next) => {
    upload(req, res, function(error){
        if(error){
            if(error instanceof multer.MulterError){
                if(error.code === 'LIMIT_FILE_SIZE'){
                    req.flash('error', 'El archivo es muy grande: Max. 100kb');
                }
                else{
                    req.flash('error', error.message);
                }
            }
            else{
                req.flash('error', error.message);
            }
            res.redirect('back');
            return;
        }
        else{
            return next();
        }       
    });

}

// Opciones de Multer
const configuracionMulter = {
    limits: {fileSize: 100000},
    storage: fileStorage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, __dirname+'../../public/uploads/cv');
        },
        filename: (req, file, cb) => {
            const extension = file.mimetype.split('/')[1];
            cb(null, `${shortid.generate()}.${extension}`);
        }
    }),
    fileFilter(req, file, cb){
        if(file.mimetype === 'application/pdf' ){
            //El callback se ejecuta como true (cuando la imagen se acepta) o false
            cb(null, true);
        }
        else{
            cb(new Error('Formato No Válido'), false);
        }
    },
}

const upload = multer(configuracionMulter).single('cv');

// almacenar los candidatos en la BD
exports.contactar = async (req, res, next) => {
    const vacante = await Vacante.findOne({ url: req.params.url });
    // si no existe la vacante
    if ( !vacante ) return next();

    // todo bien, construir el nuevo objeto
    const nuevoCandidato = {
        nombre: req.body.nombre,
        email: req.body.email,
        cv: req.file.filename
    };
    
    // almacenar vacante
    vacante.candidatos.push(nuevoCandidato);
    await vacante.save();

    // mensaje flash y redireccion
    req.flash('correcto', 'Se envio tu Curriculum Correctamente');
    res.redirect('/');
}

exports.mostrarCandidatos = async (req, res, next) => {
    const vacante = await Vacante.findById(req.params.id);

    if( vacante.autor == req.user._id.toString() ){
        return next();
    }
    if(!vacante) return next();

    res.render('candidatos', {
        nombrePagina: `Candidatos Vacante - ${vacante.titulo}`,
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen,
        candidatos: vacante.candidatos
    })
}