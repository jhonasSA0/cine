const path = require('path')
const express = require('express')
const router = express.Router()
const Pelicula = require('../modelos/Pelicula')
const Horario = require('../modelos/Horario')
const Butaca = require('../modelos/Butaca')
const utiles = require('../utiles')
const multer = require('multer')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/')
  },
  filename: function (req, file, cb) {
    const extension = file.mimetype.split('/').at(-1)
    cb(null, req.params.id + '.' + extension)
  }
})

function fileFilter(req, file, cb) {
  const filetypes = /jpeg|jpg|png|gif/
  const extname =  filetypes.test(path.extname(file.originalname).toLowerCase())
  const mimetype = filetypes.test(file.mimetype)
  if(mimetype && extname){
    return cb(null, true)
  } else {
    return cb('Solo se admiten imágenes', false)
  }
}

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10000000
  },
  fileFilter: fileFilter
}).single('imagen')

router.get('/', async (req, res) => {
  const datos = await Pelicula.paginate({}, {
    sort: {
      createdAt: -1
    },
    page: req.query.page || 1,
    limit: req.query.limit || 3
  })
  return res.status(200).json({
    error: false,
    mensaje: 'Lista de registros',
    datos: datos
  })
})

router.get('/:id', async (req, res) => {
  if (!utiles.idValido(req.params.id)) {
    return res.status(404).json({
      error: true,
      mensaje: 'Registro inexistente',
      datos: {}
    })
  }

  const pelicula = await Pelicula.findById(req.params.id)
  if (!pelicula) {
    return res.status(404).json({
      error: true,
      mensaje: 'Registro inexistente',
      datos: {}
    })
  } else {
    res.status(200).json({
      error: false,
      mensaje: 'Registro encontrado',
      datos: {
        pelicula: pelicula
      }
    })
  }
})

router.patch('/:id', async (req, res) => {
  if (!utiles.idValido(req.params.id)) {
    return res.status(404).json({
      error: true,
      mensaje: 'Registro inexistente',
      datos: {}
    })
  }

  const pelicula = await Pelicula.findOneAndUpdate({
    _id: req.params.id
  }, {
    nombre: req.body.nombre,
    detalle: req.body.detalle,
    codigo: req.body.codigo,
    trailer: req.body.trailer,
    horas: req.body.horas,
    minutos: req.body.minutos
  }, {
    new: true
  })
  if (!pelicula) {
    return res.status(404).json({
      error: true,
      mensaje: 'Registro inexistente',
      datos: {}
    })
  } else {
    res.status(200).json({
      error: false,
      mensaje: 'Registro actualizado',
      datos: {
        pelicula: pelicula
      }
    })
  }
})

router.post('/', async (req, res) => {
  try {
    const pelicula = new Pelicula()
    pelicula.nombre = req.body.nombre
    pelicula.codigo = req.body.codigo
    pelicula.detalle = req.body.detalle
    pelicula.trailer = req.body.trailer
    pelicula.horas = req.body.horas
    pelicula.minutos = req.body.minutos
    await pelicula.save()
    return res.status(200).json({
      error: false,
      mensaje: 'Registro almacenado',
      datos: {
        pelicula: pelicula
      }
    })
  } catch(error) {
    return utiles.errorBD(error, res)
  }
})

router.delete('/:id', async (req, res) => {
  if (!utiles.idValido(req.params.id)) {
    return res.status(404).json({
      error: true,
      mensaje: 'Registro inexistente',
      datos: {}
    })
  }

  const pelicula = await Pelicula.findOneAndDelete({
    _id: req.params.id
  })
  if (!pelicula) {
    return res.status(404).json({
      error: true,
      mensaje: 'Registro inexistente',
      datos: {}
    })
  } else {
    const horarios = await Horario.find({
      pelicula: pelicula._id
    })
    horarios.forEach(async (horario) => {
      await Butaca.deleteMany({
        horario: horario._id
      })
    })
    await Horario.deleteMany({
      pelicula: pelicula._id
    })
    res.status(200).json({
      error: false,
      mensaje: 'Registro eliminado',
      datos: {
        pelicula: pelicula
      }
    })
  }
})

router.post('/:id/imagen', async (req, res) => {
  upload(req, res, async function(err) {
    if (err instanceof multer.MulterError) {
      return res.status(422).json({
        error: true,
        mensaje: 'El tamaño máximo de archivo es de 10MB',
        datos: {}
      })
    } else if (err) {
      return res.status(422).json({
        error: true,
        mensaje: 'Formato de archivo inválido',
        datos: {}
      })
    } else if (!req.file) {
      return res.status(422).json({
        error: true,
        mensaje: 'El archivo de imagen es requerido',
        datos: {}
      })
    } else {
      if (!utiles.idValido(req.params.id)) {
        return res.status(404).json({
          error: true,
          mensaje: 'Registro inexistente',
          datos: {}
        })
      }

      const pelicula = await Pelicula.findOneAndUpdate({
        _id: req.params.id
      }, {
        imagen: req.file.filename
      }, {
        new: true
      })
      if (!pelicula) {
        return res.status(404).json({
          error: true,
          mensaje: 'Registro inexistente',
          datos: {}
        })
      } else {
        res.status(200).json({
          error: false,
          mensaje: 'Registro actualizado',
          datos: {
            pelicula: pelicula
          }
        })
      }
    }
  })
})

router.get('/:id/imagen', async (req, res) => {
  if (!utiles.idValido(req.params.id)) {
    return res.status(404).json({
      error: true,
      mensaje: 'Registro inexistente',
      datos: {}
    })
  }

  const pelicula = await Pelicula.findById(req.params.id)
  if (!pelicula) {
    return res.status(404).json({
      error: true,
      mensaje: 'Registro inexistente',
      datos: {}
    })
  } else {
    try {
      res.sendFile(path.resolve('uploads', pelicula.imagen))
    } catch(error) {
      return res.status(404).json({
        error: true,
        mensaje: 'Registro inexistente',
        datos: {}
      })
    }
  }
})

module.exports = router
