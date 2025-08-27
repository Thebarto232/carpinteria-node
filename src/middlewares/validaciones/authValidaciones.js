/**
 * Validaciones para campos de autenticación
 * Contiene funciones de validación para login, registro y cambio de contraseña
 */

import { ResponseProvider } from "../../providers/ResponseProvider.js";

/**
 * Valida los campos para el login
 * Verifica que correo y contraseña estén presentes y tengan formato válido
 */
export const validarLogin = (req, res, next) => {
  try {
    const { correo, contraseña } = req.body;
    const errores = [];

    // Validar correo
    if (!correo) {
      errores.push({
        campo: 'correo',
        mensaje: 'El correo electrónico es obligatorio'
      });
    } else if (!validarFormatoEmail(correo)) {
      errores.push({
        campo: 'correo',
        mensaje: 'El formato del correo electrónico es inválido'
      });
    }

    // Validar contraseña
    if (!contraseña) {
      errores.push({
        campo: 'contraseña',
        mensaje: 'La contraseña es obligatoria'
      });
    } else if (contraseña.length < 6) {
      errores.push({
        campo: 'contraseña',
        mensaje: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    if (errores.length > 0) {
      return ResponseProvider.errorValidacion(res, errores);
    }

    // Normalizar datos
    req.body.correo = correo.toLowerCase().trim();
    
    next();
  } catch (error) {
    console.error('Error en validación de login:', error);
    return ResponseProvider.error(res, 'Error en validación', 500);
  }
};

/**
 * Valida los campos para el registro de usuario
 * Verifica todos los campos requeridos y sus formatos
 */
export const validarRegistro = (req, res, next) => {
  try {
    const { nombre_usuario, correo, contraseña, telefono, id_rol } = req.body;
    const errores = [];

    // Validar nombre de usuario
    if (!nombre_usuario) {
      errores.push({
        campo: 'nombre_usuario',
        mensaje: 'El nombre de usuario es obligatorio'
      });
    } else if (nombre_usuario.trim().length < 2) {
      errores.push({
        campo: 'nombre_usuario',
        mensaje: 'El nombre de usuario debe tener al menos 2 caracteres'
      });
    } else if (nombre_usuario.trim().length > 100) {
      errores.push({
        campo: 'nombre_usuario',
        mensaje: 'El nombre de usuario no puede tener más de 100 caracteres'
      });
    } else if (!/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/.test(nombre_usuario.trim())) {
      errores.push({
        campo: 'nombre_usuario',
        mensaje: 'El nombre de usuario solo puede contener letras y espacios'
      });
    }

    // Validar correo
    if (!correo) {
      errores.push({
        campo: 'correo',
        mensaje: 'El correo electrónico es obligatorio'
      });
    } else if (!validarFormatoEmail(correo)) {
      errores.push({
        campo: 'correo',
        mensaje: 'El formato del correo electrónico es inválido'
      });
    } else if (correo.length > 100) {
      errores.push({
        campo: 'correo',
        mensaje: 'El correo electrónico no puede tener más de 100 caracteres'
      });
    }

    // Validar contraseña
    if (!contraseña) {
      errores.push({
        campo: 'contraseña',
        mensaje: 'La contraseña es obligatoria'
      });
    } else {
      const erroresContraseña = validarContraseña(contraseña);
      errores.push(...erroresContraseña);
    }

    // Validar teléfono (opcional)
    if (telefono && telefono.trim()) {
      if (!/^[0-9+\-\s()]+$/.test(telefono.trim())) {
        errores.push({
          campo: 'telefono',
          mensaje: 'El formato del teléfono es inválido'
        });
      } else if (telefono.trim().length > 20) {
        errores.push({
          campo: 'telefono',
          mensaje: 'El teléfono no puede tener más de 20 caracteres'
        });
      }
    }

    // Validar rol (opcional)
    if (id_rol !== undefined) {
      if (!Number.isInteger(id_rol) || id_rol < 1) {
        errores.push({
          campo: 'id_rol',
          mensaje: 'El ID del rol debe ser un número entero positivo'
        });
      }
    }

    if (errores.length > 0) {
      return ResponseProvider.errorValidacion(res, errores);
    }

    // Normalizar datos
    req.body.nombre_usuario = nombre_usuario.trim();
    req.body.correo = correo.toLowerCase().trim();
    req.body.telefono = telefono ? telefono.trim() : null;
    
    next();
  } catch (error) {
    console.error('Error en validación de registro:', error);
    return ResponseProvider.error(res, 'Error en validación', 500);
  }
};

/**
 * Valida los campos para cambio de contraseña
 * Verifica contraseña actual y nueva contraseña
 */
export const validarCambioContraseña = (req, res, next) => {
  try {
    const { contraseña_actual, nueva_contraseña } = req.body;
    const errores = [];

    // Validar contraseña actual
    if (!contraseña_actual) {
      errores.push({
        campo: 'contraseña_actual',
        mensaje: 'La contraseña actual es obligatoria'
      });
    }

    // Validar nueva contraseña
    if (!nueva_contraseña) {
      errores.push({
        campo: 'nueva_contraseña',
        mensaje: 'La nueva contraseña es obligatoria'
      });
    } else {
      const erroresContraseña = validarContraseña(nueva_contraseña);
      errores.push(...erroresContraseña.map(error => ({
        ...error,
        campo: 'nueva_contraseña'
      })));
    }

    // Verificar que las contraseñas sean diferentes
    if (contraseña_actual && nueva_contraseña && contraseña_actual === nueva_contraseña) {
      errores.push({
        campo: 'nueva_contraseña',
        mensaje: 'La nueva contraseña debe ser diferente a la actual'
      });
    }

    if (errores.length > 0) {
      return ResponseProvider.errorValidacion(res, errores);
    }

    next();
  } catch (error) {
    console.error('Error en validación de cambio de contraseña:', error);
    return ResponseProvider.error(res, 'Error en validación', 500);
  }
};

/**
 * Valida el refresh token en el body de la request
 */
export const validarRefreshToken = (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const errores = [];

    if (!refreshToken) {
      errores.push({
        campo: 'refreshToken',
        mensaje: 'El refresh token es obligatorio'
      });
    } else if (typeof refreshToken !== 'string') {
      errores.push({
        campo: 'refreshToken',
        mensaje: 'El refresh token debe ser una cadena de texto'
      });
    }

    if (errores.length > 0) {
      return ResponseProvider.errorValidacion(res, errores);
    }

    next();
  } catch (error) {
    console.error('Error en validación de refresh token:', error);
    return ResponseProvider.error(res, 'Error en validación', 500);
  }
};

/**
 * Valida el formato de un email
 * @param {string} email - Email a validar
 * @returns {boolean} - True si el formato es válido
 */
const validarFormatoEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida una contraseña según criterios de seguridad
 * @param {string} contraseña - Contraseña a validar
 * @returns {Array} - Array de errores de validación
 */
const validarContraseña = (contraseña) => {
  const errores = [];

  if (contraseña.length < 6) {
    errores.push({
      campo: 'contraseña',
      mensaje: 'La contraseña debe tener al menos 6 caracteres'
    });
  }

  if (contraseña.length > 128) {
    errores.push({
      campo: 'contraseña',
      mensaje: 'La contraseña no puede tener más de 128 caracteres'
    });
  }

  // Verificar que contenga al menos una letra
  if (!/[a-zA-Z]/.test(contraseña)) {
    errores.push({
      campo: 'contraseña',
      mensaje: 'La contraseña debe contener al menos una letra'
    });
  }

  // Verificar que contenga al menos un número
  if (!/[0-9]/.test(contraseña)) {
    errores.push({
      campo: 'contraseña',
      mensaje: 'La contraseña debe contener al menos un número'
    });
  }

  // Verificar que no contenga espacios
  if (/\s/.test(contraseña)) {
    errores.push({
      campo: 'contraseña',
      mensaje: 'La contraseña no puede contener espacios'
    });
  }

  return errores;
};
