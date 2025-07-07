// test_variables_globales.js - Test específico para variables globales
console.log('🔍 Test específico de variables globales...');

setTimeout(() => {
  console.log('\n📊 VERIFICACIÓN DETALLADA DE VARIABLES:');
  
  // Verificar en diferentes contextos
  console.log('1. Verificación directa:');
  console.log('   typeof alertasActivas:', typeof alertasActivas);
  console.log('   typeof configuracionAlertas:', typeof configuracionAlertas);
  console.log('   typeof intervalVerificacionAlertas:', typeof intervalVerificacionAlertas);
  
  console.log('\n2. Verificación via window:');
  console.log('   typeof window.alertasActivas:', typeof window.alertasActivas);
  console.log('   typeof window.configuracionAlertas:', typeof window.configuracionAlertas);
  console.log('   typeof window.intervalVerificacionAlertas:', typeof window.intervalVerificacionAlertas);
  
  console.log('\n3. Valores reales:');
  try {
    console.log('   alertasActivas:', alertasActivas);
    console.log('   configuracionAlertas:', configuracionAlertas);
    console.log('   intervalVerificacionAlertas:', intervalVerificacionAlertas);
  } catch(e) {
    console.log('   Error al acceder a variables:', e.message);
  }
  
  console.log('\n4. Variables en window object:');
  const variablesEncontradas = Object.keys(window).filter(key => 
    key.includes('alertas') || key.includes('configuracion') || key.includes('equipo')
  );
  console.log('   Variables relacionadas encontradas:', variablesEncontradas);
  
}, 3000);

console.log('✅ Test de variables programado para 3 segundos');
