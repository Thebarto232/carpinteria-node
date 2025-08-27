/**
 * Middleware de autorización por roles y permisos
 * Controla el acceso a recursos basado en roles y permisos específicos
 */

import { ResponseProvider } from "../../providers/ResponseProvider.js";
import { Permiso } from "../../models/Permiso.js";

/**
 * Middleware para verificar que el usuario tenga un rol específico
 * @param {Array<string>} rolesPermitidos - Lista de roles permitidos
 * @returns {Function} - Middleware function
 */
export const requiereRol = (rolesPermitidos) => {
  return (req, res, next) => {
    try {
      if (!req.usuario) {
        return ResponseProvider.noAutorizado(res, 'Autenticación requerida');
      }

      const rolUsuario = req.usuario.nombre_rol;
      
      if (!rolesPermitidos.includes(rolUsuario)) {
        return ResponseProvider.accesoDenegado(
          res, 
          `Acceso denegado. Se requiere uno de estos roles: ${rolesPermitidos.join(', ')}`
        );
      }

      next();
    } catch (error) {
      console.error('Error en verificación de rol:', error);
      return ResponseProvider.error(res, 'Error al verificar rol', 500);
    }
  };
};

/**
 * Middleware para verificar que el usuario tenga un permiso específico
 * También permite acceso total si el usuario tiene el permiso "*" (asterisco)
 * @param {string} permisoRequerido - Nombre del permiso requerido
 * @returns {Function} - Middleware function
 */
export const requierePermiso = (permisoRequerido) => {
  return async (req, res, next) => {
    try {
      if (!req.usuario) {
        return ResponseProvider.noAutorizado(res, 'Autenticación requerida');
      }

      // Verificar si el usuario tiene permisos totales (*)
      const tienePermisoTotal = await Permiso.usuarioTienePermiso(
        req.usuario.id_usuario, 
        '*'
      );

      if (tienePermisoTotal) {
        return next(); // Acceso total concedido
      }

      // Verificar si el usuario tiene el permiso específico
      const tienePermiso = await Permiso.usuarioTienePermiso(
        req.usuario.id_usuario, 
        permisoRequerido
      );

      if (!tienePermiso) {
        return ResponseProvider.accesoDenegado(
          res, 
          `Acceso denegado. Se requiere el permiso: ${permisoRequerido}`
        );
      }

      next();
    } catch (error) {
      console.error('Error en verificación de permiso:', error);
      return ResponseProvider.error(res, 'Error al verificar permiso', 500);
    }
  };
};

/**
 * Middleware que permite acceso con permiso específico O si está accediendo a sus propios datos
 * También permite acceso total si el usuario tiene el permiso "*" (asterisco)
 * @param {string} permisoRequerido - Permiso necesario para acceso general
 * @param {string} paramName - Nombre del parámetro que contiene el ID (por defecto 'id')
 * @returns {Function} - Middleware function
 */
export const permisoOPropioDatos = (permisoRequerido, paramName = 'id') => {
  return async (req, res, next) => {
    try {
      if (!req.usuario) {
        return ResponseProvider.noAutorizado(res, 'Autenticación requerida');
      }

      // Verificar si el usuario tiene permisos totales (*)
      const tienePermisoTotal = await Permiso.usuarioTienePermiso(
        req.usuario.id_usuario, 
        '*'
      );

      if (tienePermisoTotal) {
        return next(); // Acceso total concedido
      }

      const idRecurso = parseInt(req.params[paramName]);
      const idUsuario = req.usuario.id_usuario;

      // Si está accediendo a sus propios datos, permitir
      if (idRecurso === idUsuario) {
        return next();
      }

      // Si no son sus propios datos, verificar permiso específico
      const tienePermiso = await Permiso.usuarioTienePermiso(
        req.usuario.id_usuario, 
        permisoRequerido
      );

      if (!tienePermiso) {
        return ResponseProvider.accesoDenegado(
          res, 
          `Acceso denegado. Se requiere el permiso: ${permisoRequerido} o acceso a datos propios`
        );
      }

      next();
    } catch (error) {
      console.error('Error en verificación de permiso o propios datos:', error);
      return ResponseProvider.error(res, 'Error al verificar acceso', 500);
    }
  };
};
