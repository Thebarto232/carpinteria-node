/**
 * Proveedor de respuestas estandarizadas para la API
 * Centraliza el formato de respuestas exitosas y de error
 */

export class ResponseProvider {
  
  /**
   * Genera una respuesta exitosa estandarizada
   * @param {Object} res - Objeto de respuesta de Express
   * @param {*} data - Datos a enviar en la respuesta
   * @param {string} mensaje - Mensaje descriptivo (opcional)
   * @param {number} statusCode - Código de estado HTTP (por defecto 200)
   * @returns {Object} - Respuesta JSON estandarizada
   */
  static success(res, data = null, mensaje = 'Operación exitosa', statusCode = 200) {
    const response = {
      success: true,
      mensaje,
      data,
      timestamp: new Date().toISOString()
    };

    // Solo incluir data si existe
    if (data === null) {
      delete response.data;
    }

    return res.status(statusCode).json(response);
  }

  /**
   * Genera una respuesta de error estandarizada
   * @param {Object} res - Objeto de respuesta de Express
   * @param {string} mensaje - Mensaje de error
   * @param {number} statusCode - Código de estado HTTP (por defecto 500)
   * @param {string} codigoError - Código de error personalizado (opcional)
   * @param {*} detalles - Detalles adicionales del error (opcional)
   * @returns {Object} - Respuesta JSON de error estandarizada
   */
  static error(res, mensaje = 'Error interno del servidor', statusCode = 500, codigoError = null, detalles = null) {
    const response = {
      success: false,
      mensaje,
      timestamp: new Date().toISOString()
    };

    // Incluir código de error si se proporciona
    if (codigoError) {
      response.codigoError = codigoError;
    }

    // Incluir detalles adicionales si se proporcionan y no estamos en producción
    if (detalles && process.env.NODE_ENV !== 'production') {
      response.detalles = detalles;
    }

    return res.status(statusCode).json(response);
  }

  /**
   * Respuesta para recursos no encontrados
   * @param {Object} res - Objeto de respuesta de Express
   * @param {string} recurso - Nombre del recurso no encontrado
   * @returns {Object} - Respuesta JSON 404
   */
  static noEncontrado(res, recurso = 'Recurso') {
    return this.error(res, `${recurso} no encontrado`, 404, 'RECURSO_NO_ENCONTRADO');
  }

  /**
   * Respuesta para errores de validación
   * @param {Object} res - Objeto de respuesta de Express
   * @param {Array|Object} erroresValidacion - Errores de validación
   * @returns {Object} - Respuesta JSON 400
   */
  static errorValidacion(res, erroresValidacion) {
    return this.error(res, 'Errores de validación', 400, 'ERROR_VALIDACION', erroresValidacion);
  }

  /**
   * Respuesta para errores de autenticación
   * @param {Object} res - Objeto de respuesta de Express
   * @param {string} mensaje - Mensaje personalizado (opcional)
   * @returns {Object} - Respuesta JSON 401
   */
  static noAutorizado(res, mensaje = 'No autorizado') {
    return this.error(res, mensaje, 401, 'NO_AUTORIZADO');
  }

  /**
   * Respuesta para errores de permisos
   * @param {Object} res - Objeto de respuesta de Express
   * @param {string} mensaje - Mensaje personalizado (opcional)
   * @returns {Object} - Respuesta JSON 403
   */
  static accesoDenegado(res, mensaje = 'Acceso denegado') {
    return this.error(res, mensaje, 403, 'ACCESO_DENEGADO');
  }

  /**
   * Respuesta para conflictos (ej: email ya existe)
   * @param {Object} res - Objeto de respuesta de Express
   * @param {string} mensaje - Mensaje del conflicto
   * @returns {Object} - Respuesta JSON 409
   */
  static conflicto(res, mensaje = 'Conflicto en los datos') {
    return this.error(res, mensaje, 409, 'CONFLICTO');
  }

  /**
   * Respuesta para datos creados exitosamente
   * @param {Object} res - Objeto de respuesta de Express
   * @param {*} data - Datos creados
   * @param {string} mensaje - Mensaje personalizado (opcional)
   * @returns {Object} - Respuesta JSON 201
   */
  static creado(res, data, mensaje = 'Recurso creado exitosamente') {
    return this.success(res, data, mensaje, 201);
  }

  /**
   * Respuesta para operaciones exitosas sin contenido
   * @param {Object} res - Objeto de respuesta de Express
   * @param {string} mensaje - Mensaje personalizado (opcional)
   * @returns {Object} - Respuesta JSON 204
   */
  static sinContenido(res, mensaje = 'Operación completada') {
    return res.status(204).send();
  }
}
