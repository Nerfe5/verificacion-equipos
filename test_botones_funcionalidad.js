// test_botones_funcionalidad.js - Prueba específica para botones y funcionalidades
console.log('🧪 INICIANDO PRUEBA DE BOTONES Y FUNCIONALIDADES...');
console.log('===================================================');

// Función para esperar un tiempo
function esperar(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Función de prueba completa de botones
async function probarBotonesFuncionalidad() {
  console.log('🔍 1. VERIFICANDO EXISTENCIA DE BOTONES...');
  
  // Verificar que hay equipos en la tabla
  const tabla = document.querySelector("#tabla-equipos tbody");
  const filas = tabla ? tabla.children.length : 0;
  
  console.log(`📋 Filas en tabla: ${filas}`);
  
  if (filas === 0) {
    console.log('⚠️ No hay equipos en la tabla. Cargando datos de prueba...');
    
    const btnPrueba = document.getElementById('cargarDatosPrueba');
    if (btnPrueba) {
      btnPrueba.click();
      await esperar(2000);
    }
  }
  
  // Verificar botones en la primera fila
  const primeraFila = tabla.children[0];
  if (primeraFila) {
    const botonesEncontrados = {
      ver: primeraFila.querySelector('.btn-ver'),
      editar: primeraFila.querySelector('.btn-editar'),
      clonar: primeraFila.querySelector('.btn-clonar'),
      eliminar: primeraFila.querySelector('.btn-eliminar')
    };
    
    console.log('🔘 Botones encontrados:');
    Object.keys(botonesEncontrados).forEach(tipo => {
      const boton = botonesEncontrados[tipo];
      console.log(`  - ${tipo}: ${boton ? '✅ Sí' : '❌ No'}`);
    });
    
    console.log('\n🧪 2. PROBANDO FUNCIONALIDAD DE BOTONES...');
    
    // Probar botón VER
    if (botonesEncontrados.ver) {
      console.log('🔍 Probando botón VER...');
      try {
        botonesEncontrados.ver.click();
        await esperar(1000);
        console.log('✅ Botón VER funcionando');
      } catch (error) {
        console.log('❌ Error en botón VER:', error.message);
      }
    }
    
    await esperar(1000);
    
    // Probar botón CLONAR
    if (botonesEncontrados.clonar) {
      console.log('📋 Probando botón CLONAR...');
      try {
        botonesEncontrados.clonar.click();
        await esperar(1000);
        
        // Verificar si se llenó el formulario
        const nombreField = document.getElementById('nombre');
        const serieField = document.getElementById('serie');
        
        if (nombreField && nombreField.value.includes('(Copia)')) {
          console.log('✅ Botón CLONAR funcionando - formulario llenado');
        } else {
          console.log('⚠️ Botón CLONAR puede no estar funcionando correctamente');
        }
      } catch (error) {
        console.log('❌ Error en botón CLONAR:', error.message);
      }
    }
    
    await esperar(1000);
    
    // Probar botón EDITAR
    if (botonesEncontrados.editar) {
      console.log('✏️ Probando botón EDITAR...');
      try {
        botonesEncontrados.editar.click();
        await esperar(1000);
        
        // Verificar si aparece mensaje de edición
        const mensajeEdicion = document.querySelector('.mensaje-edicion');
        if (mensajeEdicion) {
          console.log('✅ Botón EDITAR funcionando - mensaje de edición mostrado');
          
          // Cancelar edición
          const btnCancelar = document.querySelector('.btn-cancelar-edicion');
          if (btnCancelar) {
            btnCancelar.click();
            console.log('✅ Edición cancelada correctamente');
          }
        } else {
          console.log('⚠️ Botón EDITAR puede no estar funcionando correctamente');
        }
      } catch (error) {
        console.log('❌ Error en botón EDITAR:', error.message);
      }
    }
    
    await esperar(1000);
    
    console.log('\n🧪 3. VERIFICANDO PERSISTENCIA TRAS ACCIONES...');
    
    // Verificar que los datos siguen ahí
    const equiposDespues = JSON.parse(localStorage.getItem("equiposMedicos")) || [];
    console.log(`📊 Equipos después de pruebas: ${equiposDespues.length}`);
    
    console.log('\n🧪 4. PROBANDO SISTEMA DE ALERTAS...');
    
    // Probar botón de configurar alertas
    const btnAlertas = document.getElementById('configurar-alertas');
    if (btnAlertas) {
      console.log('🔔 Probando sistema de alertas...');
      try {
        btnAlertas.click();
        await esperar(1000);
        
        // Verificar si se abrió el modal
        const modal = document.getElementById('modal-alertas');
        const modalVisible = modal && (modal.style.display !== 'none' || window.getComputedStyle(modal).display !== 'none');
        console.log(`🔔 Modal de alertas visible: ${modalVisible ? '✅ Sí' : '❌ No'}`);
        
        // Cerrar modal si está abierto
        if (modalVisible) {
          const btnCerrar = modal.querySelector('.close');
          if (btnCerrar) {
            btnCerrar.click();
          }
        }
      } catch (error) {
        console.log('❌ Error en sistema de alertas:', error.message);
      }
    }
    
  } else {
    console.log('❌ No se encontró ninguna fila en la tabla para probar');
  }
  
  console.log('\n✅ RESUMEN DE PRUEBA DE FUNCIONALIDADES:');
  console.log('==========================================');
  
  // Verificar funciones globales
  const funcionesDisponibles = {
    cargarEquipos: typeof window.cargarEquipos === 'function',
    actualizarDashboard: typeof window.actualizarDashboard === 'function',
    editarEquipo: typeof window.editarEquipo === 'function',
    clonarEquipo: typeof window.clonarEquipo === 'function',
    cancelarEdicion: typeof window.cancelarEdicion === 'function'
  };
  
  console.log('🔧 Funciones disponibles globalmente:');
  Object.keys(funcionesDisponibles).forEach(func => {
    console.log(`  - ${func}: ${funcionesDisponibles[func] ? '✅ Sí' : '❌ No'}`);
  });
  
  const totalFunciones = Object.keys(funcionesDisponibles).length;
  const funcionesFuncionando = Object.values(funcionesDisponibles).filter(Boolean).length;
  
  console.log(`\n📊 Estado general: ${funcionesFuncionando}/${totalFunciones} funciones disponibles`);
  
  if (funcionesFuncionando === totalFunciones) {
    console.log('🎉 ¡TODAS LAS FUNCIONALIDADES ESTÁN DISPONIBLES!');
  } else {
    console.log('⚠️ Algunas funcionalidades pueden no estar funcionando correctamente');
  }
  
  console.log('==========================================');
}

// Función para probar registro y edición completa
async function probarRegistroEdicionCompleta() {
  console.log('\n🧪 PRUEBA COMPLETA DE REGISTRO Y EDICIÓN');
  console.log('========================================');
  
  // 1. Registrar un equipo nuevo
  console.log('1️⃣ Registrando equipo de prueba...');
  
  const serieUnica = 'TEST-' + Date.now();
  
  // Llenar formulario
  document.getElementById('nombre').value = 'Equipo de Prueba Integral';
  document.getElementById('marca').value = 'Marca Test';
  document.getElementById('modelo').value = 'Modelo Test';
  document.getElementById('serie').value = serieUnica;
  document.getElementById('categoria').value = 'general';
  document.getElementById('estado').value = 'operativo';
  document.getElementById('ubicacion').value = 'Laboratorio Test';
  document.getElementById('responsable').value = 'Tester';
  document.getElementById('observaciones').value = 'Equipo para prueba integral';
  
  // Enviar formulario
  const form = document.getElementById('form-equipo');
  form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  
  await esperar(2000);
  
  // 2. Verificar que se registró
  const equipos = JSON.parse(localStorage.getItem("equiposMedicos")) || [];
  const equipoCreado = equipos.find(e => e.serie === serieUnica);
  
  if (equipoCreado) {
    console.log('✅ Equipo registrado correctamente');
    
    // 3. Probar edición
    console.log('2️⃣ Probando edición del equipo...');
    
    if (typeof window.editarEquipo === 'function') {
      window.editarEquipo(serieUnica);
      
      await esperar(1000);
      
      // Modificar algunos campos
      document.getElementById('ubicacion').value = 'Laboratorio Test - EDITADO';
      document.getElementById('observaciones').value = 'Equipo para prueba integral - EDITADO';
      
      // Enviar formulario en modo edición
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      
      await esperar(2000);
      
      // Verificar que se editó
      const equiposEditados = JSON.parse(localStorage.getItem("equiposMedicos")) || [];
      const equipoEditado = equiposEditados.find(e => e.serie === serieUnica);
      
      if (equipoEditado && equipoEditado.ubicacion.includes('EDITADO')) {
        console.log('✅ Edición funcionando correctamente');
      } else {
        console.log('❌ La edición no funcionó');
      }
      
      // 4. Probar clonado
      console.log('3️⃣ Probando clonado del equipo...');
      
      if (typeof window.clonarEquipo === 'function') {
        window.clonarEquipo(serieUnica);
        
        await esperar(1000);
        
        // Cambiar serie para el clon
        const serieClonada = 'CLONE-' + Date.now();
        document.getElementById('serie').value = serieClonada;
        
        // Enviar formulario para crear clon
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
        
        await esperar(2000);
        
        // Verificar que se clonó
        const equiposClonados = JSON.parse(localStorage.getItem("equiposMedicos")) || [];
        const equipoClonado = equiposClonados.find(e => e.serie === serieClonada);
        
        if (equipoClonado && equipoClonado.nombre.includes('(Copia)')) {
          console.log('✅ Clonado funcionando correctamente');
        } else {
          console.log('❌ El clonado no funcionó');
        }
      }
    }
  } else {
    console.log('❌ El equipo no se registró correctamente');
  }
  
  console.log('✅ PRUEBA COMPLETA FINALIZADA');
}

// Ejecutar pruebas después de 3 segundos
setTimeout(probarBotonesFuncionalidad, 3000);

// Hacer funciones disponibles globalmente
window.probarBotonesFuncionalidad = probarBotonesFuncionalidad;
window.probarRegistroEdicionCompleta = probarRegistroEdicionCompleta;

console.log('💡 Funciones de prueba disponibles:');
console.log('   - probarBotonesFuncionalidad()');
console.log('   - probarRegistroEdicionCompleta()');
