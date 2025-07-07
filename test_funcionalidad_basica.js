// ========================================
// SCRIPT DE PRUEBA FUNCIONALIDAD BÁSICA
// ========================================
// Este script verifica que las funciones básicas estén funcionando

console.log('=== INICIANDO PRUEBA DE FUNCIONALIDAD BÁSICA ===');

// Función para probar funcionalidad básica
function probarFuncionalidadBasica() {
  console.log('🔍 Probando funcionalidad básica...');
  
  // 1. Verificar que localStorage funciona
  console.log('✅ 1. Verificando localStorage...');
  const equipos = JSON.parse(localStorage.getItem("equiposMedicos")) || [];
  console.log(`   - Equipos en localStorage: ${equipos.length}`);
  
  // 2. Verificar que las funciones principales existen
  console.log('✅ 2. Verificando funciones principales...');
  const funciones = [
    'cargarEquipos',
    'actualizarDashboard',
    'agregarEquipo',
    'eliminarEquipo',
    'editarEquipo',
    'clonarEquipo',
    'verDetalles',
    'limpiarTodosLosDatos',
    'limpiarNumerosSerieProblematicos',
    'cargarDatosPrueba'
  ];
  
  funciones.forEach(nombre => {
    const existe = typeof window[nombre] === 'function';
    console.log(`   - ${nombre}: ${existe ? '✅ EXISTE' : '❌ NO EXISTE'}`);
  });
  
  // 3. Verificar elementos del DOM
  console.log('✅ 3. Verificando elementos del DOM...');
  const elementos = [
    'form-equipo',
    'tabla-equipos',
    'total-equipos',
    'equipos-operativos',
    'equipos-mantenimiento',
    'equipos-fuera-servicio',
    'cargarDatosPrueba',
    'limpiarDatos',
    'limpiarSeries'
  ];
  
  elementos.forEach(id => {
    const elemento = document.getElementById(id);
    console.log(`   - ${id}: ${elemento ? '✅ EXISTE' : '❌ NO EXISTE'}`);
  });
  
  // 4. Verificar que la tabla se puede cargar
  console.log('✅ 4. Probando cargar tabla...');
  try {
    cargarEquipos();
    console.log('   - cargarEquipos(): ✅ FUNCIONA');
  } catch (error) {
    console.log('   - cargarEquipos(): ❌ ERROR:', error.message);
  }
  
  // 5. Verificar que el dashboard se puede actualizar
  console.log('✅ 5. Probando actualizar dashboard...');
  try {
    actualizarDashboard();
    console.log('   - actualizarDashboard(): ✅ FUNCIONA');
  } catch (error) {
    console.log('   - actualizarDashboard(): ❌ ERROR:', error.message);
  }
  
  console.log('=== PRUEBA COMPLETADA ===');
}

// Ejecutar prueba cuando se cargue la página
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', probarFuncionalidadBasica);
} else {
  probarFuncionalidadBasica();
}

// También permitir ejecutar manualmente
window.probarFuncionalidadBasica = probarFuncionalidadBasica;
