/**
 * Rutas para la gestión de categorías
 * Define todos los endpoints relacionados con categorías
 */

import { Router } from 'express';
import { CategoriaController } from '../controllers/CategoriaController.js';
import { verificarToken } from '../middlewares/auth/tokenMiddleware.js';
import { requierePermiso } from '../middlewares/auth/authMiddleware.js';

const router = Router();

/**
 * @route   GET /api/categorias
 * @desc    Obtener todas las categorías con paginación
 * @access  Requiere autenticación y permiso 'leer_categorias'
 * @query   {number} pagina - Número de página (opcional, default: 1)
 * @query   {number} limite - Límite de registros por página (opcional, default: 10)
 * @query   {string} busqueda - Término de búsqueda (opcional)
 */
router.get('/', 
  verificarToken, 
  requierePermiso('leer_categorias'), 
  CategoriaController.obtenerCategorias
);

/**
 * @route   GET /api/categorias/simple
 * @desc    Obtener todas las categorías sin paginación (para selects)
 * @access  Requiere autenticación y permiso 'leer_categorias'
 */
router.get('/simple', 
  verificarToken, 
  requierePermiso('leer_categorias'), 
  CategoriaController.obtenerCategoriasSimple
);

/**
 * @route   GET /api/categorias/:id
 * @desc    Obtener una categoría por ID
 * @access  Requiere autenticación y permiso 'leer_categorias'
 * @params  {number} id - ID de la categoría
 */
router.get('/:id', 
  verificarToken, 
  requierePermiso('leer_categorias'), 
  CategoriaController.obtenerCategoriaPorId
);

/**
 * @route   POST /api/categorias
 * @desc    Crear una nueva categoría
 * @access  Requiere autenticación y permiso 'crear_categorias'
 * @body    {string} nombre_categoria - Nombre de la categoría (requerido)
 * @body    {string} descripcion - Descripción de la categoría (opcional)
 */
router.post('/', 
  verificarToken, 
  requierePermiso('crear_categorias'), 
  CategoriaController.crearCategoria
);

/**
 * @route   PUT /api/categorias/:id
 * @desc    Actualizar una categoría existente
 * @access  Requiere autenticación y permiso 'actualizar_categorias'
 * @params  {number} id - ID de la categoría
 * @body    {string} nombre_categoria - Nombre de la categoría (requerido)
 * @body    {string} descripcion - Descripción de la categoría (opcional)
 */
router.put('/:id', 
  verificarToken, 
  requierePermiso('actualizar_categorias'), 
  CategoriaController.actualizarCategoria
);

/**
 * @route   DELETE /api/categorias/:id
 * @desc    Eliminar una categoría
 * @access  Requiere autenticación y permiso 'eliminar_categorias'
 * @params  {number} id - ID de la categoría
 */
router.delete('/:id', 
  verificarToken, 
  requierePermiso('eliminar_categorias'), 
  CategoriaController.eliminarCategoria
);

export default router;
