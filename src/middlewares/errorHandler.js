/**
 * Middleware de manejo de errores global
 * Centraliza el manejo de errores para toda la aplicación
 */

import { ResponseProvider } from "../providers/ResponseProvider.js";

/**
 * Middleware global para manejo de errores
 * @param {Error} error - Error capturado
 * @param {Object} req - Objeto de solicitud de Express
 * @param {Object} res - Objeto de respuesta de Express
 * @param {Function} next - Función next de Express
 */
export const errorHandler = (error, req, res, next) => {
  // Log del error para debugging
  console.error('Error capturado por errorHandler:', {
    mensaje: error.message,
    stack: error.stack,
    url: req.originalUrl,
    metodo: req.method,
    timestamp: new Date().toISOString()
  });

  // Si ya se envió una respuesta, delegar al error handler por defecto
  if (res.headersSent) {
    return next(error);
  }

  // Manejar diferentes tipos de errores
  switch (error.name) {
    case 'ValidationError':
      return ResponseProvider.errorValidacion(res, error.message);
    
    case 'UnauthorizedError':
    case 'JsonWebTokenError':
      return ResponseProvider.noAutorizado(res, 'Token inválido');
    
    case 'TokenExpiredError':
      return ResponseProvider.noAutorizado(res, 'Token expirado');
    
    case 'CastError':
      return ResponseProvider.error(res, 'ID inválido', 400, 'ID_INVALIDO');
    
    case 'MongoError':
    case 'MySQLError':
      // Error de base de datos
      if (error.code === 11000) {
        return ResponseProvider.conflicto(res, 'Ya existe un registro con esos datos');
      }
      if (error.code === 'ER_DUP_ENTRY') {
        return ResponseProvider.conflicto(res, 'Ya existe un registro con esos datos');
      }
      break;
  }

  // Error por defecto - Internal Server Error
  return ResponseProvider.error(
    res, 
    process.env.NODE_ENV === 'production' ? 'Error interno del servidor' : error.message,
    500,
    'ERROR_INTERNO',
    process.env.NODE_ENV === 'production' ? null : error.stack
  );
};
