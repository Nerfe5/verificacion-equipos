// debug_carga_tabla.js - Diagnóstico inmediato de tabla
console.log('🔍 DIAGNÓSTICO INMEDIATO DE TABLA');
console.log('================================');

function diagnosticarTabla() {
  console.log('1. VERIFICANDO DATOS EN LOCALSTORAGE...');
  const equipos = JSON.parse(localStorage.getItem("equiposMedicos")) || [];
  console.log(`📊 Equipos en localStorage: ${equipos.length}`);
  
  if (equipos.length > 0) {
    console.log('📋 Primeros 3 equipos:');
    equipos.slice(0, 3).forEach((equipo, index) => {
      console.log(`  ${index + 1}. ${equipo.nombre} (${equipo.serie})`);
    });
  }
  
  console.log('\n2. VERIFICANDO ELEMENTOS DE LA TABLA...');
  const tabla = document.getElementById("tabla-equipos");
  const tbody = document.querySelector("#tabla-equipos tbody");
  
  console.log(`📋 Tabla principal: ${tabla ? 'ENCONTRADA' : 'NO ENCONTRADA'}`);
  console.log(`📋 Tbody: ${tbody ? 'ENCONTRADO' : 'NO ENCONTRADO'}`);
  
  if (tbody) {
    console.log(`📋 Filas actuales en tbody: ${tbody.children.length}`);
    console.log(`📋 HTML del tbody: ${tbody.innerHTML.length > 0 ? 'TIENE CONTENIDO' : 'VACÍO'}`);
  }
  
  console.log('\n3. VERIFICANDO FUNCIONES CARGAREQUIPOS...');
  
  // Verificar qué función cargarEquipos está disponible
  if (typeof window.cargarEquipos === 'function') {
    console.log('✅ window.cargarEquipos disponible');
  } else {
    console.log('❌ window.cargarEquipos NO disponible');
  }
  
  if (typeof cargarEquipos === 'function') {
    console.log('✅ cargarEquipos local disponible');
  } else {
    console.log('❌ cargarEquipos local NO disponible');
  }
  
  console.log('\n4. INTENTANDO CARGAR EQUIPOS MANUALMENTE...');
  
  try {
    // Intentar cargar equipos directamente
    if (tbody && equipos.length > 0) {
      console.log('🔄 Limpiando tabla...');
      tbody.innerHTML = "";
      
      console.log('➕ Agregando equipos a la tabla...');
      equipos.forEach((equipo, index) => {
        const fila = document.createElement("tr");
        
        fila.innerHTML = `
          <td>${equipo.serie || 'Sin serie'}</td>
          <td>${equipo.nombre || 'Sin nombre'}</td>
          <td>${equipo.marca || ''} ${equipo.modelo || ''}</td>
          <td>${equipo.ubicacion || 'Sin ubicación'}</td>
          <td>${equipo.estado || 'Sin estado'}</td>
          <td>${equipo.categoria || 'Sin categoría'}</td>
          <td>${equipo.responsable || 'No asignado'}</td>
          <td>${equipo.proveedor || 'No especificado'}</td>
          <td>Sin garantía</td>
          <td>Sin imagen</td>
          <td>
            <button onclick="alert('Ver: ${equipo.nombre}')">Ver</button>
            <button onclick="alert('Editar: ${equipo.nombre}')">Editar</button>
            <button onclick="alert('Clonar: ${equipo.nombre}')">Clonar</button>
            <button onclick="alert('Eliminar: ${equipo.nombre}')">Eliminar</button>
          </td>
        `;
        
        tbody.appendChild(fila);
        console.log(`  ✅ Fila ${index + 1} agregada: ${equipo.nombre}`);
      });
      
      console.log(`✅ ${equipos.length} equipos agregados a la tabla`);
      
    } else if (!tbody) {
      console.log('❌ No se puede cargar: tbody no encontrado');
    } else if (equipos.length === 0) {
      console.log('❌ No se puede cargar: no hay equipos');
    }
    
  } catch (error) {
    console.error('❌ Error al cargar equipos manualmente:', error);
  }
  
  console.log('\n5. VERIFICACIÓN FINAL...');
  const filasFinales = tbody ? tbody.children.length : 0;
  console.log(`📋 Filas después del diagnóstico: ${filasFinales}`);
  
  if (filasFinales > 0) {
    console.log('🎉 ¡EQUIPOS CARGADOS EXITOSAMENTE!');
  } else {
    console.log('❌ Los equipos aún no se muestran');
  }
  
  console.log('================================');
}

// Ejecutar diagnóstico inmediatamente
setTimeout(diagnosticarTabla, 1000);

// Hacer función disponible globalmente
window.diagnosticarTabla = diagnosticarTabla;

console.log('💡 Ejecuta diagnosticarTabla() para verificar el estado de la tabla');
