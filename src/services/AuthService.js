/**
 * Servicio de autenticación
 * Maneja login, registro, tokens JWT y validaciones de autenticación
 */

import jwt from "jsonwebtoken";
import { Usuario } from "../models/Usuario.js";

export class AuthService {
  
  /**
   * Realiza el login de un usuario
   * @param {string} correo - Email del usuario
   * @param {string} contraseña - Contraseña del usuario
   * @returns {Promise<Object>} - Datos del usuario y tokens
   */
  static async login(correo, contraseña) {
    try {
      // Buscar usuario por correo
      const usuario = await Usuario.buscarPorCorreo(correo);
      if (!usuario) {
        throw new Error('Credenciales inválidas');
      }

      // Verificar contraseña
      const contraseñaValida = await Usuario.verificarContraseña(contraseña, usuario.contraseña_hash);
      if (!contraseñaValida) {
        throw new Error('Credenciales inválidas');
      }

      // Verificar que el usuario esté activo
      if (usuario.estado !== 'ACTIVO') {
        throw new Error('Usuario inactivo o pendiente de activación');
      }

      // Actualizar último acceso
      await Usuario.actualizarUltimoAcceso(usuario.id_usuario);

      // Obtener permisos del usuario
      const permisos = await Usuario.obtenerPermisosUsuario(usuario.id_usuario);

      // Generar tokens
      const { accessToken, refreshToken } = this.generarTokens(usuario);

      // Preparar datos del usuario (sin la contraseña)
      const datosUsuario = {
        id_usuario: usuario.id_usuario,
        nombre_usuario: usuario.nombre_usuario,
        correo: usuario.correo,
        telefono: usuario.telefono,
        rol: {
          id_rol: usuario.id_rol,
          nombre_rol: usuario.nombre_rol,
          descripcion: usuario.descripcion_rol
        },
        permisos: permisos.map(p => p.nombre_permiso),
        ultimo_acceso: new Date().toISOString()
      };

      return {
        usuario: datosUsuario,
        accessToken,
        refreshToken
      };
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  }

  /**
   * Registra un nuevo usuario
   * @param {Object} datosUsuario - Datos del usuario a registrar
   * @returns {Promise<Object>} - Datos del usuario creado
   */
  static async registrar(datosUsuario) {
    try {
      const { nombre_usuario, correo, contraseña, telefono, id_rol = 2 } = datosUsuario;

      // Validaciones básicas
      if (!nombre_usuario || !correo || !contraseña) {
        throw new Error('Nombre de usuario, correo y contraseña son obligatorios');
      }

      if (contraseña.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(correo)) {
        throw new Error('Formato de correo electrónico inválido');
      }

      // Crear usuario
      const idUsuario = await Usuario.crear({
        nombre_usuario,
        correo,
        contraseña,
        telefono,
        id_rol
      });

      // Obtener datos del usuario creado
      const usuarioCreado = await Usuario.buscarPorId(idUsuario);
      
      // Preparar respuesta (sin contraseña)
      return {
        id_usuario: usuarioCreado.id_usuario,
        nombre_usuario: usuarioCreado.nombre_usuario,
        correo: usuarioCreado.correo,
        telefono: usuarioCreado.telefono,
        rol: {
          id_rol: usuarioCreado.id_rol,
          nombre_rol: usuarioCreado.nombre_rol,
          descripcion: usuarioCreado.descripcion_rol
        },
        estado: usuarioCreado.estado,
        fecha_registro: usuarioCreado.fecha_registro
      };
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    }
  }

  /**
   * Renueva el access token usando el refresh token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object>} - Nuevo access token
   */
  static async renovarToken(refreshToken) {
    try {
      if (!refreshToken) {
        throw new Error('Refresh token requerido');
      }

      // Verificar refresh token
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      
      // Buscar usuario
      const usuario = await Usuario.buscarPorId(decoded.id_usuario);
      if (!usuario) {
        throw new Error('Usuario no encontrado');
      }

      if (usuario.estado !== 'ACTIVO') {
        throw new Error('Usuario inactivo');
      }

      // Generar nuevo access token
      const accessToken = this.generarAccessToken(usuario);

      return { accessToken };
    } catch (error) {
      console.error('Error al renovar token:', error);
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        throw new Error('Refresh token inválido o expirado');
      }
      throw error;
    }
  }

  /**
   * Genera access token y refresh token para un usuario
   * @param {Object} usuario - Datos del usuario
   * @returns {Object} - Tokens generados
   */
  static generarTokens(usuario) {
    const accessToken = this.generarAccessToken(usuario);
    const refreshToken = this.generarRefreshToken(usuario);

    return { accessToken, refreshToken };
  }

  /**
   * Genera un access token
   * @param {Object} usuario - Datos del usuario
   * @returns {string} - Access token
   */
  static generarAccessToken(usuario) {
    const payload = {
      id_usuario: usuario.id_usuario,
      correo: usuario.correo,
      id_rol: usuario.id_rol,
      nombre_rol: usuario.nombre_rol
    };

    return jwt.sign(
      payload,
      process.env.ACCESS_TOKEN_SECRET,
      { 
        expiresIn: `${process.env.TOKEN_EXPIRATION || 900}s`,
        issuer: 'carpinteria-api',
        audience: 'carpinteria-frontend'
      }
    );
  }

  /**
   * Genera un refresh token
   * @param {Object} usuario - Datos del usuario
   * @returns {string} - Refresh token
   */
  static generarRefreshToken(usuario) {
    const payload = {
      id_usuario: usuario.id_usuario,
      correo: usuario.correo
    };

    return jwt.sign(
      payload,
      process.env.REFRESH_TOKEN_SECRET,
      { 
        expiresIn: `${process.env.REFRESH_EXPIRATION || 604800}s`,
        issuer: 'carpinteria-api',
        audience: 'carpinteria-frontend'
      }
    );
  }

  /**
   * Verifica y decodifica un token
   * @param {string} token - Token a verificar
   * @param {string} secret - Secreto para verificar el token
   * @returns {Object} - Payload decodificado
   */
  static verificarToken(token, secret) {
    try {
      return jwt.verify(token, secret);
    } catch (error) {
      console.error('Error al verificar token:', error);
      throw error;
    }
  }

  /**
   * Cambia la contraseña de un usuario
   * @param {number} idUsuario - ID del usuario
   * @param {string} contraseñaActual - Contraseña actual
   * @param {string} nuevaContraseña - Nueva contraseña
   * @returns {Promise<boolean>} - True si se cambió correctamente
   */
  static async cambiarContraseña(idUsuario, contraseñaActual, nuevaContraseña) {
    try {
      // Buscar usuario
      const usuario = await Usuario.buscarPorCorreo(
        (await Usuario.buscarPorId(idUsuario)).correo
      );
      
      if (!usuario) {
        throw new Error('Usuario no encontrado');
      }

      // Verificar contraseña actual
      const contraseñaValida = await Usuario.verificarContraseña(
        contraseñaActual, 
        usuario.contraseña_hash
      );
      
      if (!contraseñaValida) {
        throw new Error('Contraseña actual incorrecta');
      }

      // Validar nueva contraseña
      if (nuevaContraseña.length < 6) {
        throw new Error('La nueva contraseña debe tener al menos 6 caracteres');
      }

      // Cambiar contraseña
      return await Usuario.cambiarContraseña(idUsuario, nuevaContraseña);
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      throw error;
    }
  }

  /**
   * Obtiene el perfil de un usuario autenticado
   * @param {number} idUsuario - ID del usuario
   * @returns {Promise<Object>} - Datos del perfil del usuario
   */
  static async obtenerPerfil(idUsuario) {
    try {
      const usuario = await Usuario.buscarPorId(idUsuario);
      if (!usuario) {
        throw new Error('Usuario no encontrado');
      }

      const permisos = await Usuario.obtenerPermisosUsuario(idUsuario);

      return {
        id_usuario: usuario.id_usuario,
        nombre_usuario: usuario.nombre_usuario,
        correo: usuario.correo,
        telefono: usuario.telefono,
        rol: {
          id_rol: usuario.id_rol,
          nombre_rol: usuario.nombre_rol,
          descripcion: usuario.descripcion_rol
        },
        permisos: permisos.map(p => ({
          nombre: p.nombre_permiso,
          descripcion: p.descripcion,
          modulo: p.modulo
        })),
        estado: usuario.estado,
        fecha_registro: usuario.fecha_registro,
        ultimo_acceso: usuario.ultimo_acceso
      };
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      throw error;
    }
  }
}
