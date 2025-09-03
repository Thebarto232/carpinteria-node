import { ejecutarQuery } from '../utils/db.js';

class Direccion {
  /**
   * Actualiza o crea la dirección de un usuario
   * @param {number} id_usuario
   * @param {Object} datosDireccion
   * @returns {Promise<boolean>} true si se actualizó/creó correctamente
   */
  static async actualizarDireccion(id_usuario, datosDireccion) {
    try {
      // Verificar si ya existe dirección
      const queryExiste = 'SELECT id_direccion FROM Direcciones WHERE id_usuario = ?';
      const existe = await ejecutarQuery(queryExiste, [id_usuario]);
      if (existe.length > 0) {
        // Actualizar dirección
        const queryUpdate = `UPDATE Direcciones SET direccion = ?, ciudad = ?, departamento = ?, codigo_postal = ?, pais = ? WHERE id_usuario = ?`;
        await ejecutarQuery(queryUpdate, [
          datosDireccion.direccion,
          datosDireccion.ciudad,
          datosDireccion.departamento,
          datosDireccion.codigo_postal,
          datosDireccion.pais,
          id_usuario
        ]);
      } else {
        // Crear dirección
        await Direccion.crearDireccion({ id_usuario, ...datosDireccion });
      }
      return true;
    } catch (error) {
      console.error('Error al actualizar/crear dirección:', error);
      throw error;
    }
  }

  /**
   * Crea una dirección para un usuario
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
}

export default Direccion;
