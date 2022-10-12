const express = require('express')
const router = express.Router()
const Pelicula = require('../modelos/Pelicula')
const Horario = require('../modelos/Horario')
const Sala = require('../modelos/Sala')
const Butaca = require('../modelos/Butaca')
const utiles = require('../utiles')
const moment = require('moment')

router.get('/', async (req, res) => {
  const datos = await Pelicula.find({}).sort({
    createdAt: -1
  })
  return res.status(200).json({
    error: false,
    mensaje: 'Lista de registros',
    datos: {
      peliculas: datos
    }
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
  let horarios = []
  if (!pelicula) {
    return res.status(404).json({
      error: true,
      mensaje: 'Registro inexistente',
      datos: {}
    })
  } else {
    if (req.query.hasOwnProperty('dias')) {
      horarios = await Horario.find({
        pelicula: req.params.id,
        $expr: {
          $gt: [
            '$butacasTotal',
            '$butacasVendidas'
          ]
        },
        horaInicio: {
          $gte: moment().toDate(),
          $lt: moment().endOf('day').add((req.query.dias), 'days').toDate()
        }
      }).populate('sala', 'nombre').sort({
        horaInicio: 1,
        sala: 1
      })
    } else {
      horarios = await Horario.paginate({
        pelicula: req.params.id
      }, {
        sort: {
          horaInicio: 1,
          sala: 1
        },
        populate: 'sala',
        page: req.query.page || 1,
        limit: req.query.limit || 10
      })
    }
    return res.status(200).json({
      error: false,
      mensaje: 'Lista de registros',
      datos: {
        pelicula: pelicula,
        horarios: horarios
      }
    })
  }
})

router.post('/', async (req, res) => {
  if (!utiles.idValido(req.body.pelicula)) {
    return res.status(404).json({
      error: true,
      mensaje: 'Registro inexistente',
      datos: {}
    })
  }

  const pelicula = await Pelicula.findById(req.body.pelicula)
  if (!pelicula) {
    return res.status(404).json({
      error: true,
      mensaje: 'Registro inexistente',
      datos: {}
    })
  } else {
    let fechaInicio = moment(req.body.fechaInicio).startOf('day')
    let fechaFin = moment(req.body.fechaFin).startOf('day')
    for (let fecha = fechaInicio; fecha.diff(fechaFin, 'days') <= 0; fecha.add(1, 'days')) {
      let hora = moment(req.body.hora)
      let horaInicio = fecha.clone().set({
        hour: hora.hours(),
        minute: hora.minute(),
        second : 0,
        millisecond : 0
      })
      let horaFin = horaInicio.clone().add(pelicula.horas, 'hours').add(pelicula.minutos, 'minutes')
      req.body.salas.forEach(async (idSala) => {
        const sala = await Sala.findById(idSala)
        if (sala) {
          try {
            const horario = await Horario.create({
              precio: req.body.precio,
              horaInicio: horaInicio,
              horaFin: horaFin,
              butacasTotal: sala.filas * sala.columnas,
              butacasVendidas: 0,
              pelicula: pelicula._id,
              sala: sala._id
            })
            await Pelicula.findByIdAndUpdate(req.body.pelicula, {
              $push: {
                horarios: horario
              }
            })
            await Sala.findByIdAndUpdate(idSala, {
              $push: {
                horarios: horario
              }
            })
          } catch(error) {
            console.log(error)
          }
        }
      })
    }
    return res.status(200).json({
      error: false,
      mensaje: 'Registros almacenados',
      datos: {}
    })
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

  const horario = await Horario.findOneAndDelete({
    _id: req.params.id
  })

  if (!horario) {
    return res.status(404).json({
      error: true,
      mensaje: 'Registro inexistente',
      datos: {}
    })
  } else {
    await Butaca.deleteMany({
      horario: horario._id
    })
    res.status(200).json({
      error: false,
      mensaje: 'Registro eliminado',
      datos: {
        horario: horario
      }
    })
  }
})

module.exports = router
