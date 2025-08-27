/**
 * Rutas de Autenticación
 * Define todas las rutas relacionadas con autenticación: login, registro, tokens, etc.
 */

import express from "express";
import { AuthController } from "../controllers/AuthController.js";
import { verificarToken, verificarRefreshToken } from "../middlewares/auth/tokenMiddleware.js";
import { 
  validarLogin, 
  validarRegistro, 
  validarCambioContraseña,
  validarRefreshToken
} from "../middlewares/validaciones/authValidaciones.js";

const router = express.Router();

/**
 * @route POST /api/auth/login
 * @desc Iniciar sesión de usuario
 * @access Público
 * @body {string} correo - Correo electrónico del usuario
 * @body {string} contraseña - Contraseña del usuario
 */
router.post('/login', validarLogin, AuthController.login);

/**
 * @route POST /api/auth/registro
 * @desc Registrar un nuevo usuario
 * @access Público
 * @body {string} nombre_usuario - Nombre completo del usuario
 * @body {string} correo - Correo electrónico del usuario
 * @body {string} contraseña - Contraseña del usuario
 * @body {string} [telefono] - Teléfono del usuario (opcional)
 * @body {number} [id_rol] - ID del rol a asignar (opcional, por defecto 2)
 */
router.post('/registro', validarRegistro, AuthController.registro);

/**
 * @route POST /api/auth/refresh
 * @desc Renovar access token usando refresh token
 * @access Público
 * @body {string} refreshToken - Refresh token válido
 */
router.post('/refresh', validarRefreshToken, verificarRefreshToken, AuthController.renovarToken);

/**
 * @route GET /api/auth/perfil
 * @desc Obtener perfil del usuario autenticado
 * @access Privado (requiere token válido)
 */
router.get('/perfil', verificarToken, AuthController.obtenerPerfil);

/**
 * @route PUT /api/auth/cambiar-contraseña
 * @desc Cambiar contraseña del usuario autenticado
 * @access Privado (requiere token válido)
 * @body {string} contraseña_actual - Contraseña actual del usuario
 * @body {string} nueva_contraseña - Nueva contraseña del usuario
 */
router.put('/cambiar-contraseña', verificarToken, validarCambioContraseña, AuthController.cambiarContraseña);

/**
 * @route POST /api/auth/logout
 * @desc Cerrar sesión del usuario
 * @access Privado (requiere token válido)
 */
router.post('/logout', verificarToken, AuthController.logout);

/**
 * @route GET /api/auth/verificar
 * @desc Verificar si el token es válido
 * @access Privado (requiere token válido)
 */
router.get('/verificar', verificarToken, AuthController.verificarToken);

/**
 * @route POST /api/auth/validar-email
 * @desc Verificar si un email ya está registrado
 * @access Público
 * @body {string} correo - Correo electrónico a verificar
 */
router.post('/validar-email', AuthController.validarEmail);

export default router;
