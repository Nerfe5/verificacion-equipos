// ========================================
// PRUEBA DE FUNCIONES DE CANCELACIÓN
// ========================================

console.log('🔍 Probando funciones de cancelación...');

// Función para probar la cancelación
function probarCancelacion() {
  console.log('=== INICIANDO PRUEBA DE CANCELACIÓN ===');
  
  // 1. Verificar que las funciones existen
  console.log('✅ 1. Verificando funciones...');
  const funciones = [
    'editarEquipo',
    'clonarEquipo',
    'cancelarEdicion',
    'activarModoEdicion',
    'activarModoClonacion',
    'mostrarMensajeEdicion',
    'ocultarMensajeEdicion'
  ];
  
  funciones.forEach(nombre => {
    const existe = typeof window[nombre] === 'function';
    console.log(`   - ${nombre}: ${existe ? '✅ EXISTE' : '❌ NO EXISTE'}`);
  });
  
  // 2. Verificar elementos del formulario
  console.log('✅ 2. Verificando elementos del formulario...');
  const elementos = [
    'form-equipo',
    'btn-submit',
    'btn-cancelar'
  ];
  
  elementos.forEach(id => {
    const elemento = document.getElementById(id);
    console.log(`   - ${id}: ${elemento ? '✅ EXISTE' : '❌ NO EXISTE'}`);
  });
  
  // 3. Verificar estado inicial del botón cancelar
  const btnCancelar = document.getElementById('btn-cancelar');
  if (btnCancelar) {
    const esVisible = btnCancelar.style.display !== 'none';
    console.log(`   - Botón cancelar visible: ${esVisible ? '❌ VISIBLE (debería estar oculto)' : '✅ OCULTO'}`);
  }
  
  console.log('=== PRUEBA COMPLETADA ===');
  console.log('💡 Para probar manualmente:');
  console.log('   1. Carga datos de prueba');
  console.log('   2. Presiona "Editar" en cualquier equipo');
  console.log('   3. Verifica que aparezca el botón "Cancelar"');
  console.log('   4. Presiona "Cancelar" y verifica que se limpie el formulario');
}

// Ejecutar prueba automáticamente
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', probarCancelacion);
} else {
  probarCancelacion();
}

// También permitir ejecutar manualmente
window.probarCancelacion = probarCancelacion;
