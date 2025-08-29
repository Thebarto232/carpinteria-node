/**
 * Controlador de       // Si no hay límite, traer todos los proveedores
      if (!limite) {
        const proveedores = await Proveedor.obtenerTodosSinPaginacion(busqueda, estado);
        return ResponseProvider.success(res, {
          message: "Proveedores obtenidos exitosamente",
          proveedores: proveedores
        });
      }s
 * Maneja todas las operaciones CRUD relacionadas con proveedores
 */

import { Proveedor } from "../models/Proveedor.js";
import { ResponseProvider } from "../providers/ResponseProvider.js";

export class ProveedorController {

  /**
   * Obtiene todos los proveedores con paginación y filtros
   * @param {Request} req - Objeto de solicitud HTTP
   * @param {Response} res - Objeto de respuesta HTTP
   */
  static async obtenerProveedores(req, res) {
    try {
      const { 
        pagina = 1, 
        limite = null, // Si no se especifica límite, traer todos
        busqueda = '' 
      } = req.query;
      
      // Si no hay límite, traer todos los proveedores
      if (!limite) {
        const proveedores = await Proveedor.obtenerTodosSinPaginacion(busqueda);
        return ResponseProvider.success(res, {
          message: "Proveedores obtenidos exitosamente",
          data: {
            proveedores: proveedores
          }
        });
      }
      
      const paginaNum = Math.max(1, parseInt(pagina));
      const limiteNum = Math.max(1, Math.min(100, parseInt(limite)));
      
      const resultado = await Proveedor.obtenerTodos(paginaNum, limiteNum, busqueda);
      
      return ResponseProvider.success(res, {
        message: "Proveedores obtenidos exitosamente",
        data: resultado
      });
      
    } catch (error) {
      console.error('Error en obtenerProveedores:', error);
      return ResponseProvider.error(res, {
        message: "Error interno del servidor",
        statusCode: 500
      });
    }
  }

  /**
   * Obtiene todos los proveedores sin paginación (para selects)
   * @param {Request} req - Objeto de solicitud HTTP
   * @param {Response} res - Objeto de respuesta HTTP
   */
  static async obtenerProveedoresSimple(req, res) {
    try {
      const proveedores = await Proveedor.obtenerTodosSimple();
      
      return ResponseProvider.success(res, {
        message: "Proveedores obtenidos exitosamente",
        data: proveedores
      });
      
    } catch (error) {
      console.error('Error en obtenerProveedoresSimple:', error);
      return ResponseProvider.error(res, {
        message: "Error interno del servidor",
        statusCode: 500
      });
    }
  }

  /**
   * Obtiene un proveedor por su ID
   * @param {Request} req - Objeto de solicitud HTTP
   * @param {Response} res - Objeto de respuesta HTTP
   */
  static async obtenerProveedorPorId(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(parseInt(id))) {
        return ResponseProvider.error(res, {
          message: "ID de proveedor inválido",
          statusCode: 400
        });
      }
      
      const proveedor = await Proveedor.buscarPorId(parseInt(id));
      
      if (!proveedor) {
        return ResponseProvider.error(res, {
          message: "Proveedor no encontrado",
          statusCode: 404
        });
      }
      
      return ResponseProvider.success(res, {
        message: "Proveedor obtenido exitosamente",
        data: proveedor
      });
      
    } catch (error) {
      console.error('Error en obtenerProveedorPorId:', error);
      return ResponseProvider.error(res, {
        message: "Error interno del servidor",
        statusCode: 500
      });
    }
  }

  /**
   * Crea un nuevo proveedor
   * @param {Request} req - Objeto de solicitud HTTP
   * @param {Response} res - Objeto de respuesta HTTP
   */
  static async crearProveedor(req, res) {
    try {
      const { 
        nombre_proveedor, 
        contacto_nombre, 
        contacto_email, 
        contacto_telefono, 
        direccion_fiscal 
      } = req.body;
      
      // Validaciones
      if (!nombre_proveedor || nombre_proveedor.trim() === '') {
        return ResponseProvider.error(res, {
          message: "El nombre del proveedor es requerido",
          statusCode: 400
        });
      }
      
      if (nombre_proveedor.length > 150) {
        return ResponseProvider.error(res, {
          message: "El nombre del proveedor no puede exceder 150 caracteres",
          statusCode: 400
        });
      }
      
      // Validar email si se proporciona
      if (contacto_email && contacto_email.trim() !== '') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(contacto_email)) {
          return ResponseProvider.error(res, {
            message: "El formato del email es inválido",
            statusCode: 400
          });
        }
        
        if (contacto_email.length > 100) {
          return ResponseProvider.error(res, {
            message: "El email no puede exceder 100 caracteres",
            statusCode: 400
          });
        }
      }
      
      const datosProveedor = {
        nombre_proveedor: nombre_proveedor.trim(),
        contacto_nombre: contacto_nombre ? contacto_nombre.trim() : null,
        contacto_email: contacto_email && contacto_email.trim() !== '' ? contacto_email.trim() : null,
        contacto_telefono: contacto_telefono ? contacto_telefono.trim() : null,
        direccion_fiscal: direccion_fiscal ? direccion_fiscal.trim() : null
      };
      
      const nuevoProveedorId = await Proveedor.crear(datosProveedor);
      const nuevoProveedor = await Proveedor.buscarPorId(nuevoProveedorId);
      
      return ResponseProvider.success(res, {
        message: "Proveedor creado exitosamente",
        data: nuevoProveedor,
        statusCode: 201
      });
      
    } catch (error) {
      console.error('Error en crearProveedor:', error);
      
      if (error.message === 'El email del proveedor ya existe') {
        return ResponseProvider.error(res, {
          message: "Ya existe un proveedor con ese email",
          statusCode: 409
        });
      }
      
      return ResponseProvider.error(res, {
        message: "Error interno del servidor",
        statusCode: 500
      });
    }
  }

  /**
   * Actualiza un proveedor existente
   * @param {Request} req - Objeto de solicitud HTTP
   * @param {Response} res - Objeto de respuesta HTTP
   */
  static async actualizarProveedor(req, res) {
    try {
      const { id } = req.params;
      const { 
        nombre_proveedor, 
        contacto_nombre, 
        contacto_email, 
        contacto_telefono, 
        direccion_fiscal 
      } = req.body;
      
      if (!id || isNaN(parseInt(id))) {
        return ResponseProvider.error(res, {
          message: "ID de proveedor inválido",
          statusCode: 400
        });
      }
      
      // Verificar que el proveedor existe
      const proveedorExistente = await Proveedor.buscarPorId(parseInt(id));
      if (!proveedorExistente) {
        return ResponseProvider.error(res, {
          message: "Proveedor no encontrado",
          statusCode: 404
        });
      }
      
      // Validaciones
      if (!nombre_proveedor || nombre_proveedor.trim() === '') {
        return ResponseProvider.error(res, {
          message: "El nombre del proveedor es requerido",
          statusCode: 400
        });
      }
      
      if (nombre_proveedor.length > 150) {
        return ResponseProvider.error(res, {
          message: "El nombre del proveedor no puede exceder 150 caracteres",
          statusCode: 400
        });
      }
      
      // Validar email si se proporciona
      if (contacto_email && contacto_email.trim() !== '') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(contacto_email)) {
          return ResponseProvider.error(res, {
            message: "El formato del email es inválido",
            statusCode: 400
          });
        }
        
        if (contacto_email.length > 100) {
          return ResponseProvider.error(res, {
            message: "El email no puede exceder 100 caracteres",
            statusCode: 400
          });
        }
      }
      
      const datosActualizar = {
        nombre_proveedor: nombre_proveedor.trim(),
        contacto_nombre: contacto_nombre ? contacto_nombre.trim() : null,
        contacto_email: contacto_email && contacto_email.trim() !== '' ? contacto_email.trim() : null,
        contacto_telefono: contacto_telefono ? contacto_telefono.trim() : null,
        direccion_fiscal: direccion_fiscal ? direccion_fiscal.trim() : null
      };
      
      const actualizado = await Proveedor.actualizar(parseInt(id), datosActualizar);
      
      if (!actualizado) {
        return ResponseProvider.error(res, {
          message: "No se pudo actualizar el proveedor",
          statusCode: 500
        });
      }
      
      const proveedorActualizado = await Proveedor.buscarPorId(parseInt(id));
      
      return ResponseProvider.success(res, {
        message: "Proveedor actualizado exitosamente",
        data: proveedorActualizado
      });
      
    } catch (error) {
      console.error('Error en actualizarProveedor:', error);
      
      if (error.message === 'El email del proveedor ya existe') {
        return ResponseProvider.error(res, {
          message: "Ya existe un proveedor con ese email",
          statusCode: 409
        });
      }
      
      return ResponseProvider.error(res, {
        message: "Error interno del servidor",
        statusCode: 500
      });
    }
  }

  /**
   * Elimina un proveedor
   * @param {Request} req - Objeto de solicitud HTTP
   * @param {Response} res - Objeto de respuesta HTTP
   */
  static async eliminarProveedor(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(parseInt(id))) {
        return ResponseProvider.error(res, {
          message: "ID de proveedor inválido",
          statusCode: 400
        });
      }
      
      // Verificar que el proveedor existe
      const proveedorExistente = await Proveedor.buscarPorId(parseInt(id));
      if (!proveedorExistente) {
        return ResponseProvider.error(res, {
          message: "Proveedor no encontrado",
          statusCode: 404
        });
      }
      
      const eliminado = await Proveedor.eliminar(parseInt(id));
      
      if (!eliminado) {
        return ResponseProvider.error(res, {
          message: "No se pudo eliminar el proveedor",
          statusCode: 500
        });
      }
      
      return ResponseProvider.success(res, {
        message: "Proveedor eliminado exitosamente",
        statusCode: 204
      });
      
    } catch (error) {
      console.error('Error en eliminarProveedor:', error);
      
      if (error.message === 'No se puede eliminar el proveedor porque tiene productos asociados') {
        return ResponseProvider.error(res, {
          message: "No se puede eliminar el proveedor porque tiene productos asociados",
          statusCode: 409
        });
      }
      
      return ResponseProvider.error(res, {
        message: "Error interno del servidor",
        statusCode: 500
      });
    }
  }
}
