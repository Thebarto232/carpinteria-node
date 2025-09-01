import db from '../utils/db.js';
import path from 'path';
import fs from 'fs';

export async function subirImagen(req, res) {
  const id_producto = req.params.id;
  console.log('Subir imagen', id_producto);
  console.log(req.body.file);
  if (!req.file) return res.status(400).json({ error: 'No se envió imagen' });
  const url_imagen = `/uploads/productos/${req.file.filename}`;
  try {
    await db.query('INSERT INTO Imagenes_Producto (id_producto, url_imagen) VALUES (?, ?)', [id_producto, url_imagen]);
    res.status(201).json({ message: 'Imagen subida', url_imagen });
  } catch (err) {
    res.status(500).json({ error: 'Error al guardar imagen en BD' });
  }
}

export async function listarImagenes(req, res) {
  const id_producto = req.params.id;
  try {
    const [imagenes] = await db.query('SELECT * FROM Imagenes_Producto WHERE id_producto = ?', [id_producto]);
    res.json(imagenes);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener imágenes' });
  }
}

export async function eliminarImagen(req, res) {
  const idImagen = req.params.idImagen;
  try {
    const [[imagen]] = await db.query('SELECT url_imagen FROM Imagenes_Producto WHERE id_imagen = ?', [idImagen]);
    if (!imagen) return res.status(404).json({ error: 'Imagen no encontrada' });
    const filePath = path.join(path.resolve(), 'public', imagen.url_imagen);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    await db.query('DELETE FROM Imagenes_Producto WHERE id_imagen = ?', [idImagen]);
    res.json({ message: 'Imagen eliminada' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar imagen' });
  }
}
