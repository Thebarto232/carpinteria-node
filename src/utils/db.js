/**
 * Configuración de conexión a la base de datos MySQL
 * Utiliza mysql2 con soporte para promesas
 */

import mysql from "mysql2/promise";
import dotenv from "dotenv";

// Cargar variables de entorno
dotenv.config();

/**
 * Pool de conexiones a la base de datos
 * Utiliza un pool para mejorar el rendimiento y manejar múltiples conexiones
 */
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'carpinteria',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

/**
 * Función para probar la conexión a la base de datos
 * @returns {Promise<boolean>} - True si la conexión es exitosa
 */
export const probarConexion = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conexión a la base de datos establecida correctamente');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error.message);
    return false;
  }
};

/**
 * Función para ejecutar queries con manejo de errores
 * @param {string} query - La consulta SQL a ejecutar
 * @param {Array} params - Los parámetros para la consulta
 * @returns {Promise<Array>} - Resultado de la consulta
 */
export const ejecutarQuery = async (query, params = []) => {
  try {
    const [rows] = await pool.execute(query, params);
    return rows;
  } catch (error) {
    console.error('Error al ejecutar consulta:', error.message);
    console.error('Query:', query);
    console.error('Params:', params);
    throw error;
  }
};

/**
 * Función para iniciar una transacción
 * @returns {Promise<Object>} - Objeto de conexión para la transacción
 */
export const iniciarTransaccion = async () => {
  const connection = await pool.getConnection();
  await connection.beginTransaction();
  return connection;
};

/**
 * Función para hacer commit de una transacción
 * @param {Object} connection - Objeto de conexión de la transacción
 */
export const confirmarTransaccion = async (connection) => {
  await connection.commit();
  connection.release();
};

/**
 * Función para hacer rollback de una transacción
 * @param {Object} connection - Objeto de conexión de la transacción
 */
export const revertirTransaccion = async (connection) => {
  await connection.rollback();
  connection.release();
};

// Probar la conexión al inicializar el módulo
probarConexion();

export default pool;
