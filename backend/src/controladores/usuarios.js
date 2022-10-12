const express = require('express')
const router = express.Router()
const Usuario = require('../modelos/Usuario')
const utiles = require('../utiles')

router.get('/', async (req, res) => {
  const datos = await Usuario.paginate({
    _id: {
      $ne: req.usuario._id
    }
  }, {
    sort: {
      nombre: 1
    },
    page: req.query.page || 1,
    limit: req.query.limit || 10
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

  const usuario = await Usuario.findById(req.params.id)
  if (!usuario) {
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
        usuario: usuario
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

  const usuario = await Usuario.findOneAndUpdate({
    _id: req.params.id
  }, req.body, {
    new: true
  })
  if (!usuario) {
    return res.status(404).json({
      error: true,
      mensaje: 'Registro inexistente',
      datos: {}
    })
  } else {
    usuario.clave = undefined
    res.status(200).json({
      error: false,
      mensaje: 'Registro actualizado',
      datos: {
        usuario: usuario
      }
    })
  }
})

router.post('/', async (req, res) => {
  try {
    const usuario = await Usuario.create(req.body)
    usuario.clave = undefined
    return res.status(200).json({
      error: false,
      mensaje: 'Registro almacenado',
      datos: {
        usuario: usuario
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

  const usuario = await Usuario.findOneAndDelete({
    _id: req.params.id
  })
  if (!usuario) {
    return res.status(404).json({
      error: true,
      mensaje: 'Registro inexistente',
      datos: {}
    })
  } else {
    usuario.clave = undefined
    res.status(200).json({
      error: false,
      mensaje: 'Registro eliminado',
      datos: {
        usuario: usuario
      }
    })
  }
})

module.exports = router
