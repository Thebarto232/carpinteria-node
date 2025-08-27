/**
 * Middleware de autenticación JWT
 * Valida tokens JWT y protege rutas que requieren autenticación
 */

import jwt from "jsonwebtoken";
import { ResponseProvider } from "../../providers/ResponseProvider.js";
import { Usuario } from "../../models/Usuario.js";

/**
 * Middleware para verificar token JWT
 * Extrae el token del header Authorization y lo valida
 */
export const verificarToken = async (req, res, next) => {
  try {
    // Extraer token del header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return ResponseProvider.noAutorizado(res, 'Token de acceso requerido');
    }

    // Verificar formato del header (Bearer token)
    if (!authHeader.startsWith('Bearer ')) {
      return ResponseProvider.noAutorizado(res, 'Formato de token inválido');
    }

    const token = authHeader.substring(7); // Remover "Bearer "

    if (!token) {
      return ResponseProvider.noAutorizado(res, 'Token de acceso requerido');
    }

    // Verificar y decodificar el token
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Verificar que el usuario aún existe y está activo
    const usuario = await Usuario.buscarPorId(decoded.id_usuario);
    
    if (!usuario) {
      return ResponseProvider.noAutorizado(res, 'Usuario no encontrado');
    }

    if (usuario.estado !== 'ACTIVO') {
      return ResponseProvider.noAutorizado(res, 'Usuario inactivo');
    }

    // Agregar información del usuario a la request
    req.usuario = {
      id_usuario: decoded.id_usuario,
      correo: decoded.correo,
      id_rol: decoded.id_rol,
      nombre_rol: decoded.nombre_rol
    };

    next();
  } catch (error) {
    console.error('Error en verificación de token:', error);

    if (error.name === 'JsonWebTokenError') {
      return ResponseProvider.noAutorizado(res, 'Token inválido');
    }

    if (error.name === 'TokenExpiredError') {
      return ResponseProvider.noAutorizado(res, 'Token expirado');
    }

    return ResponseProvider.error(res, 'Error al verificar token', 500);
  }
};

/**
 * Middleware opcional para verificar token
 * Similar al middleware anterior pero no rechaza si no hay token
 */
export const verificarTokenOpcional = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No hay token, continuar sin usuario autenticado
      req.usuario = null;
      return next();
    }

    const token = authHeader.substring(7);

    if (!token) {
      req.usuario = null;
      return next();
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const usuario = await Usuario.buscarPorId(decoded.id_usuario);
    
    if (!usuario || usuario.estado !== 'ACTIVO') {
      req.usuario = null;
      return next();
    }

    req.usuario = {
      id_usuario: decoded.id_usuario,
      correo: decoded.correo,
      id_rol: decoded.id_rol,
      nombre_rol: decoded.nombre_rol
    };

    next();
  } catch (error) {
    // En caso de error, continuar sin usuario autenticado
    req.usuario = null;
    next();
  }
};

/**
 * Middleware para verificar refresh token
 * Específico para la ruta de renovación de tokens
 */
export const verificarRefreshToken = (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return ResponseProvider.error(res, 'Refresh token requerido', 400);
    }

    // Verificar refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    
    req.tokenData = {
      id_usuario: decoded.id_usuario,
      correo: decoded.correo
    };

    next();
  } catch (error) {
    console.error('Error en verificación de refresh token:', error);

    if (error.name === 'JsonWebTokenError') {
      return ResponseProvider.noAutorizado(res, 'Refresh token inválido');
    }

    if (error.name === 'TokenExpiredError') {
      return ResponseProvider.noAutorizado(res, 'Refresh token expirado');
    }

    return ResponseProvider.error(res, 'Error al verificar refresh token', 500);
  }
};
