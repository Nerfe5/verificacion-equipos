// forzar_carga_equipos.js - Fuerza la carga inmediata de equipos
console.log('🚀 FORZANDO CARGA INMEDIATA DE EQUIPOS...');

function forzarCargaEquipos() {
  console.log('⚡ Iniciando carga forzada...');
  
  // 1. Verificar datos
  const equipos = JSON.parse(localStorage.getItem("equiposMedicos")) || [];
  console.log(`📊 Equipos en localStorage: ${equipos.length}`);
  
  // 2. Si no hay equipos, cargar datos de prueba
  if (equipos.length === 0) {
    console.log('📦 No hay equipos, cargando datos de prueba...');
    const btnPrueba = document.getElementById('cargarDatosPrueba');
    if (btnPrueba) {
      btnPrueba.click();
      setTimeout(forzarCargaEquipos, 2000); // Reintentar después de cargar
      return;
    }
  }
  
  // 3. Encontrar tabla
  const tabla = document.querySelector("#tabla-equipos tbody");
  if (!tabla) {
    console.error('❌ No se encontró la tabla tbody');
    return;
  }
  
  console.log('✅ Tabla encontrada, limpiando...');
  tabla.innerHTML = "";
  
  // 4. Cargar equipos directamente
  equipos.forEach((equipo, index) => {
    const fila = document.createElement("tr");
    
    // Datos básicos y seguros
    const nombre = equipo.nombre || 'Sin nombre';
    const serie = equipo.serie || 'Sin serie';
    const marca = equipo.marca || '';
    const modelo = equipo.modelo || '';
    const ubicacion = equipo.ubicacion || 'Sin ubicación';
    const estado = equipo.estado || 'operativo';
    const categoria = equipo.categoria || 'general';
    const responsable = equipo.responsable || 'No asignado';
    const proveedor = equipo.proveedor || 'No especificado';
    
    // Estados formateados
    const estadosFormateados = {
      'operativo': 'Operativo',
      'mantenimiento': 'En Mantenimiento', 
      'fuera-servicio': 'Fuera de Servicio',
      'en-calibracion': 'En Calibración'
    };
    
    const categoriasFormateadas = {
      'alta-tecnologia': 'Alta Tecnología',
      'soporte-vida': 'Soporte de Vida',
      'critico': 'Crítico',
      'general': 'General'
    };
    
    const estadoFormateado = estadosFormateados[estado] || estado;
    const categoriaFormateada = categoriasFormateadas[categoria] || categoria;
    
    // Crear fila
    fila.innerHTML = `
      <td>${serie}</td>
      <td>${nombre}</td>
      <td>${marca} ${modelo}</td>
      <td>${ubicacion}</td>
      <td><span class="estado ${estado}">${estadoFormateado}</span></td>
      <td>${categoriaFormateada}</td>
      <td>${responsable}</td>
      <td>${proveedor}</td>
      <td>Sin garantía</td>
      <td>Sin imagen</td>
      <td>
        <button class="btn-ver" onclick="verEquipo('${serie}')">Ver</button>
        <button class="btn-editar" onclick="editarEquipoForzado('${serie}')">Editar</button>
        <button class="btn-clonar" onclick="clonarEquipoForzado('${serie}')">Clonar</button>
        <button class="btn-eliminar" onclick="eliminarEquipoForzado('${serie}')">Eliminar</button>
      </td>
    `;
    
    tabla.appendChild(fila);
    console.log(`✅ Fila ${index + 1} agregada: ${nombre}`);
  });
  
  console.log(`🎉 ¡${equipos.length} equipos cargados EXITOSAMENTE!`);
}

// Funciones básicas para los botones
function verEquipo(serie) {
  const equipos = JSON.parse(localStorage.getItem("equiposMedicos")) || [];
  const equipo = equipos.find(e => e.serie === serie);
  if (equipo) {
    alert(`DETALLES DEL EQUIPO\n\nNombre: ${equipo.nombre}\nSerie: ${equipo.serie}\nUbicación: ${equipo.ubicacion}\nEstado: ${equipo.estado}\nResponsable: ${equipo.responsable || 'No asignado'}`);
  }
}

function editarEquipoForzado(serie) {
  if (typeof window.editarEquipo === 'function') {
    window.editarEquipo(serie);
  } else {
    alert('Función de edición no disponible. Serie: ' + serie);
  }
}

function clonarEquipoForzado(serie) {
  if (typeof window.clonarEquipo === 'function') {
    window.clonarEquipo(serie);
  } else {
    alert('Función de clonado no disponible. Serie: ' + serie);
  }
}

function eliminarEquipoForzado(serie) {
  if (confirm('¿Estás seguro de que deseas eliminar este equipo?')) {
    const equipos = JSON.parse(localStorage.getItem("equiposMedicos")) || [];
    const equiposFiltrados = equipos.filter(e => e.serie !== serie);
    localStorage.setItem("equiposMedicos", JSON.stringify(equiposFiltrados));
    
    // Recargar
    forzarCargaEquipos();
    
    // Actualizar dashboard
    if (typeof window.actualizarDashboard === 'function') {
      window.actualizarDashboard();
    }
    
    alert('Equipo eliminado correctamente.');
  }
}

// Ejecutar inmediatamente
setTimeout(forzarCargaEquipos, 1000);

// Hacer función disponible globalmente
window.forzarCargaEquipos = forzarCargaEquipos;

console.log('💡 Ejecuta forzarCargaEquipos() para recargar la tabla');
