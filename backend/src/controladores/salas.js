const express = require('express')
const router = express.Router()
const Sala = require('../modelos/Sala')
const Horario = require('../modelos/Horario')
const utiles = require('../utiles')

router.get('/', async (req, res) => {
  let datos = []

  if (Boolean((req.query.combo || '').replace(/\s*(false|null|undefined|0)\s*/i, ''))) {
    datos = await Sala.find({}).select({
      _id: 1,
      nombre: 1
    }).sort({
      nombre: 1
    })
  } else {
    datos = await Sala.paginate({}, {
      sort: {
        nombre: 1
      },
      page: req.query.page || 1,
      limit: req.query.limit || 10
    })
  }
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

  const sala = await Sala.findById(req.params.id)
  if (!sala) {
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
        sala: sala
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

  const sala = await Sala.findOneAndUpdate({
    _id: req.params.id
  }, req.body, {
    new: true
  })
  if (!sala) {
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
        sala: sala
      }
    })
  }
})

router.post('/', async (req, res) => {
  try {
    const sala = await Sala.create(req.body)
    return res.status(200).json({
      error: false,
      mensaje: 'Registro almacenado',
      datos: {
        sala: sala
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

  const sala = await Sala.findOneAndDelete({
    _id: req.params.id
  })
  if (!sala) {
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
      sala: sala._id
    })
    res.status(200).json({
      error: false,
      mensaje: 'Registro eliminado',
      datos: {
        sala: sala
      }
    })
  }
})

module.exports = router
