const jwt = require('jsonwebtoken')
const express = require('express')
const router = express.Router()
const Usuario = require('../modelos/Usuario')

router.get('/', async (req, res, next) => {
  const usuario = await Usuario.findById(req.usuario._id)
  return res.status(200).json({
    error: false,
    mensaje: 'Usuario actual',
    datos: {
      usuario: usuario
    }
  })
})

router.post('/', async (req, res) => {
  Usuario.findOne({
    usuario: req.body.usuario
  }).select('+clave').exec(function(error, usuario) {
    if (error) {
      return res.status(500).json({
        error: true,
        mensaje: 'Error de conexión con la base de datos',
        datos: {}
      })
    } else if (!usuario) {
      return res.status(404).json({
        error: true,
        mensaje: 'Credenciales inválidas',
        datos: {
          usuario: 'Usuario inexistente'
        }
      })
    } else {
      usuario.verificarClave(req.body.clave, function(errorVerificacion, verificado) {
        if (errorVerificacion) {
          return res.status(500).json({
            error: true,
            mensaje: 'Error de conexión con la base de datos',
            datos: {}
          })
        } else if (!verificado) {
          return res.status(403).json({
            error: true,
            mensaje: 'Credenciales inválidas',
            datos: {
              clave: 'Contraseña incorrecta'
            }
          })
        } else {
          usuario.clave = undefined
          return res.status(200).json({
            error: false,
            mensaje: 'Ingreso correcto',
            datos: {
              usuario: usuario.usuario,
              rol: usuario.rol,
              token: jwt.sign({
                _id: usuario._id,
                usuario: usuario.usuario,
                rol: usuario.rol
              }, process.env.TOKEN_LLAVE, {
                expiresIn: process.env.TOKEN_EXPIRACION
              })
            }
          })
        }
      })
    }
  })
})

module.exports = router