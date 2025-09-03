import db from '../utils/db.js';

export const getResenasByProducto = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.query(
            'SELECT r.*, u.nombre_usuario FROM Reseñas r JOIN Usuarios u ON r.id_usuario = u.id_usuario WHERE r.id_producto = ?',
            [id]
        );
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Error al obtener reseñas' });
    }
};

export const createResena = async (req, res) => {
    const { id } = req.params;
    const { calificacion, comentario } = req.body;
    const id_usuario = req.usuario?.id_usuario;
    try {
        await db.query(
            'INSERT INTO Reseñas (id_producto, id_usuario, calificacion, comentario) VALUES (?, ?, ?, ?)',
            [id, id_usuario, calificacion, comentario]
        );
        res.json({ success: true, message: 'Reseña creada correctamente' });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Error al crear la reseña' });
    }
};

export const updateResena = async (req, res) => {
    const { idResena } = req.params;
    const { calificacion, comentario } = req.body;
    const id_usuario = req.usuario?.id_usuario;
    try {
        await db.query(
            'UPDATE Reseñas SET calificacion = ?, comentario = ? WHERE id_reseña = ? AND id_usuario = ?',
            [calificacion, comentario, idResena, id_usuario]
        );
        res.json({ success: true, message: 'Reseña actualizada correctamente' });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Error al actualizar la reseña' });
    }
};

export const deleteResena = async (req, res) => {
    const { idResena } = req.params;
    const id_usuario = req.usuario?.id_usuario;
    try {
        await db.query(
            'DELETE FROM Reseñas WHERE id_reseña = ? AND id_usuario = ?',
            [idResena, id_usuario]
        );
        res.json({ success: true, message: 'Reseña eliminada correctamente' });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Error al eliminar la reseña' });
    }
};
