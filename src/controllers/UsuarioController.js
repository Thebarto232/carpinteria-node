/**
 * Controlador de Usuarios
 * Maneja endpoints CRUD para la gestión de usuarios del sistema
 */

import { UsuarioService } from "../services/UsuarioService.js";
import { ResponseProvider } from "../providers/ResponseProvider.js";

export class UsuarioController {
  
  /**
   * Obtiene todos los usuarios con paginación y búsqueda
   * GET /api/usuarios
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async obtenerUsuarios(req, res) {
    try {
      const { 
        pagina = 1, 
        limite = 10, 
        busqueda = '' 
      } = req.query;

      // Convertir a números y validar
      const paginaNum = parseInt(pagina) || 1;
      const limiteNum = parseInt(limite) || 10;

      const resultado = await UsuarioService.obtenerUsuarios({
        pagina: paginaNum,
        limite: limiteNum,
        busqueda: busqueda.toString().trim()
      });

      return ResponseProvider.success(res, resultado, 'Usuarios obtenidos exitosamente');

    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      return ResponseProvider.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Obtiene un usuario por su ID
   * GET /api/usuarios/:id
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async obtenerUsuarioPorId(req, res) {
    try {
      const { id } = req.params;
      const idUsuario = parseInt(id);

      if (!idUsuario || idUsuario < 1) {
        return ResponseProvider.errorValidacion(res, [{ 
          campo: 'id', 
          mensaje: 'ID de usuario inválido' 
        }]);
      }

      const usuario = await UsuarioService.obtenerUsuarioPorId(idUsuario);

      return ResponseProvider.success(res, usuario, 'Usuario obtenido exitosamente');

    } catch (error) {
      console.error('Error al obtener usuario:', error);
      
      if (error.message === 'Usuario no encontrado') {
        return ResponseProvider.noEncontrado(res, 'Usuario');
      }

      return ResponseProvider.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Crea un nuevo usuario
   * POST /api/usuarios
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async crearUsuario(req, res) {
    try {
      const datosUsuario = req.body;

      const usuarioCreado = await UsuarioService.crearUsuario(datosUsuario);

      return ResponseProvider.creado(res, usuarioCreado, 'Usuario creado exitosamente');

    } catch (error) {
      console.error('Error al crear usuario:', error);
      
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
   * Actualiza un usuario existente
   * PUT /api/usuarios/:id
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async actualizarUsuario(req, res) {
    try {
      const { id } = req.params;
      const idUsuario = parseInt(id);
      const datosActualizar = req.body;

      if (!idUsuario || idUsuario < 1) {
        return ResponseProvider.errorValidacion(res, [{ 
          campo: 'id', 
          mensaje: 'ID de usuario inválido' 
        }]);
      }

      const usuarioActualizado = await UsuarioService.actualizarUsuario(idUsuario, datosActualizar);

      return ResponseProvider.success(res, usuarioActualizado, 'Usuario actualizado exitosamente');

    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      
      if (error.message === 'Usuario no encontrado') {
        return ResponseProvider.noEncontrado(res, 'Usuario');
      }

      if (error.message.includes('debe tener') || 
          error.message.includes('inválido') ||
          error.message.includes('no existe')) {
        return ResponseProvider.errorValidacion(res, [{ 
          campo: 'general', 
          mensaje: error.message 
        }]);
      }

      return ResponseProvider.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Cambia el estado de un usuario
   * PATCH /api/usuarios/:id/estado
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async cambiarEstado(req, res) {
    try {
      const { id } = req.params;
      const { estado } = req.body;
      const idUsuario = parseInt(id);

      if (!idUsuario || idUsuario < 1) {
        return ResponseProvider.errorValidacion(res, [{ 
          campo: 'id', 
          mensaje: 'ID de usuario inválido' 
        }]);
      }

      if (!estado) {
        return ResponseProvider.errorValidacion(res, [{ 
          campo: 'estado', 
          mensaje: 'El estado es obligatorio' 
        }]);
      }

      const usuarioActualizado = await UsuarioService.cambiarEstadoUsuario(idUsuario, estado);

      return ResponseProvider.success(res, usuarioActualizado, 'Estado del usuario actualizado exitosamente');

    } catch (error) {
      console.error('Error al cambiar estado del usuario:', error);
      
      if (error.message === 'Usuario no encontrado') {
        return ResponseProvider.noEncontrado(res, 'Usuario');
      }

      if (error.message.includes('Estado no válido') || 
          error.message.includes('Estados válidos')) {
        return ResponseProvider.errorValidacion(res, [{ 
          campo: 'estado', 
          mensaje: error.message 
        }]);
      }

      return ResponseProvider.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Elimina un usuario (cambia estado a INACTIVO)
   * DELETE /api/usuarios/:id
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async eliminarUsuario(req, res) {
    try {
      const { id } = req.params;
      const idUsuario = parseInt(id);

      if (!idUsuario || idUsuario < 1) {
        return ResponseProvider.errorValidacion(res, [{ 
          campo: 'id', 
          mensaje: 'ID de usuario inválido' 
        }]);
      }

      await UsuarioService.eliminarUsuario(idUsuario);

      return ResponseProvider.success(res, null, 'Usuario eliminado exitosamente');

    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      
      if (error.message === 'Usuario no encontrado') {
        return ResponseProvider.noEncontrado(res, 'Usuario');
      }

      return ResponseProvider.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Obtiene estadísticas de usuarios
   * GET /api/usuarios/estadisticas
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async obtenerEstadisticas(req, res) {
    try {
      const estadisticas = await UsuarioService.obtenerEstadisticasUsuarios();

      return ResponseProvider.success(res, estadisticas, 'Estadísticas obtenidas exitosamente');

    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      return ResponseProvider.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Busca usuarios por término de búsqueda
   * GET /api/usuarios/buscar
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async buscarUsuarios(req, res) {
    try {
      const { q, limite = 10 } = req.query;

      if (!q || q.trim().length < 2) {
        return ResponseProvider.errorValidacion(res, [{ 
          campo: 'q', 
          mensaje: 'El término de búsqueda debe tener al menos 2 caracteres' 
        }]);
      }

      const limiteNum = parseInt(limite) || 10;
      const usuarios = await UsuarioService.buscarUsuarios(q.toString().trim(), limiteNum);

      return ResponseProvider.success(res, usuarios, 'Búsqueda realizada exitosamente');

    } catch (error) {
      console.error('Error al buscar usuarios:', error);
      return ResponseProvider.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Obtiene el perfil del usuario actual (igual que auth/perfil pero desde usuarios)
   * GET /api/usuarios/mi-perfil
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async obtenerMiPerfil(req, res) {
    try {
      const idUsuario = req.usuario.id_usuario;

      const usuario = await UsuarioService.obtenerUsuarioPorId(idUsuario);

      return ResponseProvider.success(res, usuario, 'Perfil obtenido exitosamente');

    } catch (error) {
      console.error('Error al obtener perfil:', error);
      
      if (error.message === 'Usuario no encontrado') {
        return ResponseProvider.noEncontrado(res, 'Usuario');
      }

      return ResponseProvider.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Actualiza el perfil del usuario actual
   * PUT /api/usuarios/mi-perfil
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async actualizarMiPerfil(req, res) {
    try {
      const idUsuario = req.usuario.id_usuario;
      const datosActualizar = req.body;

      // Los usuarios normales no pueden cambiar su rol
      if (req.usuario.nombre_rol !== 'Administrador') {
        delete datosActualizar.id_rol;
      }

      const usuarioActualizado = await UsuarioService.actualizarUsuario(idUsuario, datosActualizar);

      return ResponseProvider.success(res, usuarioActualizado, 'Perfil actualizado exitosamente');

    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      
      if (error.message === 'Usuario no encontrado') {
        return ResponseProvider.noEncontrado(res, 'Usuario');
      }

      if (error.message.includes('debe tener') || 
          error.message.includes('inválido')) {
        return ResponseProvider.errorValidacion(res, [{ 
          campo: 'general', 
          mensaje: error.message 
        }]);
      }

      return ResponseProvider.error(res, 'Error interno del servidor', 500);
    }
  }
}
