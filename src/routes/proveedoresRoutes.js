/**
 * Rutas para la gestión de proveedores
 * Define todos los endpoints relacionados con proveedores
 */

import { Router } from 'express';
import { ProveedorController } from '../controllers/ProveedorController.js';
import { verificarToken } from '../middlewares/auth/tokenMiddleware.js';
import { requierePermiso } from '../middlewares/auth/authMiddleware.js';

const router = Router();

/**
 * @route   GET /api/proveedores
 * @desc    Obtener todos los proveedores con paginación
 * @access  Requiere autenticación y permiso 'leer_proveedores'
 * @query   {number} pagina - Número de página (opcional, default: 1)
 * @query   {number} limite - Límite de registros por página (opcional, default: 10)
 * @query   {string} busqueda - Término de búsqueda (opcional)
 */
router.get('/', 
  verificarToken, 
  requierePermiso('leer_proveedores'), 
  ProveedorController.obtenerProveedores
);

/**
 * @route   GET /api/proveedores/simple
 * @desc    Obtener todos los proveedores sin paginación (para selects)
 * @access  Requiere autenticación y permiso 'leer_proveedores'
 */
router.get('/simple', 
  verificarToken, 
  requierePermiso('leer_proveedores'), 
  ProveedorController.obtenerProveedoresSimple
);

/**
 * @route   GET /api/proveedores/:id
 * @desc    Obtener un proveedor por ID
 * @access  Requiere autenticación y permiso 'leer_proveedores'
 * @params  {number} id - ID del proveedor
 */
router.get('/:id', 
  verificarToken, 
  requierePermiso('leer_proveedores'), 
  ProveedorController.obtenerProveedorPorId
);

/**
 * @route   POST /api/proveedores
 * @desc    Crear un nuevo proveedor
 * @access  Requiere autenticación y permiso 'crear_proveedores'
 * @body    {string} nombre_proveedor - Nombre del proveedor (requerido)
 * @body    {string} contacto_nombre - Nombre del contacto (opcional)
 * @body    {string} contacto_email - Email del contacto (opcional)
 * @body    {string} contacto_telefono - Teléfono del contacto (opcional)
 * @body    {string} direccion_fiscal - Dirección fiscal (opcional)
 */
router.post('/', 
  verificarToken, 
  requierePermiso('crear_proveedores'), 
  ProveedorController.crearProveedor
);

/**
 * @route   PUT /api/proveedores/:id
 * @desc    Actualizar un proveedor existente
 * @access  Requiere autenticación y permiso 'actualizar_proveedores'
 * @params  {number} id - ID del proveedor
 * @body    {string} nombre_proveedor - Nombre del proveedor (requerido)
 * @body    {string} contacto_nombre - Nombre del contacto (opcional)
 * @body    {string} contacto_email - Email del contacto (opcional)
 * @body    {string} contacto_telefono - Teléfono del contacto (opcional)
 * @body    {string} direccion_fiscal - Dirección fiscal (opcional)
 */
router.put('/:id', 
  verificarToken, 
  requierePermiso('actualizar_proveedores'), 
  ProveedorController.actualizarProveedor
);

/**
 * @route   DELETE /api/proveedores/:id
 * @desc    Eliminar un proveedor
 * @access  Requiere autenticación y permiso 'eliminar_proveedores'
 * @params  {number} id - ID del proveedor
 */
router.delete('/:id', 
  verificarToken, 
  requierePermiso('eliminar_proveedores'), 
  ProveedorController.eliminarProveedor
);

export default router;
