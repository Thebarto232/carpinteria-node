/**
 * Script seed para crear usuarios iniciales
 * Utiliza el modelo Usuario para mantener consistencia con el hasheo de contraseñas
 */

import { Usuario } from "../src/models/Usuario.js";
import { ejecutarQuery } from "../src/utils/db.js";

async function crearUsuariosIniciales() {
  try {
    console.log('🌱 Iniciando seed de usuarios...');

    // Array de usuarios a crear
    const usuarios = [
      {
        nombre_usuario: 'Super Administrador',
        correo: 'superadmin@carpinteria.com',
        contraseña: 'superadmin123',
        telefono: '+57 300 000 0000',
        id_rol: 1, // Super Administrador
        estado: 'ACTIVO'
      },
      {
        nombre_usuario: 'Usuario de Prueba',
        correo: 'usuario@carpinteria.com',
        contraseña: 'usuario123',
        telefono: '+57 300 987 6543',
        id_rol: 2, // Usuario
        estado: 'ACTIVO'
      }
    ];

    let usuariosCreados = 0;
    let usuariosExistentes = 0;

    for (const datosUsuario of usuarios) {
      try {
        // Verificar si el usuario ya existe
        const usuarioExistente = await Usuario.buscarPorCorreo(datosUsuario.correo);
        
        if (usuarioExistente) {
          console.log(`⚠️  Usuario ya existe: ${datosUsuario.correo}`);
          usuariosExistentes++;
          continue;
        }

        // Crear el usuario usando el modelo (hashea automáticamente la contraseña)
        const idUsuarioCreado = await Usuario.crear(datosUsuario);
        
        if (idUsuarioCreado) {
          console.log(`✅ Usuario creado: ${datosUsuario.correo} | ID: ${idUsuarioCreado} | Contraseña: ${datosUsuario.contraseña}`);
          usuariosCreados++;
        } else {
          console.error(`❌ Error al crear usuario ${datosUsuario.correo}: No se obtuvo ID`);
        }
        
      } catch (error) {
        console.error(`❌ Error al procesar usuario ${datosUsuario.correo}:`, error.message);
      }
    }

    // Mostrar resumen
    console.log('\n📊 Resumen del seed:');
    console.log(`✅ Usuarios creados: ${usuariosCreados}`);
    console.log(`⚠️  Usuarios ya existentes: ${usuariosExistentes}`);
    console.log(`📋 Total procesados: ${usuarios.length}`);

    // Verificar usuarios creados
    const totalUsuarios = await ejecutarQuery('SELECT COUNT(*) as total FROM Usuarios');
    console.log(`\n📈 Total de usuarios en la base de datos: ${totalUsuarios[0].total}`);

  } catch (error) {
    console.error('❌ Error general en el seed:', error.message);
    throw error;
  }
}

// Ejecutar el seed
console.log('🚀 Ejecutando seed de usuarios...\n');

crearUsuariosIniciales()
  .then(() => {
    console.log('\n🎉 Seed completado exitosamente!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Error en el seed:', error);
    process.exit(1);
  });
