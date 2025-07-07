// debug_carga_main.js - Script para depurar la carga de main.js
console.log('🛠️ Iniciando debug de carga de main.js...');

// Verificar si main.js se está cargando
setTimeout(() => {
  console.log('🔍 Verificando carga de main.js después de 2 segundos...');
  
  // Verificar variables globales básicas
  console.log('📊 Variables globales disponibles:');
  console.log('- equiposOriginales:', typeof equiposOriginales !== 'undefined' ? '✅ Definida' : '❌ No definida');
  console.log('- equiposFiltrados:', typeof equiposFiltrados !== 'undefined' ? '✅ Definida' : '❌ No definida');
  console.log('- alertasActivas:', typeof alertasActivas !== 'undefined' ? '✅ Definida' : '❌ No definida');
  
  // Verificar funciones específicas
  console.log('📋 Funciones específicas:');
  console.log('- abrirConfiguracionAlertas:', typeof abrirConfiguracionAlertas !== 'undefined' ? '✅ Definida' : '❌ No definida');
  console.log('- cargarEquipos:', typeof cargarEquipos !== 'undefined' ? '✅ Definida' : '❌ No definida');
  
  // Verificar si hay errores en la consola
  console.log('🔍 Verificando errores...');
  
  // Si las variables no están definidas, hay un problema en main.js
  if (typeof alertasActivas === 'undefined') {
    console.error('❌ PROBLEMA CRÍTICO: main.js no se está ejecutando correctamente');
    console.log('🔧 Posibles causas:');
    console.log('1. Error de JavaScript que impide la ejecución');
    console.log('2. Problema en el orden de carga de scripts');
    console.log('3. Error de sintaxis no detectado');
    
    // Intentar cargar main.js manualmente
    console.log('🚀 Intentando recargar la página...');
    
    // Crear botón de recarga manual
    const btnRecarga = document.createElement('button');
    btnRecarga.textContent = '🔄 RECARGAR PÁGINA (Problema detectado)';
    btnRecarga.style.position = 'fixed';
    btnRecarga.style.top = '10px';
    btnRecarga.style.right = '10px';
    btnRecarga.style.zIndex = '9999';
    btnRecarga.style.padding = '10px 20px';
    btnRecarga.style.backgroundColor = '#dc3545';
    btnRecarga.style.color = 'white';
    btnRecarga.style.border = 'none';
    btnRecarga.style.borderRadius = '5px';
    btnRecarga.style.cursor = 'pointer';
    btnRecarga.onclick = () => location.reload();
    document.body.appendChild(btnRecarga);
    
  } else {
    console.log('✅ main.js se cargó correctamente');
    
    // Crear botón de test visual
    const btnTest = document.createElement('button');
    btnTest.textContent = '🧪 PROBAR BOTÓN ALERTAS';
    btnTest.style.position = 'fixed';
    btnTest.style.top = '10px';
    btnTest.style.right = '10px';
    btnTest.style.zIndex = '9999';
    btnTest.style.padding = '10px 20px';
    btnTest.style.backgroundColor = '#28a745';
    btnTest.style.color = 'white';
    btnTest.style.border = 'none';
    btnTest.style.borderRadius = '5px';
    btnTest.style.cursor = 'pointer';
    btnTest.onclick = () => {
      console.log('🎯 Probando botón configurar alertas...');
      const boton = document.getElementById('configurar-alertas');
      if (boton) {
        boton.click();
        console.log('✅ Click ejecutado en botón');
      } else {
        console.error('❌ Botón no encontrado');
      }
    };
    document.body.appendChild(btnTest);
  }
  
}, 2000);

// Interceptar errores de JavaScript
window.addEventListener('error', function(e) {
  console.error('🚨 ERROR JAVASCRIPT DETECTADO:');
  console.error('Archivo:', e.filename);
  console.error('Línea:', e.lineno);
  console.error('Columna:', e.colno);
  console.error('Mensaje:', e.message);
  console.error('Error completo:', e.error);
});

console.log('✅ Debug de carga configurado');
