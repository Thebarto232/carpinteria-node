/**
 * Controlador de Autenticación
 * Maneja endpoints de login, registro, renovación de tokens y gestión de sesiones
 */

import { AuthService } from "../services/AuthService.js";
import { ResponseProvider } from "../providers/ResponseProvider.js";
import { Usuario } from "../models/Usuario.js";

export class AuthController {
  
  /**
   * Endpoint para iniciar sesión
   * POST /api/auth/login
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async login(req, res) {
    try {
      const { correo, contraseña } = req.body;

      // Realizar login
      const resultado = await AuthService.login(correo, contraseña);

      // Configurar cookie httpOnly para el refresh token (opcional)
      if (process.env.USE_REFRESH_COOKIE === 'true') {
        res.cookie('refreshToken', resultado.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: parseInt(process.env.REFRESH_EXPIRATION) * 1000 || 7 * 24 * 60 * 60 * 1000 // 7 días
        });
      }

      return ResponseProvider.success(res, {
        usuario: resultado.usuario,
        accessToken: resultado.accessToken,
        refreshToken: resultado.refreshToken
      }, 'Inicio de sesión exitoso');

    } catch (error) {
      console.error('Error en login:', error);
      
      if (error.message === 'Credenciales inválidas' || 
          error.message === 'Usuario inactivo o pendiente de activación') {
        return ResponseProvider.noAutorizado(res, error.message);
      }

      return ResponseProvider.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Endpoint para registrar un nuevo usuario
   * POST /api/auth/registro
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async registro(req, res) {
    try {
      const datosUsuario = req.body;

      // Registrar usuario
      const usuarioCreado = await AuthService.registrar(datosUsuario);

      return ResponseProvider.creado(res, usuarioCreado, 'Usuario registrado exitosamente');

    } catch (error) {
      console.error('Error en registro:', error);
      
      if (error.message.includes('ya está registrado') || 
          error.message.includes('ya existe')) {
        return ResponseProvider.conflicto(res, error.message);
      }

      if (error.message.includes('obligatorio') || 
          error.message.includes('debe tener') || 
          error.message.includes('inválido')) {
        return ResponseProvider.errorValidacion(res, [{ 
          campo: 'general', 
          mensaje: error.message 
        }]);
      }

      return ResponseProvider.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Endpoint para renovar el access token
   * POST /api/auth/refresh
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async renovarToken(req, res) {
    try {
      const { refreshToken } = req.body;

      // Renovar token
      const resultado = await AuthService.renovarToken(refreshToken);

      return ResponseProvider.success(res, resultado, 'Token renovado exitosamente');

    } catch (error) {
      console.error('Error al renovar token:', error);
      
      if (error.message.includes('inválido') || 
          error.message.includes('expirado') || 
          error.message.includes('requerido')) {
        return ResponseProvider.noAutorizado(res, error.message);
      }

      return ResponseProvider.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Endpoint para obtener el perfil del usuario autenticado
   * GET /api/auth/perfil
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async obtenerPerfil(req, res) {
    try {
      const idUsuario = req.usuario.id_usuario;

      // Obtener perfil
      const perfil = await AuthService.obtenerPerfil(idUsuario);

      return ResponseProvider.success(res, perfil, 'Perfil obtenido exitosamente');

    } catch (error) {
      console.error('Error al obtener perfil:', error);
      
      if (error.message === 'Usuario no encontrado') {
        return ResponseProvider.noEncontrado(res, 'Usuario');
      }

      return ResponseProvider.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Endpoint para cambiar la contraseña del usuario autenticado
   * PUT /api/auth/cambiar-contraseña
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async cambiarContraseña(req, res) {
    try {
      const { contraseña_actual, nueva_contraseña } = req.body;
      const idUsuario = req.usuario.id_usuario;

      // Cambiar contraseña
      const resultado = await AuthService.cambiarContraseña(
        idUsuario, 
        contraseña_actual, 
        nueva_contraseña
      );

      if (!resultado) {
        return ResponseProvider.error(res, 'No se pudo cambiar la contraseña', 500);
      }

      return ResponseProvider.success(res, null, 'Contraseña cambiada exitosamente');

    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      
      if (error.message === 'Contraseña actual incorrecta') {
        return ResponseProvider.error(res, error.message, 400);
      }

      if (error.message.includes('debe tener al menos')) {
        return ResponseProvider.errorValidacion(res, [{ 
          campo: 'nueva_contraseña', 
          mensaje: error.message 
        }]);
      }

      return ResponseProvider.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Endpoint para cerrar sesión
   * POST /api/auth/logout
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async logout(req, res) {
    try {
      // Limpiar cookie del refresh token si se usa
      if (process.env.USE_REFRESH_COOKIE === 'true') {
        res.clearCookie('refreshToken');
      }

      return ResponseProvider.success(res, null, 'Sesión cerrada exitosamente');

    } catch (error) {
      console.error('Error en logout:', error);
      return ResponseProvider.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Endpoint para verificar si el token es válido
   * GET /api/auth/verificar
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async verificarToken(req, res) {
    try {
      // Si llegó hasta aquí, el token es válido (middleware de autenticación)
      const usuario = req.usuario;

      return ResponseProvider.success(res, {
        valido: true,
        usuario: {
          id_usuario: usuario.id_usuario,
          correo: usuario.correo,
          rol: usuario.nombre_rol
        }
      }, 'Token válido');

    } catch (error) {
      console.error('Error al verificar token:', error);
      return ResponseProvider.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Endpoint para validar email (verificar si existe)
   * POST /api/auth/validar-email
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async validarEmail(req, res) {
    try {
      const { correo } = req.body;

      if (!correo) {
        return ResponseProvider.errorValidacion(res, [{ 
          campo: 'correo', 
          mensaje: 'El correo es obligatorio' 
        }]);
      }

      // Verificar si el email ya existe
      const usuarioExistente = await Usuario.buscarPorCorreo(correo.toLowerCase().trim());
      
      return ResponseProvider.success(res, {
        existe: !!usuarioExistente,
        disponible: !usuarioExistente
      }, 'Validación de email completada');

    } catch (error) {
      console.error('Error al validar email:', error);
      return ResponseProvider.error(res, 'Error interno del servidor', 500);
    }
  }
}
