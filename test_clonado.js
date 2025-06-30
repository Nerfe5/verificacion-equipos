// Script de prueba para la funcionalidad de clonado

console.log('=== PRUEBA DE FUNCIONALIDAD DE CLONADO ===');

// Verificar que las funciones principales existen
function verificarFuncionalidad() {
  const funciones = [
    'clonarEquipo',
    'mostrarModalClonado', 
    'procesarClonado',
    'cerrarModalClonado',
    'verificarSerieExistente',
    'cargarEquipos',
    'actualizarDashboard'
  ];
  
  console.log('Verificando funciones necesarias:');
  funciones.forEach(func => {
    if (typeof window[func] === 'function') {
      console.log(`✅ ${func} - OK`);
    } else {
      console.log(`❌ ${func} - NO ENCONTRADA`);
    }
  });
}

// Verificar datos de prueba
function verificarDatos() {
  const equipos = JSON.parse(localStorage.getItem('equiposMedicos')) || [];
  console.log(`📊 Equipos en localStorage: ${equipos.length}`);
  
  if (equipos.length > 0) {
    console.log('Primer equipo:', equipos[0]);
    console.log('Series disponibles:', equipos.map(e => e.serie));
  } else {
    console.log('⚠️ No hay equipos. Usa el botón "Cargar Datos de Prueba"');
  }
}

// Función para simular clonado (solo para pruebas)
function simularClonado() {
  const equipos = JSON.parse(localStorage.getItem('equiposMedicos')) || [];
  if (equipos.length === 0) {
    console.log('⚠️ No hay equipos para clonar. Carga datos de prueba primero.');
    return;
  }
  
  const equipoOriginal = equipos[0];
  console.log('🔄 Simulando clonado del equipo:', equipoOriginal.nombre);
  console.log('Serie original:', equipoOriginal.serie);
  
  const nuevaSerie = equipoOriginal.serie + '_CLON';
  
  if (typeof verificarSerieExistente === 'function') {
    if (verificarSerieExistente(nuevaSerie)) {
      console.log('❌ La serie ya existe:', nuevaSerie);
    } else {
      console.log('✅ La serie está disponible:', nuevaSerie);
    }
  }
}

// Ejecutar verificaciones automáticamente
setTimeout(() => {
  console.log('\n=== EJECUTANDO VERIFICACIONES ===');
  verificarFuncionalidad();
  verificarDatos();
  simularClonado();
  console.log('\n=== PRUEBAS COMPLETADAS ===');
  console.log('Para probar manualmente:');
  console.log('1. Usa el botón "📋 Cargar Datos de Prueba"');
  console.log('2. Busca un equipo en la tabla y haz clic en "Clonar"');
  console.log('3. Ingresa un nuevo número de serie y confirma');
}, 1000);

// Función para probar desde la consola
window.probarClonado = function(serie) {
  if (typeof clonarEquipo === 'function') {
    clonarEquipo(serie);
  } else {
    console.log('❌ Función clonarEquipo no disponible');
  }
};
