// fix_alertas.js - Solución rápida para el sistema de alertas
console.log('🔧 Aplicando fix para sistema de alertas...');

// Función para inicializar todo el sistema cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  console.log('✅ DOM cargado, inicializando sistemas...');
  
  // 1. FIX PARA SISTEMA DE ALERTAS
  if (typeof abrirConfiguracionAlertas === 'function') {
    console.log('✅ Función abrirConfiguracionAlertas disponible');
    
    const btnConfigurar = document.getElementById('configurar-alertas');
    if (btnConfigurar) {
      console.log('✅ Botón configurar-alertas encontrado');
      
      // Remover cualquier listener existente y agregar uno nuevo
      const newBtn = btnConfigurar.cloneNode(true);
      btnConfigurar.parentNode.replaceChild(newBtn, btnConfigurar);
      
      newBtn.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('🎯 Click en botón configurar alertas');
        abrirConfiguracionAlertas();
      });
      
      console.log('✅ Event listener de alertas configurado');
    }
  }
  
  // 2. FIX PARA SISTEMA DE EQUIPOS
  console.log('🛠️ Configurando sistema de equipos...');
  
  // Configurar formulario de equipos
  const formEquipo = document.getElementById('form-equipo');
  if (formEquipo) {
    console.log('✅ Formulario encontrado, configurando...');
    
    // Remover listeners existentes
    const newForm = formEquipo.cloneNode(true);
    formEquipo.parentNode.replaceChild(newForm, formEquipo);
    
    // Agregar nuevo event listener
    newForm.addEventListener('submit', function(e) {
      e.preventDefault();
      console.log('📝 Enviando formulario de equipo...');
      
      try {
        // Obtener datos del formulario
        const datosEquipo = {
          nombre: document.getElementById("nombre").value,
          marca: document.getElementById("marca").value,
          modelo: document.getElementById("modelo").value,
          serie: document.getElementById("serie").value,
          categoria: document.getElementById("categoria").value,
          estado: document.getElementById("estado").value,
          ubicacion: document.getElementById("ubicacion").value,
          responsable: document.getElementById("responsable").value || 'No asignado',
          departamento: document.getElementById("departamento").value || 'No especificado',
          proveedor: document.getElementById("proveedor").value,
          contrato: document.getElementById("numero-contrato").value,
          fechaCompra: document.getElementById("fecha-compra").value,
          fechaGarantia: document.getElementById("fecha-garantia").value,
          costo: document.getElementById("costo").value,
          imagen: document.getElementById("imagen").value,
          manual: document.getElementById("manual").value,
          observaciones: document.getElementById("observaciones").value,
          fechaRegistro: new Date().toISOString(),
          ultimaActualizacion: new Date().toISOString()
        };
        
        console.log('📋 Datos del equipo:', datosEquipo);
        
        // Validar datos mínimos
        if (!datosEquipo.nombre || !datosEquipo.serie) {
          alert('Por favor completa al menos el nombre y número de serie del equipo.');
          return;
        }
        
        // Obtener equipos existentes
        const equipos = JSON.parse(localStorage.getItem("equiposMedicos")) || [];
        console.log('📦 Equipos existentes:', equipos.length);
        
        // Verificar que el número de serie no existe
        const serieExiste = equipos.some(equipo => equipo.serie === datosEquipo.serie);
        if (serieExiste) {
          alert('Ya existe un equipo con ese número de serie. Por favor ingresa uno diferente.');
          return;
        }
        
        // Agregar nuevo equipo
        equipos.push(datosEquipo);
        localStorage.setItem("equiposMedicos", JSON.stringify(equipos));
        
        console.log('✅ Equipo guardado. Total equipos:', equipos.length);
        
        // Verificar si estamos editando o agregando
        if (newForm.dataset.editando) {
          // MODO EDICIÓN
          const serieOriginal = newForm.dataset.editando;
          console.log('✏️ Actualizando equipo existente:', serieOriginal);
          
          // Verificar que el nuevo número de serie no existe (si cambió)
          if (serieOriginal !== datosEquipo.serie && equipos.some(e => e.serie === datosEquipo.serie)) {
            alert('Ya existe un equipo con ese número de serie. Por favor ingresa uno diferente.');
            return;
          }
          
          // Encontrar y actualizar el equipo
          const index = equipos.findIndex(e => e.serie === serieOriginal);
          if (index !== -1) {
            equipos[index] = { ...equipos[index], ...datosEquipo };
            localStorage.setItem("equiposMedicos", JSON.stringify(equipos));
            
            // Cancelar modo edición
            cancelarEdicion();
            
            alert('✅ Equipo actualizado correctamente.');
            console.log('✅ Equipo actualizado:', datosEquipo.nombre);
          } else {
            alert('Error: No se pudo encontrar el equipo para actualizar.');
            return;
          }
        } else {
          // MODO REGISTRO NUEVO
          console.log('➕ Registrando nuevo equipo');
          
          // Limpiar formulario
          newForm.reset();
          
          alert('✅ Equipo registrado correctamente.');
          console.log('✅ Nuevo equipo registrado:', datosEquipo.nombre);
        }
        
        // Recargar tabla si la función existe
        if (typeof cargarEquipos === 'function') {
          cargarEquipos();
        }
        
        // Actualizar dashboard si la función existe
        if (typeof actualizarDashboard === 'function') {
          actualizarDashboard();
        }
        
      } catch (error) {
        console.error('❌ Error al guardar equipo:', error);
        alert('Error al guardar el equipo: ' + error.message);
      }
    });
    
    console.log('✅ Event listener del formulario configurado');
  } else {
    console.error('❌ Formulario de equipos no encontrado');
  }
  
  // 3. FIX PARA BOTÓN DE DATOS DE PRUEBA
  const btnDatosPrueba = document.getElementById('cargarDatosPrueba');
  if (btnDatosPrueba) {
    console.log('✅ Botón datos de prueba encontrado');
    
    // Remover listeners existentes
    const newBtnPrueba = btnDatosPrueba.cloneNode(true);
    btnDatosPrueba.parentNode.replaceChild(newBtnPrueba, btnDatosPrueba);
    
    newBtnPrueba.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('🧪 Cargando datos de prueba...');
      
      try {
        // Datos de prueba básicos
        const datosPrueba = [
          {
            nombre: "Monitor de Paciente",
            marca: "Philips",
            modelo: "IntelliVue MX450",
            serie: "PHI-001",
            categoria: "soporte-vida",
            estado: "operativo",
            ubicacion: "UCI - Cama 01",
            responsable: "Dr. García",
            departamento: "Cuidados Intensivos",
            proveedor: "Philips Healthcare",
            contrato: "CTR-2024-001",
            fechaCompra: "2024-01-15",
            fechaGarantia: "2027-01-15",
            costo: "25000",
            imagen: "",
            manual: "",
            observaciones: "Equipo de prueba para monitoreo vital",
            fechaRegistro: new Date().toISOString(),
            ultimaActualizacion: new Date().toISOString()
          },
          {
            nombre: "Ventilador Mecánico",
            marca: "Dräger",
            modelo: "Evita V300",
            serie: "DRA-002",
            categoria: "critico",
            estado: "mantenimiento",
            ubicacion: "UCI - Cama 03",
            responsable: "Ing. López",
            departamento: "Cuidados Intensivos",
            proveedor: "Dräger Medical",
            contrato: "CTR-2024-002",
            fechaCompra: "2024-02-10",
            fechaGarantia: "2025-02-10",
            costo: "45000",
            imagen: "",
            manual: "",
            observaciones: "En mantenimiento preventivo",
            fechaRegistro: new Date().toISOString(),
            ultimaActualizacion: new Date().toISOString()
          },
          {
            nombre: "Bomba de Infusión",
            marca: "B.Braun",
            modelo: "Perfusor Space",
            serie: "BBR-003",
            categoria: "general",
            estado: "operativo",
            ubicacion: "Quirófano 1",
            responsable: "Enfermera Martín",
            departamento: "Quirófano",
            proveedor: "B.Braun Medical",
            contrato: "CTR-2024-003",
            fechaCompra: "2024-03-05",
            fechaGarantia: "2026-03-05",
            costo: "8500",
            imagen: "",
            manual: "",
            observaciones: "Equipo para infusión de medicamentos",
            fechaRegistro: new Date().toISOString(),
            ultimaActualizacion: new Date().toISOString()
          }
        ];
        
        // Obtener equipos existentes
        const equiposExistentes = JSON.parse(localStorage.getItem("equiposMedicos")) || [];
        
        // Agregar solo los equipos que no existan
        let equiposAgregados = 0;
        datosPrueba.forEach(equipoPrueba => {
          const existe = equiposExistentes.some(e => e.serie === equipoPrueba.serie);
          if (!existe) {
            equiposExistentes.push(equipoPrueba);
            equiposAgregados++;
          }
        });
        
        // Guardar en localStorage
        localStorage.setItem("equiposMedicos", JSON.stringify(equiposExistentes));
        
        console.log(`✅ ${equiposAgregados} equipos de prueba agregados. Total: ${equiposExistentes.length}`);
        
        // Recargar interfaz
        if (typeof cargarEquipos === 'function') {
          cargarEquipos();
        }
        if (typeof actualizarDashboard === 'function') {
          actualizarDashboard();
        }
        
        alert(`✅ Se cargaron ${equiposAgregados} equipos de prueba.\nTotal de equipos: ${equiposExistentes.length}`);
        
      } catch (error) {
        console.error('❌ Error al cargar datos de prueba:', error);
        alert('Error al cargar datos de prueba: ' + error.message);
      }
    });
    
    console.log('✅ Event listener de datos de prueba configurado');
  }
  
  // 4. CARGAR EQUIPOS EXISTENTES AL INICIAR
  console.log('📦 Cargando equipos existentes...');
  const equiposGuardados = JSON.parse(localStorage.getItem("equiposMedicos")) || [];
  console.log(`📊 Equipos en localStorage: ${equiposGuardados.length}`);
  
});

// FUNCIONES AUXILIARES FALTANTES
function actualizarEquiposAtencion() {
  console.log('📋 Actualizando equipos que requieren atención...');
  
  try {
    const equipos = JSON.parse(localStorage.getItem("equiposMedicos")) || [];
    const container = document.getElementById('equipos-atencion');
    
    if (!container) {
      console.log('⚠️ Container equipos-atencion no encontrado');
      return;
    }
    
    // Limpiar container
    container.innerHTML = '';
    
    // Filtrar equipos que requieren atención
    const equiposAtencion = equipos.filter(equipo => {
      // Equipos fuera de servicio
      if (equipo.estado === 'fuera-servicio') return true;
      
      // Equipos críticos en mantenimiento
      if ((equipo.categoria === 'critico' || equipo.categoria === 'soporte-vida') && 
          equipo.estado === 'mantenimiento') return true;
      
      // Garantías vencidas
      if (equipo.fechaGarantia) {
        const vencimiento = new Date(equipo.fechaGarantia);
        const ahora = new Date();
        const diasRestantes = Math.ceil((vencimiento - ahora) / (1000 * 60 * 60 * 24));
        if (diasRestantes < 0) return true; // Vencida
        if (diasRestantes <= 30) return true; // Por vencer
      }
      
      return false;
    });
    
    if (equiposAtencion.length === 0) {
      container.innerHTML = '<p class="no-atencion">✅ No hay equipos que requieran atención inmediata</p>';
      return;
    }
    
    // Mostrar equipos que requieren atención
    equiposAtencion.forEach(equipo => {
      const div = document.createElement('div');
      div.className = 'equipo-atencion-item';
      
      let razon = '';
      let clase = '';
      
      if (equipo.estado === 'fuera-servicio') {
        razon = 'Fuera de servicio';
        clase = 'critico';
      } else if (equipo.estado === 'mantenimiento') {
        razon = 'En mantenimiento';
        clase = 'advertencia';
      } else if (equipo.fechaGarantia) {
        const vencimiento = new Date(equipo.fechaGarantia);
        const ahora = new Date();
        const diasRestantes = Math.ceil((vencimiento - ahora) / (1000 * 60 * 60 * 24));
        if (diasRestantes < 0) {
          razon = 'Garantía vencida';
          clase = 'critico';
        } else if (diasRestantes <= 30) {
          razon = `Garantía vence en ${diasRestantes} días`;
          clase = 'advertencia';
        }
      }
      
      div.innerHTML = `
        <div class="equipo-info">
          <strong>${equipo.nombre}</strong> (${equipo.serie})
          <span class="ubicacion">${equipo.ubicacion}</span>
        </div>
        <div class="atencion-razon ${clase}">${razon}</div>
      `;
      
      container.appendChild(div);
    });
    
    console.log(`✅ ${equiposAtencion.length} equipos requieren atención`);
    
  } catch (error) {
    console.error('❌ Error al actualizar equipos de atención:', error);
  }
}

// Función auxiliar para cargar equipos en la tabla - VERSIÓN ROBUSTA
function cargarEquipos() {
  console.log('📋 [FIX] Cargando equipos en la tabla...');
  
  try {
    const equipos = JSON.parse(localStorage.getItem("equiposMedicos")) || [];
    console.log(`📊 Equipos encontrados: ${equipos.length}`);
    
    // Buscar tabla con múltiples selectores
    let tabla = document.querySelector("#tabla-equipos tbody");
    if (!tabla) {
      tabla = document.getElementById("tabla-equipos")?.querySelector("tbody");
    }
    if (!tabla) {
      console.error('❌ Tabla tbody NO encontrada');
      
      // Intentar encontrar la tabla principal
      const tablaMain = document.getElementById("tabla-equipos");
      console.log(`📋 Tabla principal: ${tablaMain ? 'ENCONTRADA' : 'NO ENCONTRADA'}`);
      
      if (tablaMain) {
        console.log('📋 HTML de tabla:', tablaMain.outerHTML.substring(0, 200) + '...');
      }
      return;
    }
    
    console.log('✅ Tabla tbody encontrada');
    
    // Limpiar tabla completamente
    tabla.innerHTML = "";
    console.log('🧹 Tabla limpiada');
    
    if (equipos.length === 0) {
      console.log('📭 No hay equipos para mostrar');
      tabla.innerHTML = '<tr><td colspan="11" style="text-align: center; padding: 20px; color: #666;">No hay equipos registrados</td></tr>';
      return;
    }
    
    // Agregar cada equipo a la tabla
    equipos.forEach((equipo, index) => {
      console.log(`➕ Agregando equipo ${index + 1}: ${equipo.nombre}`);
      
      const fila = document.createElement("tr");
      
      // Determinar estado de garantía de forma segura
      let estadoGarantia = 'Sin garantía';
      let claseGarantia = 'sin-garantia';
      
      if (equipo.fechaGarantia) {
        try {
          const vencimiento = new Date(equipo.fechaGarantia);
          const ahora = new Date();
          const diasRestantes = Math.ceil((vencimiento - ahora) / (1000 * 60 * 60 * 24));
          
          if (diasRestantes < 0) {
            estadoGarantia = 'Vencida';
            claseGarantia = 'vencida';
          } else if (diasRestantes <= 30) {
            estadoGarantia = `${diasRestantes} días`;
            claseGarantia = 'por-vencer';
          } else {
            estadoGarantia = 'Vigente';
            claseGarantia = 'vigente';
          }
        } catch (error) {
          console.log('⚠️ Error al calcular garantía:', error);
        }
      }
      
      // Escapar datos de forma segura
      const datosSeguro = {
        serie: (equipo.serie || '').replace(/'/g, "\\'").replace(/"/g, "&quot;"),
        nombre: equipo.nombre || 'Sin nombre',
        marca: equipo.marca || '',
        modelo: equipo.modelo || '',
        ubicacion: equipo.ubicacion || 'Sin ubicación',
        estado: equipo.estado || 'sin-estado',
        categoria: equipo.categoria || 'sin-categoria',
        responsable: equipo.responsable || 'No asignado',
        proveedor: equipo.proveedor || 'No especificado'
      };
      
      // Formatear estado y categoría de forma segura
      const estadoFormateado = formatearEstadoSeguro(datosSeguro.estado);
      const categoriaFormateada = formatearCategoriaSegura(datosSeguro.categoria);
      
      fila.innerHTML = `
        <td>${datosSeguro.serie}</td>
        <td>${datosSeguro.nombre}</td>
        <td>${datosSeguro.marca} ${datosSeguro.modelo}</td>
        <td>${datosSeguro.ubicacion}</td>
        <td><span class="estado ${datosSeguro.estado}">${estadoFormateado}</span></td>
        <td>${categoriaFormateada}</td>
        <td>${datosSeguro.responsable}</td>
        <td>${datosSeguro.proveedor}</td>
        <td><span class="garantia ${claseGarantia}">${estadoGarantia}</span></td>
        <td>${equipo.imagen ? `<a href="${equipo.imagen}" target="_blank">Ver imagen</a>` : 'Sin imagen'}</td>
        <td>
          <button class="btn-ver" data-serie="${datosSeguro.serie}">Ver</button>
          <button class="btn-editar" data-serie="${datosSeguro.serie}">Editar</button>
          <button class="btn-clonar" data-serie="${datosSeguro.serie}">Clonar</button>
          <button class="btn-eliminar" data-serie="${datosSeguro.serie}">Eliminar</button>
        </td>
      `;
      
      // Agregar fila a la tabla
      tabla.appendChild(fila);
      
      // Agregar event listeners a los botones de esta fila
      try {
        const btnVer = fila.querySelector('.btn-ver');
        const btnEditar = fila.querySelector('.btn-editar');
        const btnClonar = fila.querySelector('.btn-clonar');
        const btnEliminar = fila.querySelector('.btn-eliminar');
        
        if (btnVer) {
          btnVer.addEventListener('click', () => {
            console.log('🔍 Ver detalles del equipo:', equipo.serie);
            if (typeof verDetalles === 'function') {
              verDetalles(equipo.serie);
            } else {
              mostrarDetallesBasico(equipo);
            }
          });
        }
        
        if (btnEditar) {
          btnEditar.addEventListener('click', () => {
            console.log('✏️ Editar equipo:', equipo.serie);
            editarEquipo(equipo.serie);
          });
        }
        
        if (btnClonar) {
          btnClonar.addEventListener('click', () => {
            console.log('📋 Clonar equipo:', equipo.serie);
            clonarEquipo(equipo.serie);
          });
        }
        
        if (btnEliminar) {
          btnEliminar.addEventListener('click', () => {
            console.log('🗑️ Eliminar equipo:', equipo.serie);
            if (typeof eliminarEquipo === 'function') {
              eliminarEquipo(equipo.serie);
            } else {
              eliminarEquipoBasico(equipo.serie);
            }
          });
        }
        
        console.log(`✅ Event listeners agregados para: ${datosSeguro.nombre}`);
        
      } catch (error) {
        console.error('❌ Error al agregar event listeners:', error);
      }
    });
    
    console.log(`✅ [FIX] ${equipos.length} equipos cargados en la tabla EXITOSAMENTE`);
    console.log(`📋 Filas en tabla después de cargar: ${tabla.children.length}`);
    
  } catch (error) {
    console.error('❌ [FIX] Error al cargar equipos:', error);
  }
}

// Funciones auxiliares de formato seguras
function formatearEstadoSeguro(estado) {
  const estados = {
    'operativo': 'Operativo',
    'mantenimiento': 'En Mantenimiento',
    'fuera-servicio': 'Fuera de Servicio',
    'en-calibracion': 'En Calibración'
  };
  return estados[estado] || (estado || 'Sin Estado');
}

function formatearCategoriaSegura(categoria) {
  const categorias = {
    'alta-tecnologia': 'Alta Tecnología',
    'soporte-vida': 'Soporte de Vida',
    'critico': 'Crítico',
    'general': 'General'
  };
  return categorias[categoria] || (categoria || 'Sin Categoría');
}

// Función básica para mostrar detalles
function mostrarDetallesBasico(equipo) {
  const detalle = `
DETALLES DEL EQUIPO
==================
Nombre: ${equipo.nombre || 'Sin nombre'}
Marca: ${equipo.marca || 'Sin marca'}
Modelo: ${equipo.modelo || 'Sin modelo'}
Serie: ${equipo.serie || 'Sin serie'}
Ubicación: ${equipo.ubicacion || 'Sin ubicación'}
Estado: ${formatearEstadoSeguro(equipo.estado)}
Categoría: ${formatearCategoriaSegura(equipo.categoria)}
Responsable: ${equipo.responsable || 'No asignado'}
Proveedor: ${equipo.proveedor || 'No especificado'}
Observaciones: ${equipo.observaciones || 'Sin observaciones'}
==================
  `;
  alert(detalle);
}

// Función básica para eliminar equipo
function eliminarEquipoBasico(serie) {
  if (confirm('¿Estás seguro de que deseas eliminar este equipo? Esta acción no se puede deshacer.')) {
    try {
      const equipos = JSON.parse(localStorage.getItem("equiposMedicos")) || [];
      const equiposFiltrados = equipos.filter(e => e.serie !== serie);
      localStorage.setItem("equiposMedicos", JSON.stringify(equiposFiltrados));
      
      // Recargar tabla y dashboard
      cargarEquipos();
      if (typeof actualizarDashboard === 'function') {
        actualizarDashboard();
      }
      
      alert('✅ Equipo eliminado correctamente.');
      console.log('✅ Equipo eliminado:', serie);
    } catch (error) {
      console.error('❌ Error al eliminar equipo:', error);
      alert('Error al eliminar el equipo.');
    }
  }
}
      
      btnClonar.addEventListener('click', () => {
        console.log('📋 Clonar equipo:', equipo.serie);
        clonarEquipo(equipo.serie);
      });
      
      btnEliminar.addEventListener('click', () => {
        console.log('🗑️ Eliminar equipo:', equipo.serie);
        if (typeof eliminarEquipo === 'function') {
          eliminarEquipo(equipo.serie);
        } else {
          // Función básica de eliminar
          if (confirm('¿Estás seguro de que deseas eliminar este equipo? Esta acción no se puede deshacer.')) {
            const equipos = JSON.parse(localStorage.getItem("equiposMedicos")) || [];
            const equiposFiltrados = equipos.filter(e => e.serie !== equipo.serie);
            localStorage.setItem("equiposMedicos", JSON.stringify(equiposFiltrados));
            cargarEquipos();
            actualizarDashboard();
            alert('Equipo eliminado correctamente.');
          }
        }
      });
      
      tabla.appendChild(fila);
    });
    
    console.log(`✅ [FIX] ${equipos.length} equipos cargados en la tabla EXITOSAMENTE`);
    console.log(`📋 Filas en tabla después de cargar: ${tabla.children.length}`);
    
// FUNCIÓN PARA EDITAR EQUIPO
function editarEquipo(serie) {
  console.log('✏️ Iniciando edición de equipo:', serie);
  
  try {
    const equipos = JSON.parse(localStorage.getItem("equiposMedicos")) || [];
    const equipo = equipos.find(e => e.serie === serie);
    
    if (!equipo) {
      alert('Equipo no encontrado.');
      return;
    }
    
    // Llenar el formulario con los datos del equipo
    document.getElementById("nombre").value = equipo.nombre || '';
    document.getElementById("marca").value = equipo.marca || '';
    document.getElementById("modelo").value = equipo.modelo || '';
    document.getElementById("serie").value = equipo.serie || '';
    document.getElementById("categoria").value = equipo.categoria || '';
    document.getElementById("estado").value = equipo.estado || '';
    document.getElementById("ubicacion").value = equipo.ubicacion || '';
    document.getElementById("responsable").value = equipo.responsable || '';
    document.getElementById("departamento").value = equipo.departamento || '';
    document.getElementById("proveedor").value = equipo.proveedor || '';
    document.getElementById("numero-contrato").value = equipo.contrato || '';
    document.getElementById("fecha-compra").value = equipo.fechaCompra || '';
    document.getElementById("fecha-garantia").value = equipo.fechaGarantia || '';
    document.getElementById("costo").value = equipo.costo || '';
    document.getElementById("imagen").value = equipo.imagen || '';
    document.getElementById("manual").value = equipo.manual || '';
    document.getElementById("observaciones").value = equipo.observaciones || '';
    
    // Marcar el formulario como en modo edición
    const form = document.getElementById('form-equipo');
    form.dataset.editando = serie;
    
    // Mostrar mensaje de edición
    mostrarMensajeEdicion(equipo.nombre);
    
    // Hacer scroll al formulario
    document.getElementById('seccion-registro').scrollIntoView({ behavior: 'smooth' });
    
    console.log('✅ Formulario llenado para edición');
    
  } catch (error) {
    console.error('❌ Error al editar equipo:', error);
    alert('Error al cargar los datos del equipo para edición.');
  }
}

// FUNCIÓN PARA CLONAR EQUIPO
function clonarEquipo(serie) {
  console.log('📋 Iniciando clonado de equipo:', serie);
  
  try {
    const equipos = JSON.parse(localStorage.getItem("equiposMedicos")) || [];
    const equipo = equipos.find(e => e.serie === serie);
    
    if (!equipo) {
      alert('Equipo no encontrado.');
      return;
    }
    
    // Llenar el formulario con los datos del equipo (excepto la serie)
    document.getElementById("nombre").value = equipo.nombre + ' (Copia)';
    document.getElementById("marca").value = equipo.marca || '';
    document.getElementById("modelo").value = equipo.modelo || '';
    document.getElementById("serie").value = ''; // Serie vacía para que el usuario ingrese una nueva
    document.getElementById("categoria").value = equipo.categoria || '';
    document.getElementById("estado").value = equipo.estado || '';
    document.getElementById("ubicacion").value = equipo.ubicacion || '';
    document.getElementById("responsable").value = equipo.responsable || '';
    document.getElementById("departamento").value = equipo.departamento || '';
    document.getElementById("proveedor").value = equipo.proveedor || '';
    document.getElementById("numero-contrato").value = ''; // Contrato vacío
    document.getElementById("fecha-compra").value = ''; // Fecha de compra vacía
    document.getElementById("fecha-garantia").value = ''; // Garantía vacía
    document.getElementById("costo").value = equipo.costo || '';
    document.getElementById("imagen").value = equipo.imagen || '';
    document.getElementById("manual").value = equipo.manual || '';
    document.getElementById("observaciones").value = (equipo.observaciones || '') + '\n\n[Clonado del equipo: ' + serie + ']';
    
    // Asegurar que NO esté en modo edición
    const form = document.getElementById('form-equipo');
    delete form.dataset.editando;
    
    // Hacer scroll al formulario
    document.getElementById('seccion-registro').scrollIntoView({ behavior: 'smooth' });
    
    // Enfocar el campo de serie para que el usuario ingrese una nueva
    document.getElementById("serie").focus();
    
    alert(`✅ Equipo clonado. Por favor ingresa un nuevo número de serie.\n\nNota: El nombre se ha marcado como "(Copia)" y algunos campos se han limpiado.`);
    
    console.log('✅ Equipo clonado, listo para nuevo registro');
    
  } catch (error) {
    console.error('❌ Error al clonar equipo:', error);
    alert('Error al clonar el equipo.');
  }
}

// FUNCIÓN PARA MOSTRAR MENSAJE DE EDICIÓN
function mostrarMensajeEdicion(nombreEquipo) {
  // Remover mensaje anterior si existe
  const mensajeAnterior = document.querySelector('.mensaje-edicion');
  if (mensajeAnterior) {
    mensajeAnterior.remove();
  }
  
  // Crear nuevo mensaje
  const mensaje = document.createElement('div');
  mensaje.className = 'mensaje-edicion';
  mensaje.innerHTML = `
    <div class="alerta-edicion">
      <span>✏️ Editando equipo: <strong>${nombreEquipo}</strong></span>
      <button type="button" class="btn-cancelar-edicion" onclick="cancelarEdicion()">❌ Cancelar Edición</button>
    </div>
  `;
  
  // Insertar antes del formulario
  const form = document.getElementById('form-equipo');
  form.parentNode.insertBefore(mensaje, form);
}

// FUNCIÓN PARA CANCELAR EDICIÓN
function cancelarEdicion() {
  console.log('❌ Cancelando edición');
  
  // Limpiar formulario
  const form = document.getElementById('form-equipo');
  form.reset();
  delete form.dataset.editando;
  
  // Remover mensaje de edición
  const mensaje = document.querySelector('.mensaje-edicion');
  if (mensaje) {
    mensaje.remove();
  }
  
  console.log('✅ Edición cancelada');
}

// También intentar después de 1 segundo por si acaso
setTimeout(() => {
  const btnConfigurar = document.getElementById('configurar-alertas');
  if (btnConfigurar && typeof abrirConfiguracionAlertas === 'function') {
    console.log('🔄 Configurando listener de respaldo...');
    btnConfigurar.onclick = function(e) {
      e.preventDefault();
      console.log('🎯 Click de respaldo en botón configurar alertas');
      abrirConfiguracionAlertas();
    };
  }
}, 1000);

console.log('✅ Fix de alertas cargado');

// FUNCIÓN DE DIAGNÓSTICO PARA VERIFICAR PERSISTENCIA
function verificarPersistencia() {
  console.log('🔍 VERIFICANDO PERSISTENCIA DE DATOS');
  console.log('=====================================');
  
  const equipos = JSON.parse(localStorage.getItem("equiposMedicos")) || [];
  console.log(`📊 Total de equipos en localStorage: ${equipos.length}`);
  
  if (equipos.length > 0) {
    console.log('📋 Equipos encontrados:');
    equipos.forEach((equipo, index) => {
      console.log(`${index + 1}. ${equipo.nombre} (${equipo.serie}) - ${equipo.categoria}`);
    });
    
    // Verificar si se están mostrando en la tabla
    const tabla = document.querySelector("#tabla-equipos tbody");
    const filasTabla = tabla ? tabla.children.length : 0;
    
    console.log(`📋 Equipos en tabla: ${filasTabla}`);
    console.log(`📋 Equipos en localStorage: ${equipos.length}`);
    
    if (filasTabla !== equipos.length) {
      console.log('⚠️ PROBLEMA: Los equipos están guardados pero no se muestran en la tabla');
      console.log('🔧 Intentando cargar equipos en la tabla...');
      cargarEquipos();
    } else {
      console.log('✅ Los datos están guardados Y se muestran correctamente');
    }
  } else {
    console.log('📭 No hay equipos guardados en localStorage');
  }
  
  console.log('=====================================');
}

// Ejecutar verificación después de 2 segundos
setTimeout(verificarPersistencia, 2000);

// Hacer la función accesible desde la consola
window.verificarPersistencia = verificarPersistencia;

console.log('💡 Usa verificarPersistencia() en la consola para verificar los datos guardados');

// FUNCIÓN PARA ACTUALIZAR TODOS LOS DASHBOARDS
function actualizarDashboard() {
  console.log('📊 Actualizando dashboard...');
  
  try {
    const equipos = JSON.parse(localStorage.getItem("equiposMedicos")) || [];
    console.log(`📋 Actualizando dashboard con ${equipos.length} equipos`);
    
    // 1. ESTADÍSTICAS PRINCIPALES
    const totalEquipos = equipos.length;
    const equiposOperativos = equipos.filter(e => e.estado === 'operativo').length;
    const equiposMantenimiento = equipos.filter(e => e.estado === 'mantenimiento').length;
    const equiposFueraServicio = equipos.filter(e => e.estado === 'fuera-servicio').length;
    
    // Actualizar elementos principales
    actualizarElemento('total-equipos', totalEquipos);
    actualizarElemento('equipos-operativos', equiposOperativos);
    actualizarElemento('equipos-mantenimiento', equiposMantenimiento);
    actualizarElemento('equipos-fuera-servicio', equiposFueraServicio);
    
    // 2. ALERTAS DE GARANTÍA
    const ahora = new Date();
    let garantiasVencidas = 0;
    let garantiasPorVencer = 0;
    let garantiasVigentes = 0;
    
    equipos.forEach(equipo => {
      if (equipo.fechaGarantia) {
        const vencimiento = new Date(equipo.fechaGarantia);
        const diasRestantes = Math.ceil((vencimiento - ahora) / (1000 * 60 * 60 * 24));
        
        if (diasRestantes < 0) {
          garantiasVencidas++;
        } else if (diasRestantes <= 30) {
          garantiasPorVencer++;
        } else {
          garantiasVigentes++;
        }
      }
    });
    
    actualizarElemento('garantias-vencidas', garantiasVencidas);
    actualizarElemento('garantias-por-vencer', garantiasPorVencer);
    actualizarElemento('garantias-vigentes-count', garantiasVigentes);
    actualizarElemento('garantias-vencidas-count', garantiasVencidas);
    actualizarElemento('garantias-por-vencer-count', garantiasPorVencer);
    
    // 3. EQUIPOS CRÍTICOS CON PROBLEMAS
    const equiposCriticosProblema = equipos.filter(e => 
      (e.categoria === 'critico' || e.categoria === 'soporte-vida') && 
      (e.estado === 'fuera-servicio' || e.estado === 'mantenimiento')
    ).length;
    
    actualizarElemento('equipos-criticos-problema', equiposCriticosProblema);
    
    // 4. DISTRIBUCIÓN POR CATEGORÍAS
    const categorias = {
      'alta-tecnologia': 0,
      'soporte-vida': 0,
      'critico': 0,
      'general': 0
    };
    
    equipos.forEach(equipo => {
      if (categorias.hasOwnProperty(equipo.categoria)) {
        categorias[equipo.categoria]++;
      }
    });
    
    // Actualizar contadores y barras de categorías
    const totalParaPorcentajes = totalEquipos || 1;
    Object.keys(categorias).forEach(categoria => {
      const count = categorias[categoria];
      const porcentaje = (count / totalParaPorcentajes) * 100;
      
      // Actualizar contadores
      actualizarElemento(`count-${categoria}`, count);
      actualizarElemento(`cat-valor-${categoria}`, count);
      
      // Actualizar barras de progreso
      const barra = document.getElementById(`bar-${categoria}`);
      const barraCat = document.getElementById(`cat-barra-${categoria}`);
      
      if (barra) {
        barra.style.width = `${porcentaje}%`;
      }
      if (barraCat) {
        barraCat.style.width = `${porcentaje}%`;
      }
    });
    
    // 5. DASHBOARD GRÁFICO - Distribución por estados
    const estados = {
      'operativo': equiposOperativos,
      'mantenimiento': equiposMantenimiento,
      'fuera-servicio': equiposFueraServicio,
      'en-calibracion': equipos.filter(e => e.estado === 'en-calibracion').length
    };
    
    Object.keys(estados).forEach(estado => {
      const count = estados[estado];
      const porcentaje = (count / totalParaPorcentajes) * 100;
      
      // Actualizar valores y barras
      actualizarElemento(`valor-${estado}`, count);
      
      const barra = document.getElementById(`barra-${estado}`);
      if (barra) {
        barra.style.width = `${porcentaje}%`;
        barra.setAttribute('data-count', count);
      }
    });
    
    // 6. INDICADOR CIRCULAR DE OPERATIVIDAD
    const porcentajeOperatividad = totalEquipos > 0 ? (equiposOperativos / totalEquipos) * 100 : 0;
    
    const circleProgress = document.getElementById('circle-operatividad');
    const percentageElement = document.getElementById('operatividad-percentage');
    const textoOperativos = document.getElementById('equipos-operativos-texto');
    
    if (circleProgress && percentageElement && textoOperativos) {
      const angulo = (porcentajeOperatividad / 100) * 360;
      
      let color = '#e74c3c';
      if (porcentajeOperatividad >= 80) {
        color = '#27ae60';
      } else if (porcentajeOperatividad >= 60) {
        color = '#f39c12';
      }
      
      setTimeout(() => {
        circleProgress.style.background = `conic-gradient(${color} 0deg, ${color} ${angulo}deg, #e9ecef ${angulo}deg)`;
      }, 200);
      
      percentageElement.textContent = `${Math.round(porcentajeOperatividad)}%`;
      textoOperativos.textContent = `${equiposOperativos} de ${totalEquipos} equipos operativos`;
    }
    
    // 7. ACTUALIZAR EQUIPOS QUE REQUIEREN ATENCIÓN
    if (typeof actualizarEquiposAtencion === 'function') {
      actualizarEquiposAtencion();
    }
    
    // 8. ACTUALIZAR CONTADORES GENERALES
    const contadorElement = document.getElementById("contador-equipos");
    if (contadorElement) {
      contadorElement.textContent = `Total: ${totalEquipos} equipos`;
    }
    
    console.log('✅ Dashboard actualizado correctamente');
    console.log(`📊 Resumen: ${totalEquipos} equipos total, ${equiposOperativos} operativos, ${garantiasVencidas} garantías vencidas`);
    
  } catch (error) {
    console.error('❌ Error al actualizar dashboard:', error);
  }
}

// Función auxiliar para actualizar elementos
function actualizarElemento(id, valor) {
  const elemento = document.getElementById(id);
  if (elemento) {
    elemento.textContent = valor;
  } else {
    console.log(`⚠️ Elemento ${id} no encontrado`);
  }
}

// CARGAR Y ACTUALIZAR TODO AL INICIO
function inicializarTodo() {
  console.log('🚀 Inicializando sistema completo...');
  
  // Cargar equipos en la tabla
  cargarEquipos();
  
  // Actualizar dashboard
  actualizarDashboard();
  
  console.log('✅ Sistema inicializado completamente');
}

// Ejecutar inicialización después de que todo esté cargado
setTimeout(inicializarTodo, 1000);

// Hacer funciones disponibles globalmente
window.actualizarDashboard = actualizarDashboard;
window.cargarEquipos = cargarEquipos;
window.inicializarTodo = inicializarTodo;
window.editarEquipo = editarEquipo;
window.clonarEquipo = clonarEquipo;
window.cancelarEdicion = cancelarEdicion;
