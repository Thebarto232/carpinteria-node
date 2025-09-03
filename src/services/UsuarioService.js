/**
 * Servicio de gestión de usuarios
 * Maneja operaciones CRUD y lógica de negocio relacionada con usuarios
 */

import { Usuario } from "../models/Usuario.js";
import { Rol } from "../models/Rol.js";
import Direccion from "../models/Direccion.js";

export class UsuarioService {
  
  /**
   * Obtiene todos los usuarios con paginación y búsqueda
   * @param {Object} opciones - Opciones de consulta
   * @param {number} opciones.pagina - Número de página
   * @param {number} opciones.limite - Límite de registros por página
   * @param {string} opciones.busqueda - Término de búsqueda
   * @returns {Promise<Object>} - Usuarios y metadatos de paginación
   */
  static async obtenerUsuarios({ pagina = 1, limite = 10, busqueda = '' }) {
    try {
      // Validar parámetros
      if (pagina < 1) pagina = 1;
      if (limite < 1 || limite > 100) limite = 10;

      const resultado = await Usuario.obtenerTodos(pagina, limite, busqueda);
      
      // Formatear datos de respuesta
      const usuarios = resultado.usuarios.map(usuario => ({
        id_usuario: usuario.id_usuario,
        nombre_usuario: usuario.nombre_usuario,
        correo: usuario.correo,
        telefono: usuario.telefono,
        estado: usuario.estado,
        rol: usuario.nombre_rol,
        fecha_registro: usuario.fecha_registro,
        ultimo_acceso: usuario.ultimo_acceso,
        direccion: usuario.direccion,
        ciudad: usuario.ciudad,
        departamento: usuario.departamento,
        codigo_postal: usuario.codigo_postal,
        pais: usuario.pais
      }));

      return {
        usuarios,
        paginacion: resultado.paginacion
      };
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      throw error;
    }
  }

  /**
   * Obtiene un usuario por su ID
   * @param {number} idUsuario - ID del usuario
   * @returns {Promise<Object>} - Datos del usuario
   */
  static async obtenerUsuarioPorId(idUsuario) {
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
        estado: usuario.estado,
        fecha_registro: usuario.fecha_registro,
        ultimo_acceso: usuario.ultimo_acceso,
        direccion: usuario.direccion,
        ciudad: usuario.ciudad,
        departamento: usuario.departamento,
        codigo_postal: usuario.codigo_postal,
        pais: usuario.pais,
        rol: {
          id_rol: usuario.id_rol,
          nombre_rol: usuario.nombre_rol,
          descripcion: usuario.descripcion_rol
        },
        permisos: permisos.map(p => ({
          nombre: p.nombre_permiso,
          descripcion: p.descripcion,
          modulo: p.modulo
        }))
      };
    } catch (error) {
      console.error('Error al obtener usuario por ID:', error);
      throw error;
    }
  }

  /**
   * Crea un nuevo usuario
   * @param {Object} datosUsuario - Datos del usuario a crear
   * @returns {Promise<Object>} - Usuario creado
   */
  static async crearUsuario(datosUsuario) {
    try {
  const { nombre_usuario, correo, contraseña, telefono, id_rol, direccion, ciudad, departamento, codigo_postal, pais } = datosUsuario;

      // Validaciones
      if (!nombre_usuario || nombre_usuario.trim().length < 2) {
        throw new Error('El nombre de usuario debe tener al menos 2 caracteres');
      }

      if (!correo || !this.validarEmail(correo)) {
        throw new Error('Correo electrónico inválido');
      }

      if (!contraseña || contraseña.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }

      // Verificar que el rol existe
      if (id_rol) {
        const rol = await Rol.buscarPorId(id_rol);
        if (!rol) {
          throw new Error('El rol especificado no existe');
        }
      }

      // Crear usuario
      const idUsuario = await Usuario.crear({
        nombre_usuario: nombre_usuario.trim(),
        correo: correo.toLowerCase().trim(),
        contraseña,
        telefono: telefono ? telefono.trim() : null,
        id_rol: id_rol || 2 // Por defecto rol de usuario
      });

      // Si hay dirección, crearla
      if (direccion && ciudad && departamento && pais) {
        await Usuario.crearDireccion({
          id_usuario: idUsuario,
          direccion: direccion.trim(),
          ciudad: ciudad.trim(),
          departamento: departamento.trim(),
          codigo_postal: codigo_postal ? codigo_postal.trim() : null,
          pais: pais.trim()
        });
      }

      // Obtener datos del usuario creado
      return await this.obtenerUsuarioPorId(idUsuario);
    } catch (error) {
      console.error('Error al crear usuario:', error);
      throw error;
    }
  }

  /**
   * Actualiza un usuario existente
   * @param {number} idUsuario - ID del usuario a actualizar
   * @param {Object} datosActualizar - Datos a actualizar
   * @returns {Promise<Object>} - Usuario actualizado
   */
  static async actualizarUsuario(idUsuario, datosActualizar) {
    try {
  const { nombre_usuario, telefono, id_rol, direccion, ciudad, departamento, codigo_postal, pais } = datosActualizar;

      // Verificar que el usuario existe
      const usuarioExistente = await Usuario.buscarPorId(idUsuario);
      if (!usuarioExistente) {
        throw new Error('Usuario no encontrado');
      }

      // Validaciones
      if (nombre_usuario && nombre_usuario.trim().length < 2) {
        throw new Error('El nombre de usuario debe tener al menos 2 caracteres');
      }

      // Verificar que el rol existe si se proporciona
      if (id_rol) {
        const rol = await Rol.buscarPorId(id_rol);
        if (!rol) {
          throw new Error('El rol especificado no existe');
        }
      }

      // Actualizar usuario
      const datosParaActualizar = {
        nombre_usuario: nombre_usuario ? nombre_usuario.trim() : usuarioExistente.nombre_usuario,
        telefono: telefono !== undefined ? (telefono ? telefono.trim() : null) : usuarioExistente.telefono,
        id_rol: id_rol || usuarioExistente.id_rol
      };

      const actualizado = await Usuario.actualizar(idUsuario, datosParaActualizar);
      
      if (!actualizado) {
        throw new Error('No se pudo actualizar el usuario');
      }

      // Actualizar o crear dirección si se envía algún dato de dirección
      if (direccion || ciudad || departamento || codigo_postal || pais) {
        await Direccion.actualizarDireccion(idUsuario, {
          direccion,
          ciudad,
          departamento,
          codigo_postal,
          pais
        });
      }

      // Retornar usuario actualizado
      return await this.obtenerUsuarioPorId(idUsuario);
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      throw error;
    }
  }

  /**
   * Cambia el estado de un usuario
   * @param {number} idUsuario - ID del usuario
   * @param {string} nuevoEstado - Nuevo estado del usuario
   * @returns {Promise<Object>} - Usuario con estado actualizado
   */
  static async cambiarEstadoUsuario(idUsuario, nuevoEstado) {
    try {
      const estadosValidos = ['ACTIVO', 'INACTIVO', 'PENDIENTE'];
      
      if (!estadosValidos.includes(nuevoEstado)) {
        throw new Error('Estado no válido. Estados válidos: ' + estadosValidos.join(', '));
      }

      // Verificar que el usuario existe
      const usuario = await Usuario.buscarPorId(idUsuario);
      if (!usuario) {
        throw new Error('Usuario no encontrado');
      }

      // Cambiar estado
      const actualizado = await Usuario.cambiarEstado(idUsuario, nuevoEstado);
      
      if (!actualizado) {
        throw new Error('No se pudo cambiar el estado del usuario');
      }

      // Retornar usuario actualizado
      return await this.obtenerUsuarioPorId(idUsuario);
    } catch (error) {
      console.error('Error al cambiar estado del usuario:', error);
      throw error;
    }
  }

  /**
   * Elimina un usuario (cambia estado a INACTIVO)
   * @param {number} idUsuario - ID del usuario a eliminar
   * @returns {Promise<boolean>} - True si se eliminó correctamente
   */
  static async eliminarUsuario(idUsuario) {
    try {
      // Verificar que el usuario existe
      const usuario = await Usuario.buscarPorId(idUsuario);
      if (!usuario) {
        throw new Error('Usuario no encontrado');
      }

      // Cambiar estado a INACTIVO en lugar de eliminar físicamente
      return await this.cambiarEstadoUsuario(idUsuario, 'INACTIVO');
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      throw error;
    }
  }

  /**
   * Obtiene las estadísticas de usuarios
   * @returns {Promise<Object>} - Estadísticas de usuarios
   */
  static async obtenerEstadisticasUsuarios() {
    try {
      const todosLosUsuarios = await Usuario.obtenerTodos(1, 1000); // Obtener muchos usuarios para estadísticas
      const usuarios = todosLosUsuarios.usuarios;

      const estadisticas = {
        total: usuarios.length,
        activos: usuarios.filter(u => u.estado === 'ACTIVO').length,
        inactivos: usuarios.filter(u => u.estado === 'INACTIVO').length,
        pendientes: usuarios.filter(u => u.estado === 'PENDIENTE').length,
        porRol: {}
      };

      // Contar por rol
      usuarios.forEach(usuario => {
        const rol = usuario.nombre_rol;
        if (!estadisticas.porRol[rol]) {
          estadisticas.porRol[rol] = 0;
        }
        estadisticas.porRol[rol]++;
      });

      return estadisticas;
    } catch (error) {
      console.error('Error al obtener estadísticas de usuarios:', error);
      throw error;
    }
  }

  /**
   * Valida el formato de un email
   * @param {string} email - Email a validar
   * @returns {boolean} - True si el email es válido
   */
  static validarEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Busca usuarios por término de búsqueda
   * @param {string} termino - Término de búsqueda
   * @param {number} limite - Límite de resultados
   * @returns {Promise<Array>} - Usuarios encontrados
   */
  static async buscarUsuarios(termino, limite = 10) {
    try {
      if (!termino || termino.trim().length < 2) {
        return [];
      }

      const resultado = await Usuario.obtenerTodos(1, limite, termino.trim());
      
      return resultado.usuarios.map(usuario => ({
        id_usuario: usuario.id_usuario,
        nombre_usuario: usuario.nombre_usuario,
        correo: usuario.correo,
        estado: usuario.estado,
        rol: usuario.nombre_rol
      }));
    } catch (error) {
      console.error('Error al buscar usuarios:', error);
      throw error;
    }
  }
}
