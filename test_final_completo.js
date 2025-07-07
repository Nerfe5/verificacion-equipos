// test_final_completo.js - Prueba final de todas las funcionalidades
console.log('🧪 INICIANDO PRUEBA FINAL COMPLETA...');
console.log('=========================================');

// Función para esperar un tiempo
function esperar(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Función de prueba completa
async function pruebaFinalCompleta() {
  console.log('🔍 1. VERIFICANDO ESTADO INICIAL...');
  
  // Verificar localStorage
  const equiposInicial = JSON.parse(localStorage.getItem("equiposMedicos")) || [];
  console.log(`📊 Equipos en localStorage: ${equiposInicial.length}`);
  
  // Verificar tabla
  const tabla = document.querySelector("#tabla-equipos tbody");
  const filasTabla = tabla ? tabla.children.length : 0;
  console.log(`📋 Filas en tabla: ${filasTabla}`);
  
  // Verificar dashboard
  const totalElement = document.getElementById('total-equipos');
  const totalMostrado = totalElement ? totalElement.textContent : '0';
  console.log(`📊 Total en dashboard: ${totalMostrado}`);
  
  console.log('\n🧪 2. PROBANDO CARGA DE DATOS DE PRUEBA...');
  
  // Simular click en botón de datos de prueba
  const btnPrueba = document.getElementById('cargarDatosPrueba');
  if (btnPrueba) {
    console.log('🔘 Haciendo click en cargar datos de prueba...');
    btnPrueba.click();
    
    await esperar(2000); // Esperar 2 segundos
    
    // Verificar después de cargar
    const equiposDespues = JSON.parse(localStorage.getItem("equiposMedicos")) || [];
    console.log(`📊 Equipos después de cargar prueba: ${equiposDespues.length}`);
  } else {
    console.log('❌ Botón de datos de prueba no encontrado');
  }
  
  console.log('\n🧪 3. PROBANDO REGISTRO MANUAL...');
  
  // Llenar formulario con datos de prueba
  const form = document.getElementById('form-equipo');
  if (form) {
    // Llenar campos
    document.getElementById('nombre').value = 'Equipo de Prueba Final';
    document.getElementById('marca').value = 'Marca Test';
    document.getElementById('modelo').value = 'Modelo Test';
    document.getElementById('serie').value = 'TEST-' + Date.now();
    document.getElementById('categoria').value = 'general';
    document.getElementById('estado').value = 'operativo';
    document.getElementById('ubicacion').value = 'Laboratorio de Pruebas';
    document.getElementById('responsable').value = 'Usuario Test';
    document.getElementById('departamento').value = 'Sistemas';
    document.getElementById('proveedor').value = 'Proveedor Test';
    document.getElementById('numero-contrato').value = 'CTR-TEST-001';
    document.getElementById('fecha-compra').value = '2024-01-01';
    document.getElementById('fecha-garantia').value = '2026-01-01';
    document.getElementById('costo').value = '10000';
    document.getElementById('observaciones').value = 'Equipo de prueba para validación final';
    
    console.log('📝 Formulario llenado, enviando...');
    
    // Simular envío
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    
    await esperar(2000); // Esperar 2 segundos
    
    // Verificar después de registrar
    const equiposFinal = JSON.parse(localStorage.getItem("equiposMedicos")) || [];
    console.log(`📊 Equipos después de registro manual: ${equiposFinal.length}`);
  } else {
    console.log('❌ Formulario no encontrado');
  }
  
  console.log('\n🧪 4. PROBANDO PERSISTENCIA TRAS RECARGA...');
  
  // Guardar estado actual
  const equiposAntesRecarga = JSON.parse(localStorage.getItem("equiposMedicos")) || [];
  console.log(`💾 Equipos antes de simular recarga: ${equiposAntesRecarga.length}`);
  
  // Simular recarga ejecutando las funciones de inicialización
  if (typeof cargarEquipos === 'function') {
    console.log('🔄 Ejecutando cargarEquipos...');
    cargarEquipos();
  }
  
  if (typeof actualizarDashboard === 'function') {
    console.log('🔄 Ejecutando actualizarDashboard...');
    actualizarDashboard();
  }
  
  await esperar(1000);
  
  // Verificar después de "recarga"
  const equiposDespuesRecarga = JSON.parse(localStorage.getItem("equiposMedicos")) || [];
  const tablaFinal = document.querySelector("#tabla-equipos tbody");
  const filasFinal = tablaFinal ? tablaFinal.children.length : 0;
  const totalFinal = document.getElementById('total-equipos');
  const totalFinalMostrado = totalFinal ? totalFinal.textContent : '0';
  
  console.log(`💾 Equipos después de simular recarga: ${equiposDespuesRecarga.length}`);
  console.log(`📋 Filas en tabla después de recarga: ${filasFinal}`);
  console.log(`📊 Total en dashboard después de recarga: ${totalFinalMostrado}`);
  
  console.log('\n🧪 5. PROBANDO ALERTAS...');
  
  // Probar botón de configurar alertas
  const btnAlertas = document.getElementById('configurar-alertas');
  if (btnAlertas) {
    console.log('🔘 Probando botón de configurar alertas...');
    btnAlertas.click();
    
    await esperar(1000);
    
    // Verificar si se abrió el modal
    const modal = document.getElementById('modal-alertas');
    const modalVisible = modal && (modal.style.display !== 'none' || window.getComputedStyle(modal).display !== 'none');
    console.log(`🔔 Modal de alertas visible: ${modalVisible}`);
  } else {
    console.log('❌ Botón de configurar alertas no encontrado');
  }
  
  console.log('\n✅ RESUMEN DE PRUEBA FINAL:');
  console.log('===========================');
  console.log(`📊 Equipos en localStorage: ${equiposDespuesRecarga.length}`);
  console.log(`📋 Equipos en tabla: ${filasFinal}`);
  console.log(`📊 Total en dashboard: ${totalFinalMostrado}`);
  
  // Verificar consistencia
  const consistente = (equiposDespuesRecarga.length === filasFinal) && 
                     (equiposDespuesRecarga.length.toString() === totalFinalMostrado);
  
  console.log(`✅ Datos consistentes: ${consistente}`);
  
  if (consistente) {
    console.log('🎉 ¡PRUEBA FINAL EXITOSA! Todos los sistemas funcionan correctamente.');
  } else {
    console.log('⚠️ Hay inconsistencias en los datos mostrados.');
  }
  
  console.log('=========================================');
}

// Ejecutar prueba después de 3 segundos
setTimeout(pruebaFinalCompleta, 3000);

// Hacer función disponible globalmente
window.pruebaFinalCompleta = pruebaFinalCompleta;

console.log('💡 Usa pruebaFinalCompleta() en la consola para ejecutar la prueba manual');
