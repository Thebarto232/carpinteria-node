/**
 * Rutas de Roles
 * Define todas las rutas para la gestión CRUD de roles
 */

import express from "express";
import { RolController } from "../controllers/RolController.js";
import { verificarToken } from "../middlewares/auth/tokenMiddleware.js";
import { requierePermiso } from "../middlewares/auth/authMiddleware.js";

const router = express.Router();

/**
 * @route GET /api/roles
 * @desc Obtener todos los roles
 * @access Privado (requiere permiso leer_roles)
 */
router.get('/', verificarToken, requierePermiso('leer_roles'), RolController.obtenerRoles);

/**
 * @route GET /api/roles/:id
 * @desc Obtener un rol por ID
 * @access Privado (requiere permiso leer_roles)
 * @param {number} id - ID del rol
 */
router.get('/:id', verificarToken, requierePermiso('leer_roles'), RolController.obtenerRolPorId);

/**
 * @route GET /api/roles/:id/permisos
 * @desc Obtener un rol con sus permisos
 * @access Privado (requiere permiso leer_roles)
 * @param {number} id - ID del rol
 */
router.get('/:id/permisos', verificarToken, requierePermiso('leer_roles'), RolController.obtenerRolConPermisos);

/**
 * @route POST /api/roles
 * @desc Crear un nuevo rol
 * @access Privado (requiere permiso crear_roles)
 * @body {string} nombre_rol - Nombre del rol
 * @body {string} descripcion - Descripción del rol
 */
router.post('/', verificarToken, requierePermiso('crear_roles'), RolController.crearRol);

/**
 * @route PUT /api/roles/:id
 * @desc Actualizar un rol por ID
 * @access Privado (requiere permiso actualizar_roles)
 * @param {number} id - ID del rol
 * @body {string} nombre_rol - Nombre del rol
 * @body {string} descripcion - Descripción del rol
 */
router.put('/:id', verificarToken, requierePermiso('actualizar_roles'), RolController.actualizarRol);

/**
 * @route DELETE /api/roles/:id
 * @desc Eliminar un rol
 * @access Privado (requiere permiso eliminar_roles)
 * @param {number} id - ID del rol
 */
router.delete('/:id', verificarToken, requierePermiso('eliminar_roles'), RolController.eliminarRol);

/**
 * @route POST /api/roles/:id/permisos
 * @desc Asignar permisos a un rol
 * @access Privado (requiere permiso actualizar_roles)
 * @param {number} id - ID del rol
 * @body {Array<number>} permisos - Array de IDs de permisos
 */
router.post('/:id/permisos', verificarToken, requierePermiso('actualizar_roles'), RolController.asignarPermisos);

/**
 * @route DELETE /api/roles/:id/permisos/:idPermiso
 * @desc Quitar un permiso específico de un rol
 * @access Privado (requiere permiso actualizar_roles)
 * @param {number} id - ID del rol
 * @param {number} idPermiso - ID del permiso a quitar
 */
router.delete('/:id/permisos/:idPermiso', verificarToken, requierePermiso('actualizar_roles'), RolController.quitarPermiso);

export default router;
