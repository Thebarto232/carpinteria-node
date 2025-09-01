/**
 * Aplicación principal - API REST para sistema de carpintería
 * Maneja autenticación JWT, roles, permisos y gestión de usuarios
 * 
 * @author Tu nombre
 * @version 1.0.0
 */

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

// Importar routes
import authRoutes from "./src/routes/authRoutes.js";
import usuariosRoutes from "./src/routes/usuariosRoutes.js";
import rolesRoutes from "./src/routes/rolesRoutes.js";
import permisosRoutes from "./src/routes/permisosRoutes.js";
import categoriasRoutes from "./src/routes/categoriasRoutes.js";
import proveedoresRoutes from "./src/routes/proveedoresRoutes.js";
import productosRoutes from "./src/routes/productosRoutes.js";
import { carritoRoutes } from "./src/routes/carritoRoutes.js";
import ventasRoutes from "./src/routes/ventasRoutes.js";
import facturasRoutes from "./src/routes/facturasRoutes.js";

// Importar middleware de manejo de errores
import { errorHandler } from "./src/middlewares/errorHandler.js";

// Cargar variables de entorno
dotenv.config();

// Crear la instancia de Express
const app = express();

// Configuración de middlewares
/**
 * Habilita CORS para permitir peticiones desde el frontend
 */
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
})); 

/**
 * Permite que la aplicación acepte datos JSON
 */
app.use(bodyParser.json({ limit: '10mb' }));

/**
 * Permite el envío de datos de tipo urlencoded
 */
app.use(express.urlencoded({ extended: true }));

/**
 * Permite manejar cookies en las respuestas
 */
app.use(cookieParser());

// Routes de la API
/**
 * Ruta base para verificar que el servidor esté funcionando
 */
app.get('/api', (req, res) => {
  res.json({ 
    mensaje: 'API de Carpintería funcionando correctamente',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

/**
 * Routes de autenticación - login, registro, refresh token
 */
app.use("/api/auth", authRoutes);

/**
 * Routes de gestión de usuarios
 */
app.use("/api/usuarios", usuariosRoutes);

/**
 * Routes de gestión de roles
 */
app.use("/api/roles", rolesRoutes);

/**
 * Routes de gestión de permisos
 */
app.use("/api/permisos", permisosRoutes);

/**
 * Routes de gestión de categorías
 */
app.use("/api/categorias", categoriasRoutes);

/**
 * Routes de gestión de proveedores
 */
app.use("/api/proveedores", proveedoresRoutes);

/**
 * Routes de gestión de productos
 */
app.use("/api/productos", productosRoutes);

/**
 * Routes de gestión del carrito de compras
 */
app.use("/api/carrito", carritoRoutes);

/**
 * Routes de gestión de ventas
 */
app.use("/api/ventas", ventasRoutes);

/**
 * Routes de gestión de facturas
 */
app.use("/api/facturas", facturasRoutes);

/**
 * Middleware para manejo de errores - debe ir al final
 */
app.use(errorHandler);

/**
 * Manejo de rutas no encontradas
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    mensaje: `Ruta ${req.originalUrl} no encontrada`,
    error: 'ROUTE_NOT_FOUND'
  });
});

// Configuración del puerto y arranque del servidor
const port = process.env.PORT || 3000;

/**
 * Inicia el servidor en el puerto especificado
 */
app.listen(port, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
  console.log(`📚 Documentación de API disponible en http://localhost:${port}/api`);
  console.log(`🔑 Modo: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
