/**
 * Rutas para la gestión de productos
 * Define todos los endpoints relacionados con productos
 */

import { Router } from 'express';
import { ProductoController } from '../controllers/ProductoController.js';
import { verificarToken } from '../middlewares/auth/tokenMiddleware.js';
import { requierePermiso } from '../middlewares/auth/authMiddleware.js';

const router = Router();

/**
 * @route   GET /api/productos
 * @desc    Obtener todos los productos con paginación y filtros
 * @access  Requiere autenticación y permiso 'leer_productos'
 * @query   {number} pagina - Número de página (opcional, default: 1)
 * @query   {number} limite - Límite de registros por página (opcional, default: 10)
 * @query   {string} busqueda - Término de búsqueda (opcional)
 * @query   {number} categoria - Filtro por categoría (opcional)
 * @query   {number} proveedor - Filtro por proveedor (opcional)
 * @query   {string} estado - Filtro por estado (opcional)
 */
router.get('/', 
  verificarToken, 
  requierePermiso('leer_productos'), 
  ProductoController.obtenerProductos
);

/**
 * @route   GET /api/productos/buscar
 * @desc    Buscar productos por nombre
 * @access  Requiere autenticación y permiso 'leer_productos'
 * @query   {string} nombre - Nombre del producto a buscar (requerido)
 */
router.get('/buscar', 
  verificarToken, 
  requierePermiso('leer_productos'), 
  ProductoController.buscarProductos
);

/**
 * @route   GET /api/productos/stock-bajo
 * @desc    Obtener productos con stock bajo
 * @access  Requiere autenticación y permiso 'leer_productos'
 * @query   {number} limite - Límite de stock considerado bajo (opcional, default: 10)
 */
router.get('/stock-bajo', 
  verificarToken, 
  requierePermiso('leer_productos'), 
  ProductoController.obtenerStockBajo
);

/**
 * @route   GET /api/productos/:id
 * @desc    Obtener un producto por ID
 * @access  Requiere autenticación y permiso 'leer_productos'
 * @params  {number} id - ID del producto
 */
router.get('/:id', 
  verificarToken, 
  requierePermiso('leer_productos'), 
  ProductoController.obtenerProductoPorId
);

/**
 * @route   POST /api/productos
 * @desc    Crear un nuevo producto
 * @access  Requiere autenticación y permiso 'crear_productos'
 * @body    {string} nombre_producto - Nombre del producto (requerido)
 * @body    {string} descripcion - Descripción del producto (opcional)
 * @body    {number} precio - Precio del producto (requerido)
 * @body    {number} stock - Stock inicial del producto (opcional, default: 0)
 * @body    {number} id_categoria - ID de la categoría (requerido)
 * @body    {number} id_proveedor - ID del proveedor (opcional)
 * @body    {string} estado - Estado del producto (opcional, default: 'DISPONIBLE')
 */
router.post('/', 
  verificarToken, 
  requierePermiso('crear_productos'), 
  ProductoController.crearProducto
);

/**
 * @route   PUT /api/productos/:id
 * @desc    Actualizar un producto existente
 * @access  Requiere autenticación y permiso 'actualizar_productos'
 * @params  {number} id - ID del producto
 * @body    {string} nombre_producto - Nombre del producto (requerido)
 * @body    {string} descripcion - Descripción del producto (opcional)
 * @body    {number} precio - Precio del producto (requerido)
 * @body    {number} stock - Stock del producto (opcional)
 * @body    {number} id_categoria - ID de la categoría (requerido)
 * @body    {number} id_proveedor - ID del proveedor (opcional)
 * @body    {string} estado - Estado del producto (opcional)
 */
router.put('/:id', 
  verificarToken, 
  requierePermiso('actualizar_productos'), 
  ProductoController.actualizarProducto
);

/**
 * @route   PATCH /api/productos/:id/stock
 * @desc    Actualizar solo el stock de un producto
 * @access  Requiere autenticación y permiso 'actualizar_productos'
 * @params  {number} id - ID del producto
 * @body    {number} stock - Nuevo stock del producto (requerido)
 */
router.patch('/:id/stock', 
  verificarToken, 
  requierePermiso('actualizar_productos'), 
  ProductoController.actualizarStock
);

/**
 * @route   DELETE /api/productos/:id
 * @desc    Eliminar un producto
 * @access  Requiere autenticación y permiso 'eliminar_productos'
 * @params  {number} id - ID del producto
 */
router.delete('/:id', 
  verificarToken, 
  requierePermiso('eliminar_productos'), 
  ProductoController.eliminarProducto
);

export default router;
