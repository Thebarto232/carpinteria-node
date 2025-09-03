/**
 * Modelo de Usuario para la gestión de usuarios del sistema
 * Maneja operaciones CRUD y validaciones relacionadas con usuarios
 */

import { ejecutarQuery } from "../utils/db.js";
import bcrypt from "bcryptjs";

export class Usuario {
  /**
   * Crea una dirección para un usuario
   * @param {Object} datosDireccion
   * @returns {Promise<number>} id_direccion
   */
  static async crearDireccion({ id_usuario, direccion, ciudad, departamento, codigo_postal, pais }) {
    try {
      const query = `
        INSERT INTO Direcciones (id_usuario, direccion, ciudad, departamento, codigo_postal, pais)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      const resultado = await ejecutarQuery(query, [
        id_usuario,
        direccion,
        ciudad,
        departamento,
        codigo_postal,
        pais
      ]);
      return resultado.insertId;
    } catch (error) {
      console.error('Error al crear dirección:', error);
      throw error;
    }
  }
  
  /**
   * Busca un usuario por su email
   * @param {string} correo - Email del usuario
   * @returns {Promise<Object|null>} - Usuario encontrado o null
   */
  static async buscarPorCorreo(correo) {
    try {
      const query = `
        SELECT 
          u.id_usuario,
          u.nombre_usuario,
          u.correo,
          u.contraseña_hash,
          u.telefono,
          u.id_rol,
          u.estado,
          u.fecha_registro,
          u.ultimo_acceso,
          r.nombre_rol,
          r.descripcion as descripcion_rol
        FROM Usuarios u
        INNER JOIN Roles r ON u.id_rol = r.id_rol
        WHERE u.correo = ? AND u.estado = 'ACTIVO'
      `;
      
      const filas = await ejecutarQuery(query, [correo]);
      return filas[0] || null;
    } catch (error) {
      console.error('Error al buscar usuario por correo:', error);
      throw error;
    }
  }

  /**
   * Busca un usuario por su ID
   * @param {number} id - ID del usuario
   * @returns {Promise<Object|null>} - Usuario encontrado o null
   */
  static async buscarPorId(id) {
    try {
      const query = `
        SELECT 
          u.id_usuario,
          u.nombre_usuario,
          u.correo,
          u.telefono,
          u.id_rol,
          u.estado,
          u.fecha_registro,
          u.ultimo_acceso,
          r.nombre_rol,
          r.descripcion as descripcion_rol,
          d.direccion,
          d.ciudad,
          d.departamento,
          d.codigo_postal,
          d.pais
        FROM Usuarios u
        INNER JOIN Roles r ON u.id_rol = r.id_rol
        LEFT JOIN Direcciones d ON u.id_usuario = d.id_usuario
        WHERE u.id_usuario = ?
      `;
      const filas = await ejecutarQuery(query, [id]);
      return filas[0] || null;
    } catch (error) {
      console.error('Error al buscar usuario por ID:', error);
      throw error;
    }
  }

  /**
   * Crea un nuevo usuario en la base de datos
   * @param {Object} datosUsuario - Datos del usuario
   * @param {string} datosUsuario.nombre_usuario - Nombre del usuario
   * @param {string} datosUsuario.correo - Email del usuario
   * @param {string} datosUsuario.contraseña - Contraseña en texto plano
   * @param {string} datosUsuario.telefono - Teléfono del usuario (opcional)
   * @param {number} datosUsuario.id_rol - ID del rol asignado
   * @returns {Promise<number>} - ID del usuario creado
   */
  static async crear({ nombre_usuario, correo, contraseña, telefono = null, id_rol = 2 }) {
    try {
      // Verificar si el email ya existe
      const usuarioExistente = await this.buscarPorCorreo(correo);
      if (usuarioExistente) {
        throw new Error('El correo electrónico ya está registrado');
      }

      // Encriptar la contraseña
      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
      const contraseña_hash = await bcrypt.hash(contraseña, saltRounds);

      const query = `
        INSERT INTO Usuarios (nombre_usuario, correo, contraseña_hash, telefono, id_rol, estado)
        VALUES (?, ?, ?, ?, ?, 'ACTIVO')
      `;
      
      const resultado = await ejecutarQuery(query, [
        nombre_usuario,
        correo,
        contraseña_hash,
        telefono,
        id_rol
      ]);
      
      return resultado.insertId;
    } catch (error) {
      console.error('Error al crear usuario:', error);
      throw error;
    }
  }

  /**
   * Actualiza la información de un usuario
   * @param {number} id - ID del usuario
   * @param {Object} datosActualizar - Datos a actualizar
   * @returns {Promise<boolean>} - True si se actualizó correctamente
   */
  static async actualizar(id, datosActualizar) {
    try {
      const { nombre_usuario, telefono, id_rol } = datosActualizar;
      
      const query = `
        UPDATE Usuarios 
        SET nombre_usuario = ?, telefono = ?, id_rol = ?
        WHERE id_usuario = ?
      `;
      
      const resultado = await ejecutarQuery(query, [nombre_usuario, telefono, id_rol, id]);
      return resultado.affectedRows > 0;
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      throw error;
    }
  }

  /**
   * Cambia la contraseña de un usuario
   * @param {number} id - ID del usuario
   * @param {string} nuevaContraseña - Nueva contraseña en texto plano
   * @returns {Promise<boolean>} - True si se cambió correctamente
   */
  static async cambiarContraseña(id, nuevaContraseña) {
    try {
      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
      const contraseña_hash = await bcrypt.hash(nuevaContraseña, saltRounds);

      const query = `
        UPDATE Usuarios 
        SET contraseña_hash = ?
        WHERE id_usuario = ? AND estado = 'ACTIVO'
      `;
      
      const resultado = await ejecutarQuery(query, [contraseña_hash, id]);
      return resultado.affectedRows > 0;
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      throw error;
    }
  }

  /**
   * Actualiza el último acceso del usuario
   * @param {number} id - ID del usuario
   * @returns {Promise<boolean>} - True si se actualizó correctamente
   */
  static async actualizarUltimoAcceso(id) {
    try {
      const query = `
        UPDATE Usuarios 
        SET ultimo_acceso = CURRENT_TIMESTAMP
        WHERE id_usuario = ?
      `;
      
      const resultado = await ejecutarQuery(query, [id]);
      return resultado.affectedRows > 0;
    } catch (error) {
      console.error('Error al actualizar último acceso:', error);
      throw error;
    }
  }

  /**
   * Obtiene todos los usuarios con paginación
   * @param {number} pagina - Número de página
   * @param {number} limite - Límite de registros por página
   * @param {string} busqueda - Término de búsqueda (opcional)
   * @returns {Promise<Object>} - Usuarios y metadatos de paginación
   */
  static async obtenerTodos(pagina = 1, limite = 10, busqueda = '') {
    try {
      const offset = (pagina - 1) * limite;
      
      let whereClause = "";
      const parametros = [];
      
      if (busqueda) {
        whereClause = "WHERE (u.nombre_usuario LIKE ? OR u.correo LIKE ?)";
        parametros.push(`%${busqueda}%`, `%${busqueda}%`);
      }
      
      // Consulta para obtener usuarios
        const query = `
          SELECT 
            u.id_usuario,
            u.nombre_usuario,
            u.correo,
            u.telefono,
            u.estado,
            u.fecha_registro,
            u.ultimo_acceso,
            r.nombre_rol,
            d.direccion,
            d.ciudad,
            d.departamento,
            d.codigo_postal,
            d.pais
          FROM Usuarios u
          INNER JOIN Roles r ON u.id_rol = r.id_rol
          LEFT JOIN Direcciones d ON u.id_usuario = d.id_usuario
          ${whereClause}
          ORDER BY u.fecha_registro DESC
          LIMIT ${limite} OFFSET ${offset}
        `;
      
      const usuarios = await ejecutarQuery(query);
      
      // Consulta para contar total de registros
      const queryConteo = `
        SELECT COUNT(*) as total
        FROM Usuarios u
        ${whereClause}
      `;
      
      const parametrosConteo = busqueda ? [`%${busqueda}%`, `%${busqueda}%`] : [];
      const resultadoConteo = await ejecutarQuery(queryConteo, parametrosConteo);
      const total = resultadoConteo[0].total;
      
      return {
        usuarios,
        paginacion: {
          paginaActual: pagina,
          totalPaginas: Math.ceil(total / limite),
          totalRegistros: total,
          registrosPorPagina: limite
        }
      };
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      throw error;
    }
  }

  /**
   * Cambia el estado de un usuario (activar/desactivar)
   * @param {number} id - ID del usuario
   * @param {string} estado - Nuevo estado ('ACTIVO', 'INACTIVO', 'PENDIENTE')
   * @returns {Promise<boolean>} - True si se cambió correctamente
   */
  static async cambiarEstado(id, estado) {
    try {
      const estadosValidos = ['ACTIVO', 'INACTIVO', 'PENDIENTE'];
      if (!estadosValidos.includes(estado)) {
        throw new Error('Estado no válido');
      }

      const query = `
        UPDATE Usuarios 
        SET estado = ?
        WHERE id_usuario = ?
      `;
      
      const resultado = await ejecutarQuery(query, [estado, id]);
      return resultado.affectedRows > 0;
    } catch (error) {
      console.error('Error al cambiar estado del usuario:', error);
      throw error;
    }
  }

  /**
   * Verifica si una contraseña es correcta
   * @param {string} contraseña - Contraseña en texto plano
   * @param {string} hash - Hash almacenado en la base de datos
   * @returns {Promise<boolean>} - True si la contraseña es correcta
   */
  static async verificarContraseña(contraseña, hash) {
    try {
      return await bcrypt.compare(contraseña, hash);
    } catch (error) {
      console.error('Error al verificar contraseña:', error);
      throw error;
    }
  }

  /**
   * Obtiene los permisos de un usuario
   * @param {number} idUsuario - ID del usuario
   * @returns {Promise<Array>} - Lista de permisos del usuario
   */
  static async obtenerPermisosUsuario(idUsuario) {
    try {
      const query = `
        SELECT DISTINCT 
          p.id_permiso,
          p.nombre_permiso,
          p.descripcion,
          p.modulo
        FROM Usuarios u
        INNER JOIN Roles r ON u.id_rol = r.id_rol
        INNER JOIN Roles_Permisos rp ON r.id_rol = rp.id_rol
        INNER JOIN Permisos p ON rp.id_permiso = p.id_permiso
        WHERE u.id_usuario = ? AND u.estado = 'ACTIVO'
        ORDER BY p.modulo, p.nombre_permiso
      `;
      
      return await ejecutarQuery(query, [idUsuario]);
    } catch (error) {
      console.error('Error al obtener permisos del usuario:', error);
      throw error;
    }
  }
}
