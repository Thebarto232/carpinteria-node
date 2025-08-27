/**
 * Rutas de Usuarios
 * Define todas las rutas para la gestión CRUD de usuarios
 */

import express from "express";
import { UsuarioController } from "../controllers/UsuarioController.js";
import { verificarToken } from "../middlewares/auth/tokenMiddleware.js";
import { 
  requierePermiso, 
  permisoOPropioDatos
} from "../middlewares/auth/authMiddleware.js";
import { validarRegistro } from "../middlewares/validaciones/authValidaciones.js";

const router = express.Router();

/**
 * @route GET /api/usuarios/estadisticas
 * @desc Obtener estadísticas de usuarios
 * @access Privado (requiere permiso leer_usuarios)
 */
router.get('/estadisticas', verificarToken, requierePermiso('leer_usuarios'), UsuarioController.obtenerEstadisticas);

/**
 * @route GET /api/usuarios/buscar
 * @desc Buscar usuarios por término
 * @access Privado (requiere permiso leer_usuarios)
 */
router.get('/buscar', verificarToken, requierePermiso('leer_usuarios'), UsuarioController.buscarUsuarios);

/**
 * @route GET /api/usuarios/mi-perfil
 * @desc Obtener perfil del usuario autenticado
 * @access Privado (usuario autenticado)
 */
router.get('/mi-perfil', verificarToken, UsuarioController.obtenerMiPerfil);

/**
 * @route PUT /api/usuarios/mi-perfil
 * @desc Actualizar perfil del usuario autenticado
 * @access Privado (usuario autenticado)
 */
router.put('/mi-perfil', verificarToken, UsuarioController.actualizarMiPerfil);

/**
 * @route GET /api/usuarios
 * @desc Obtener todos los usuarios con paginación
 * @access Privado (requiere permiso leer_usuarios)
 * @query {number} [pagina=1] - Número de página
 * @query {number} [limite=10] - Registros por página
 * @query {string} [busqueda] - Término de búsqueda
 */
router.get('/', verificarToken, requierePermiso('leer_usuarios'), UsuarioController.obtenerUsuarios);

/**
 * @route POST /api/usuarios
 * @desc Crear un nuevo usuario
 * @access Privado (requiere permiso crear_usuarios)
 * @body {string} nombre_usuario - Nombre completo del usuario
 * @body {string} correo - Correo electrónico del usuario
 * @body {string} contraseña - Contraseña del usuario
 * @body {string} [telefono] - Teléfono del usuario (opcional)
 * @body {number} [id_rol] - ID del rol a asignar (opcional, por defecto 2)
 */
router.post('/', verificarToken, requierePermiso('crear_usuarios'), validarRegistro, UsuarioController.crearUsuario);

/**
 * @route GET /api/usuarios/:id
 * @desc Obtener un usuario por ID
 * @access Privado (permiso leer_usuarios o propios datos)
 * @param {number} id - ID del usuario
 */
router.get('/:id', verificarToken, permisoOPropioDatos('leer_usuarios'), UsuarioController.obtenerUsuarioPorId);

/**
 * @route PUT /api/usuarios/:id
 * @desc Actualizar un usuario por ID
 * @access Privado (permiso actualizar_usuarios o propios datos)
 * @param {number} id - ID del usuario
 * @body {string} [nombre_usuario] - Nombre completo del usuario
 * @body {string} [telefono] - Teléfono del usuario
 * @body {number} [id_rol] - ID del rol (solo administradores)
 */
router.put('/:id', verificarToken, permisoOPropioDatos('actualizar_usuarios'), UsuarioController.actualizarUsuario);

/**
 * @route PATCH /api/usuarios/:id/estado
 * @desc Cambiar el estado de un usuario
 * @access Privado (requiere permiso actualizar_usuarios)
 * @param {number} id - ID del usuario
 * @body {string} estado - Nuevo estado (ACTIVO, INACTIVO, PENDIENTE)
 */
router.patch('/:id/estado', verificarToken, requierePermiso('actualizar_usuarios'), UsuarioController.cambiarEstado);

/**
 * @route DELETE /api/usuarios/:id
 * @desc Eliminar un usuario (cambiar estado a INACTIVO)
 * @access Privado (requiere permiso eliminar_usuarios)
 * @param {number} id - ID del usuario
 */
router.delete('/:id', verificarToken, requierePermiso('eliminar_usuarios'), UsuarioController.eliminarUsuario);

export default router;
