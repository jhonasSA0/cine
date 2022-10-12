import axios from 'axios'
import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAlertaContexto } from '../contextos/alerta'
import { Breadcrumbs, Grid, Paper, Typography, TextField, Stack, Button, OutlinedInput } from '@mui/material'

function FormPelicula() {
  const navigate = useNavigate()
  const { mostrarAlerta } = useAlertaContexto()

  let { id } = useParams()
  const [ formulario, setFormulario] = useState({
    _id: null,
    nombre: null,
    codigo: null,
    horas: 2,
    minutos: 0,
    detalle: null,
    trailer: null,
    imagen: null
  })

  const [errores, setErrores] = useState({
    error: false,
    mensaje: '',
    datos: {}
  })

  async function subirImagen(id) {
    let imagefile = document.getElementsByName('imagen')[0]
    if (imagefile.files.length === 1) {
      const formData = new FormData()
      formData.append('imagen', imagefile.files[0])
      await axios.post(`peliculas/${id}/imagen`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    try {
      setErrores({
        error: false,
        mensaje: '',
        datos: {}
      })
      if (id === '0') {
        const res = await axios.post('peliculas', formulario)
        if (!res.error) {
          subirImagen(res.datos.pelicula._id)
        }
        mostrarAlerta(res.mensaje, 'success')
        navigate('/admin/peliculas')
      } else{
        const res = await axios.patch(`peliculas/${formulario._id}`, formulario)
        if (!res.error) {
          subirImagen(res.datos.pelicula._id)
        }
        mostrarAlerta(res.mensaje, 'success')
        navigate('/admin/peliculas')
      }
    } catch(error) {
      setErrores(error)
    }
  }

  const handleChange = (event) => {
    setFormulario({
      ...formulario,
      [event.target.name]: event.target.value
    })
  }

  useEffect(() => {
    if (id === '0') {
      setFormulario({
        _id: null,
        nombre: null,
        codigo: null,
        horas: 2,
        minutos: 0,
        detalle: null,
        trailer: null,
        imagen: null
      })
    } else {
      axios.get(`peliculas/${id}`).then(res => {
        setFormulario({ ...res.datos.pelicula, imagen: null})
      }).catch((error) => {
        navigate('peliculas')
      })
    }
  }, [id, navigate])

  return (
    <Grid container spacing={2} alignItems="center" justifyContent="center">
      <Grid item xs={12} sm={8} md={6} lg={4}>
        <Paper sx={{ pb: 2, px: 3 }}>
          <Breadcrumbs sx={{ py: 2 }}>
            <Link to="/admin/peliculas" style={{
              textDecoration: 'none',
              color: 'gray',
              fontSize: '1.25rem',
              fontWeight: 'normal'
            }}>
              Películas
            </Link>
            <Link to={ `` } style={{
              textDecoration: 'none',
              color: 'black',
              fontSize: '1.25rem',
              fontWeight: 'bold'
            }}>
              { id === '0' ? 'Nueva' : 'Editar' } Película
            </Link>
          </Breadcrumbs>
          { errores.error && (
            <Typography gutterBottom variant="body2" component="div" align="center" color="error" sx={{ mb: 2 }}>
              { errores.mensaje }
            </Typography>
          )}
          <form onSubmit={ handleSubmit }>
            <Grid container spacing={2} alignItems="center" justifyContent="center">
              <Grid item xs={12}>
                <TextField
                  error={ errores.datos.hasOwnProperty('nombre') }
                  name="nombre"
                  label="Nombre"
                  onChange={ handleChange }
                  helperText={ errores.datos.hasOwnProperty('nombre') ? errores.datos.nombre : '' }
                  fullWidth
                  required
                  value={ formulario.nombre || '' }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  error={ errores.datos.hasOwnProperty('codigo') }
                  name="codigo"
                  label="Código"
                  onChange={ handleChange }
                  helperText={ errores.datos.hasOwnProperty('codigo') ? errores.datos.codigo : '' }
                  fullWidth
                  required
                  value={ formulario.codigo || '' }
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  error={ errores.datos.hasOwnProperty('horas') }
                  name="horas"
                  label="Horas"
                  onChange={ handleChange }
                  helperText={ errores.datos.hasOwnProperty('horas') ? errores.datos.horas : '' }
                  fullWidth
                  type="number"
                  value={ formulario.horas || 1 }
                  required
                  InputProps={{
                    inputProps: {
                      min: 1,
                      max: 4
                    }
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  error={ errores.datos.hasOwnProperty('minutos') }
                  name="minutos"
                  label="Minutos"
                  onChange={ handleChange }
                  helperText={ errores.datos.hasOwnProperty('minutos') ? errores.datos.minutos : '' }
                  fullWidth
                  type="number"
                  value={ formulario.minutos || 0 }
                  required
                  InputProps={{
                    inputProps: {
                      min: 0,
                      max: 59
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  error={ errores.datos.hasOwnProperty('detalle') }
                  name="detalle"
                  label="Detalle"
                  onChange={ handleChange }
                  helperText={ errores.datos.hasOwnProperty('detalle') ? errores.datos.detalle : '' }
                  fullWidth
                  value={ formulario.detalle || '' }
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  error={ errores.datos.hasOwnProperty('trailer') }
                  name="trailer"
                  label="ID Trailer YouTube"
                  onChange={ handleChange }
                  helperText={ errores.datos.hasOwnProperty('trailer') ? errores.datos.trailer : '' }
                  fullWidth
                  value={ formulario.trailer || '' }
                />
              </Grid>
              <Grid item xs={12}>
                <OutlinedInput
                  error={ errores.datos.hasOwnProperty('imagen') }
                  name="imagen"
                  label="Imagen"
                  accept="image/*"
                  type="file"
                  fullWidth
                  required={ id === '0' }
                />
              </Grid>
              <Grid item xs={12}>
                <Stack
                  direction="row"
                  justifyContent="flex-end"
                  alignItems="center"
                  spacing={2}
                >
                  <Button variant="contained" color="error" component={ Link } to="/admin/peliculas">Cancelar</Button>
                  <Button variant="contained" color="success" type="submit">Guardar</Button>
                </Stack>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Grid>
    </Grid>
  )
}

export default FormPelicula
