-- Script de datos iniciales para el sistema de carpintería
-- Inserta roles básicos, permisos fundamentales y usuario administrador inicial

USE carpinteria;

-- Insertar permisos por módulo

-- Permiso especial: Acceso total
INSERT INTO Permisos (nombre_permiso, descripcion, modulo) VALUES 
('*', 'Permiso universal - acceso total a todas las funcionalidades del sistema', 'Sistema');

-- Módulo: Usuarios
INSERT INTO Permisos (nombre_permiso, descripcion, modulo) VALUES 
('crear_usuarios', 'Permite crear nuevos usuarios en el sistema', 'Usuarios'),
('leer_usuarios', 'Permite consultar información de usuarios', 'Usuarios'),
('actualizar_usuarios', 'Permite modificar información de usuarios existentes', 'Usuarios'),
('eliminar_usuarios', 'Permite eliminar usuarios del sistema', 'Usuarios');

-- Módulo: Roles
INSERT INTO Permisos (nombre_permiso, descripcion, modulo) VALUES 
('crear_roles', 'Permite crear nuevos roles en el sistema', 'Roles'),
('leer_roles', 'Permite consultar información de roles', 'Roles'),
('actualizar_roles', 'Permite modificar roles existentes', 'Roles'),
('eliminar_roles', 'Permite eliminar roles del sistema', 'Roles');

-- Módulo: Permisos (solo lectura - los permisos son parte de la lógica del sistema)
INSERT INTO Permisos (nombre_permiso, descripcion, modulo) VALUES 
('leer_permisos', 'Permite consultar información de permisos del sistema', 'Permisos');

-- Módulo: Direcciones
INSERT INTO Permisos (nombre_permiso, descripcion, modulo) VALUES 
('crear_direcciones', 'Permite crear nuevas direcciones de usuarios', 'Direcciones'),
('leer_direcciones', 'Permite consultar direcciones de usuarios', 'Direcciones'),
('actualizar_direcciones', 'Permite modificar direcciones existentes', 'Direcciones'),
('eliminar_direcciones', 'Permite eliminar direcciones', 'Direcciones');

-- Módulo: Proveedores
INSERT INTO Permisos (nombre_permiso, descripcion, modulo) VALUES 
('crear_proveedores', 'Permite crear nuevos proveedores', 'Proveedores'),
('leer_proveedores', 'Permite consultar información de proveedores', 'Proveedores'),
('actualizar_proveedores', 'Permite modificar proveedores existentes', 'Proveedores'),
('eliminar_proveedores', 'Permite eliminar proveedores', 'Proveedores');

-- Módulo: Categorías
INSERT INTO Permisos (nombre_permiso, descripcion, modulo) VALUES 
('crear_categorias', 'Permite crear nuevas categorías de productos', 'Categorias'),
('leer_categorias', 'Permite consultar categorías de productos', 'Categorias'),
('actualizar_categorias', 'Permite modificar categorías existentes', 'Categorias'),
('eliminar_categorias', 'Permite eliminar categorías', 'Categorias');

-- Módulo: Productos
INSERT INTO Permisos (nombre_permiso, descripcion, modulo) VALUES 
('crear_productos', 'Permite crear nuevos productos', 'Productos'),
('leer_productos', 'Permite consultar información de productos', 'Productos'),
('actualizar_productos', 'Permite modificar productos existentes', 'Productos'),
('eliminar_productos', 'Permite eliminar productos', 'Productos');

-- Módulo: Imágenes de Producto
INSERT INTO Permisos (nombre_permiso, descripcion, modulo) VALUES 
('crear_imagenes_producto', 'Permite subir nuevas imágenes de productos', 'Imagenes_Producto'),
('leer_imagenes_producto', 'Permite consultar imágenes de productos', 'Imagenes_Producto'),
('actualizar_imagenes_producto', 'Permite modificar imágenes de productos', 'Imagenes_Producto'),
('eliminar_imagenes_producto', 'Permite eliminar imágenes de productos', 'Imagenes_Producto');

-- Módulo: Reseñas
INSERT INTO Permisos (nombre_permiso, descripcion, modulo) VALUES 
('crear_reseñas', 'Permite crear nuevas reseñas de productos', 'Reseñas'),
('leer_reseñas', 'Permite consultar reseñas de productos', 'Reseñas'),
('actualizar_reseñas', 'Permite modificar reseñas existentes', 'Reseñas'),
('eliminar_reseñas', 'Permite eliminar reseñas', 'Reseñas');

-- Módulo: Carritos
INSERT INTO Permisos (nombre_permiso, descripcion, modulo) VALUES 
('crear_carritos', 'Permite crear nuevos carritos de compra', 'Carritos'),
('leer_carritos', 'Permite consultar carritos de compra', 'Carritos'),
('actualizar_carritos', 'Permite modificar carritos existentes', 'Carritos'),
('eliminar_carritos', 'Permite eliminar carritos', 'Carritos');

-- Módulo: Productos en Carrito
INSERT INTO Permisos (nombre_permiso, descripcion, modulo) VALUES 
('crear_productos_carrito', 'Permite agregar productos al carrito', 'Productos_Carrito'),
('leer_productos_carrito', 'Permite consultar productos en carritos', 'Productos_Carrito'),
('actualizar_productos_carrito', 'Permite modificar cantidad de productos en carrito', 'Productos_Carrito'),
('eliminar_productos_carrito', 'Permite quitar productos del carrito', 'Productos_Carrito');

-- Módulo: Ventas
INSERT INTO Permisos (nombre_permiso, descripcion, modulo) VALUES 
('crear_ventas', 'Permite registrar nuevas ventas', 'Ventas'),
('leer_ventas', 'Permite consultar información de ventas', 'Ventas'),
('actualizar_ventas', 'Permite modificar ventas existentes', 'Ventas'),
('eliminar_ventas', 'Permite eliminar/cancelar ventas', 'Ventas');

-- Módulo: Detalles de Venta
INSERT INTO Permisos (nombre_permiso, descripcion, modulo) VALUES 
('crear_detalles_venta', 'Permite crear detalles de venta', 'Detalles_Venta'),
('leer_detalles_venta', 'Permite consultar detalles de ventas', 'Detalles_Venta'),
('actualizar_detalles_venta', 'Permite modificar detalles de ventas', 'Detalles_Venta'),
('eliminar_detalles_venta', 'Permite eliminar detalles de ventas', 'Detalles_Venta');

-- Módulo: Facturas
INSERT INTO Permisos (nombre_permiso, descripcion, modulo) VALUES 
('crear_facturas', 'Permite generar nuevas facturas', 'Facturas'),
('leer_facturas', 'Permite consultar facturas', 'Facturas'),
('actualizar_facturas', 'Permite modificar facturas existentes', 'Facturas'),
('eliminar_facturas', 'Permite anular facturas', 'Facturas');

-- Insertar roles básicos
INSERT INTO Roles (nombre_rol, descripcion) VALUES 
('SuperAdmin', 'Acceso total e ilimitado al sistema - permisos universales'),
('Usuario', 'Usuario normal del sistema con permisos básicos de consulta');

-- Asignar permiso universal (*) al rol SuperAdmin
INSERT INTO Roles_Permisos (id_rol, id_permiso)
SELECT 1, id_permiso FROM Permisos WHERE nombre_permiso = '*';

-- Asignar permisos básicos de lectura al rol Usuario
INSERT INTO Roles_Permisos (id_rol, id_permiso)
SELECT 2, id_permiso FROM Permisos 
WHERE nombre_permiso IN (
    'leer_categorias',
    'leer_productos',
    'leer_reseñas',
    'crear_reseñas',
    'actualizar_reseñas',
    'eliminar_reseñas',
    'leer_carritos',
    'crear_carritos',
    'actualizar_carritos',
    'eliminar_carritos',
    'leer_productos_carrito',
    'crear_productos_carrito',
    'actualizar_productos_carrito',
    'eliminar_productos_carrito'
);

-- Los usuarios se crearán usando el script seed-usuarios.js
-- que utiliza el modelo Usuario para hashear correctamente las contraseñas

-- Insertar algunas categorías de ejemplo
INSERT INTO Categorias (nombre_categoria, descripcion) VALUES 
('Maderas', 'Todo tipo de maderas para carpintería'),
('Herrajes', 'Bisagras, cerraduras, manijas y otros herrajes'),
('Herramientas', 'Herramientas manuales y eléctricas para carpintería'),
('Barnices y Pinturas', 'Productos de acabado para madera'),
('Tornillería', 'Tornillos, clavos y elementos de fijación');

-- Mostrar resumen de datos insertados (sin usuarios, se crearán con el seed)
SELECT 'Roles creados:' as Resumen, COUNT(*) as Total FROM Roles
UNION ALL
SELECT 'Permisos creados:', COUNT(*) FROM Permisos
UNION ALL
SELECT 'Categorías creadas:', COUNT(*) FROM Categorias;

-- Nota: Los usuarios se crearán ejecutando: node seed-usuarios.js

-- Verificar asignación de permisos
SELECT 
    r.nombre_rol,
    COUNT(rp.id_permiso) as total_permisos
FROM Roles r
LEFT JOIN Roles_Permisos rp ON r.id_rol = rp.id_rol
GROUP BY r.id_rol, r.nombre_rol
ORDER BY r.id_rol;
