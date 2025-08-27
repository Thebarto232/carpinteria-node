/**
 * Rutas de Permisos
 * Define rutas esenciales para consulta y verificación de permisos (SOLO LECTURA)
 * Los permisos son parte de la lógica del sistema y no deben modificarse desde la API
 */

import express from "express";
import { PermisoController } from "../controllers/PermisoController.js";
import { verificarToken } from "../middlewares/auth/tokenMiddleware.js";
import { requierePermiso } from "../middlewares/auth/authMiddleware.js";

const router = express.Router();

/**
 * @route GET /api/permisos
 * @desc Obtener todos los permisos agrupados por módulo
 * @access Privado (requiere permiso leer_permisos)
 * @use Para mostrar permisos disponibles al crear/editar roles
 */
router.get('/', verificarToken, requierePermiso('leer_permisos'), PermisoController.obtenerPermisos);

/**
 * @route GET /api/permisos/lista
 * @desc Obtener todos los permisos como lista plana
 * @access Privado (requiere permiso leer_permisos)
 * @use Para selecciones en formularios de roles
 */
router.get('/lista', verificarToken, requierePermiso('leer_permisos'), PermisoController.obtenerPermisosLista);

/**
 * @route GET /api/permisos/modulos
 * @desc Obtener todos los módulos únicos
 * @access Privado (requiere permiso leer_permisos)
 * @use Para organizar permisos por categorías
 */
router.get('/modulos', verificarToken, requierePermiso('leer_permisos'), PermisoController.obtenerModulos);

/**
 * @route GET /api/permisos/verificar/:nombrePermiso
 * @desc Verificar si el usuario autenticado tiene un permiso específico
 * @access Privado (usuario autenticado)
 * @param {string} nombrePermiso - Nombre del permiso a verificar
 * @use Para validaciones de permisos en el frontend
 */
router.get('/verificar/:nombrePermiso', verificarToken, PermisoController.verificarPermisoUsuario);

export default router;

