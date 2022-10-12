import axios from 'axios'
import { useState, useEffect, useCallback } from 'react'
import { DataGrid, esES } from '@mui/x-data-grid'
import { Breadcrumbs, Container, Typography, Stack, IconButton, Button, Modal, Box, CardMedia, Paper, Link as LinkMui } from '@mui/material'
import { useNavigate, Link } from 'react-router-dom'
import { useAlertaContexto } from '../contextos/alerta'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import AddIcon from '@mui/icons-material/Add'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'

function Peliculas() {
  const navigate = useNavigate()
  const [paginacion, setPaginacion] = useState({
    cargando: false,
    docs: [],
    totalDocs: 0,
    page: 1,
    limit: 3
  })

  const { mostrarAlerta } = useAlertaContexto()
  const [registroSeleccionado, setRegistroSeleccionado] = useState(null)
  const [estadoModal, setEstadoModal] = useState(false)
  const abrirModal = () => setEstadoModal(true)
  const cerrarModal = () => {
    setEstadoModal(false)
    setRegistroSeleccionado(null)
  }

  const cargarDatos = useCallback(async () => {
    try {
      setPaginacion(p => ({ ...p, cargando: true }))
      const res = await axios.get('peliculas', {
        params: {
          page: paginacion.page,
          limit: paginacion.limit
        }
      })
      setPaginacion(p => ({ ...p, cargando: false, docs: res.datos.docs, totalDocs: res.datos.totalDocs }))
    } catch(error) {
      setPaginacion({
        cargando: false,
        docs: [],
        totalDocs: 0,
        page: 1,
        limit: 3
      })
    }
  }, [paginacion.page, paginacion.limit])

  async function eliminarRegistro() {
    try {
      const res = await axios.delete(`peliculas/${registroSeleccionado}`)
      mostrarAlerta(res.mensaje, 'success')
      cerrarModal()
      setPaginacion(pag => ({ ...pag, page: 1 }))
      cargarDatos()
      setRegistroSeleccionado(null)
    } catch(error) {
      mostrarAlerta(error.mensaje, 'error')
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [paginacion.page, paginacion.limit, cargarDatos])

  const columnas = [
    { field: 'nombre', headerName: 'Nombre', headerAlign: 'center', align: 'center', sortable: false, width: 250 },
    { field: 'detalle', headerName: 'Detalle', headerAlign: 'center', align: 'center', sortable: false, width: 270,
      renderCell: (params) => {
        return (
          <Box component="div" whiteSpace="normal">
            { params.formattedValue }
          </Box>
        )
      }
    },
    { field: 'codigo', headerName: 'Código', headerAlign: 'center', align: 'center', sortable: false, width: 100 },
    {
      field: 'trailer',
      headerName: 'Trailer',
      headerAlign: 'center',
      align: 'center',
      sortable: false,
      width: 100,
      renderCell: (params) => {
        return (
          <LinkMui href={ `https://www.youtube.com/embed/${params.formattedValue}` } underline="none" component="a" target="_blank" sx={{ rel: 'noopener noreferrer' }}>Ver trailer</LinkMui>
        )
      }
    }, {
      field: 'horas',
      headerName: 'Duración',
      headerAlign: 'center',
      align: 'center',
      sortable: false,
      width: 100,
      renderCell: (params) => {
        return (
          <Typography variant="body2" component="div" align="center">
            { params.row.horas }:{ String(params.row.minutos).padStart(2, '0') }
          </Typography>
        )
      }
    }, {
      field: 'imagen',
      headerName: 'Imagen',
      headerAlign: 'center',
      align: 'center',
      sortable: false,
      width: 150,
      renderCell: (params) => {
        return (
          <CardMedia
            component="img"
            height="200"
            image={`${axios.defaults.baseURL}peliculas/${params.id}/imagen`}
            alt="Sin imagen"
            sx={{ objectFit: "contain" }}
          />
        )
      }
    }, {
      field: 'accion',
      headerName: 'Acciones',
      headerAlign: 'center',
      align: 'center',
      sortable: false,
      flex: 1,
      renderCell: (params) => {
        const editar = (e) => {
          e.stopPropagation()
          navigate(`editar/${params.id}`)
        }
        const cartelera = (e) => {
          e.stopPropagation()
          navigate(`horarios/${params.id}`)
        }
        const eliminar = (e) => {
          e.stopPropagation()
          setRegistroSeleccionado(params.id)
          abrirModal()
        }

        return (
          <Stack direction="row" spacing={0}>
            <IconButton color="primary" onClick={ editar }>
              <EditIcon />
            </IconButton>
            <IconButton color="success" onClick={ cartelera }>
              <CalendarMonthIcon />
            </IconButton>
            <IconButton color="error" onClick={ eliminar }>
              <DeleteIcon />
            </IconButton>
          </Stack>
        )
      }
    },
  ]

  return (
    <Container>
      <Paper sx={{ pb: 2, px: 3 }}>

        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={0}
          sx={{ py: 2 }}
        >
          <Breadcrumbs>
            <Link to="" style={{
              textDecoration: 'none',
              color: 'black',
              fontSize: '1.25rem',
              fontWeight: 'bold'
            }}>
              Películas
            </Link>
          </Breadcrumbs>
          <Button variant="contained" color="primary" startIcon={<AddIcon />} component={ Link } to="editar/0">
            Nueva
          </Button>
        </Stack>
        <DataGrid
          rows={ paginacion.docs }
          rowHeight={ 250 }
          rowCount={ paginacion.totalDocs }
          loading={ paginacion.cargando }
          rowsPerPageOptions={ [3, 6, 9] }
          pagination
          page={ paginacion.page - 1 }
          pageSize={ paginacion.limit || 2 }
          paginationMode="server"
          onPageChange={ (dato) => setPaginacion(pag => ({ ...pag, page: dato + 1 })) }
          onPageSizeChange={ (dato) => setPaginacion(pag => ({ ...pag, limit: dato })) }
          columns={ columnas }
          getRowId={ row => row._id }
          autoHeight
          disableSelectionOnClick
          disableColumnMenu
          localeText={ esES.components.MuiDataGrid.defaultProps.localeText }
          sx={{
            boxShadow: 2,
            border: 0,
            borderColor: 'secondary.light',
            '& .MuiDataGrid-columnHeader, .MuiDataGrid-cell': {
              border: '1px solid #dedede',
            },
            '& .MuiDataGrid-columnsContainer, .MuiDataGrid-cell': {
              border: '1px solid #dedede',
            },
            '& .MuiDataGrid-cell': {
              color: 'rgba(0,0,0,.85)'
            },
            '& .MuiDataGrid-cell:focus-within, & .MuiDataGrid-cell:focus': {
              outline: 'none'
            },
            '& .MuiDataGrid-columnHeader:focus-within, & .MuiDataGrid-columnHeader:focus': {
              outline: 'none'
            },
            '& .MuiDataGrid-root .MuiDataGrid-cell': {
              whiteSpace: 'normal !important',
              wordWrap: 'break-word !important'
            }
          }}
        />
      </Paper>
      <Modal
        open={ estadoModal }
        onClose={ cerrarModal }
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 3,
        }}>
          <Typography gutterBottom variant="h6" component="div" align="center">
            ¿Seguro que desea eliminar el registro?
          </Typography>
          <Stack
            direction="row"
            justifyContent="flex-end"
            alignItems="center"
            spacing={2}
          >
            <Button variant="contained" color="error" onClick={ cerrarModal }>No</Button>
            <Button variant="contained" color="success" onClick={ eliminarRegistro }>Si</Button>
          </Stack>
        </Box>
      </Modal>
    </Container>
  )
}

export default Peliculas
