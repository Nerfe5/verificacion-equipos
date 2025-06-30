// main.js

// Variables globales
let equiposOriginales = [];
let equiposFiltrados = [];

// Obtener referencias
const form = document.getElementById("form-equipo");
const tabla = document.getElementById("tabla-equipos").querySelector("tbody");
const inputCSV = document.createElement("input");
inputCSV.type = "file";
inputCSV.accept = ".csv";

document.body.insertAdjacentHTML("beforeend", '<button id="importarCSV">Importar desde CSV</button>');
document.body.insertAdjacentHTML("beforeend", '<button id="limpiarSeries" style="margin-left: 10px; background-color: #ffc107; color: #212529;">🧹 Limpiar Series</button>');
document.body.insertAdjacentHTML("beforeend", '<button id="cargarDatosPrueba" style="margin-left: 10px; background-color: #17a2b8; color: white;">📋 Cargar Datos de Prueba</button>');
document.body.insertAdjacentHTML("beforeend", '<button id="limpiarDatos" style="margin-left: 10px; background-color: #dc3545; color: white;">🗑️ Limpiar Todos los Datos</button>');
document.getElementById("importarCSV").addEventListener("click", () => inputCSV.click());
document.getElementById("limpiarSeries").addEventListener("click", limpiarNumerosSerieProblematicos);
document.getElementById("cargarDatosPrueba").addEventListener("click", () => {
  if (typeof cargarDatosPrueba === 'function') {
    cargarDatosPrueba();
  } else {
    alert('La función cargarDatosPrueba no está disponible. Asegúrate de que el archivo agregar_datos_prueba.js esté cargado.');
  }
});
document.getElementById("limpiarDatos").addEventListener("click", () => {
  if (typeof limpiarTodosLosDatos === 'function') {
    limpiarTodosLosDatos();
  } else {
    if (confirm('¿Estás seguro de que deseas eliminar TODOS los datos? Esta acción no se puede deshacer.')) {
      localStorage.setItem('equiposMedicos', '[]');
      cargarEquipos();
      actualizarDashboard();
      cargarEquiposEnSelector();
      alert('Todos los datos han sido eliminados.');
    }
  }
});
inputCSV.addEventListener("change", handleCSV);

window.onload = function () {
  // Limpiar números de serie problemáticos al cargar
  const equipos = JSON.parse(localStorage.getItem("equiposMedicos")) || [];
  let equiposModificados = false;
  
  equipos.forEach(equipo => {
    if (equipo.serie.includes('"') || equipo.serie.includes("'")) {
      equipo.serie = equipo.serie.replace(/['"]/g, '');
      equiposModificados = true;
      console.log(`Serie limpiada automáticamente: ${equipo.serie} para equipo ${equipo.nombre}`);
    }
  });
  
  if (equiposModificados) {
    localStorage.setItem("equiposMedicos", JSON.stringify(equipos));
    console.log('Se han limpiado automáticamente los números de serie problemáticos.');
  }
  
  // Agregar datos de prueba si no existen equipos
  const equiposExistentes = JSON.parse(localStorage.getItem("equiposMedicos")) || [];
  if (equiposExistentes.length === 0) {
    const equiposPrueba = [
      {
        nombre: 'Ventilador Mecánico',
        marca: 'Philips',
        modelo: 'V60',
        serie: 'VM001',
        categoria: 'soporte-vida',
        estado: 'operativo',
        ubicacion: 'UCI - Cama 01',
        responsable: 'Dr. García',
        departamento: 'Cuidados Intensivos',
        proveedor: 'MedEquip SA',
        contrato: 'CT-2024-001',
        fechaCompra: '2024-01-15',
        fechaGarantia: '2026-01-15',
        costo: '150000',
        imagen: '',
        manual: '',
        observaciones: 'Equipo en perfecto estado',
        fechaRegistro: new Date().toISOString(),
        ultimaActualizacion: new Date().toISOString()
      },
      {
        nombre: 'Monitor de Signos Vitales',
        marca: 'GE',
        modelo: 'B650',
        serie: 'MSV002',
        categoria: 'critico',
        estado: 'mantenimiento',
        ubicacion: 'UCI - Cama 03',
        responsable: 'Enfermera López',
        departamento: 'Cuidados Intensivos',
        proveedor: 'TechMed Corp',
        contrato: 'CT-2024-002',
        fechaCompra: '2023-06-10',
        fechaGarantia: '2024-06-10',
        costo: '85000',
        imagen: '',
        manual: '',
        observaciones: 'En mantenimiento preventivo',
        fechaRegistro: new Date().toISOString(),
        ultimaActualizacion: new Date().toISOString()
      }
    ];
    localStorage.setItem("equiposMedicos", JSON.stringify(equiposPrueba));
  }
  
  cargarEquipos();
  actualizarDashboard(); // Actualizar dashboard al cargar
  inicializarModuloVerificacion(); // Inicializar verificación
  inicializarSistemaAlertas(); // Inicializar sistema de alertas
  
  // Event listeners para el formulario de registro de equipos
  form.addEventListener("submit", manejarSubmitEquipo);
  
  // Event listeners para filtros
  document.getElementById('buscar-texto').addEventListener('input', aplicarFiltros);
  document.getElementById('filtro-estado').addEventListener('change', aplicarFiltros);
  document.getElementById('filtro-categoria').addEventListener('change', aplicarFiltros);
  document.getElementById('filtro-garantia').addEventListener('change', aplicarFiltros);
  document.getElementById('limpiar-filtros').addEventListener('click', limpiarFiltros);
  document.getElementById('exportar-csv').addEventListener('click', exportarCSV);
  
  // Event listeners para el dashboard
  document.getElementById('generar-reporte-dashboard').addEventListener('click', generarReporteDashboard);
  document.getElementById('actualizar-dashboard').addEventListener('click', actualizarDashboard);
  
  // Event listeners para verificación
  document.getElementById('iniciar-verificacion').addEventListener('click', iniciarVerificacion);
  document.getElementById('form-verificacion').addEventListener('submit', function(e) {
    e.preventDefault();
    guardarVerificacion();
  });
  document.getElementById('cancelar-verificacion').addEventListener('click', cancelarVerificacion);
  document.getElementById('aplicar-filtros-historial').addEventListener('click', aplicarFiltrosHistorial);
  document.getElementById('exportar-verificaciones').addEventListener('click', exportarVerificaciones);
  
  // Event listeners para el sistema de alertas
  document.getElementById('marcar-todas-leidas').addEventListener('click', marcarTodasLeidasAlertas);
  document.getElementById('configurar-alertas').addEventListener('click', abrirConfiguracionAlertas);
  document.getElementById('limpiar-notificaciones').addEventListener('click', limpiarNotificaciones);
  document.getElementById('guardar-configuracion').addEventListener('click', guardarConfiguracionAlertas);
  document.getElementById('probar-alertas').addEventListener('click', probarAlertas);
};

// ==============================================
// FUNCIONES BÁSICAS PARA MANEJO DE EQUIPOS
// ==============================================

// Función para manejar el submit del formulario
function manejarSubmitEquipo(e) {
  e.preventDefault();
  
  // Obtener datos del formulario
  const datosEquipo = {
    nombre: document.getElementById("nombre").value,
    marca: document.getElementById("marca").value,
    modelo: document.getElementById("modelo").value,
    serie: document.getElementById("serie").value,
    categoria: document.getElementById("categoria").value,
    estado: document.getElementById("estado").value,
    ubicacion: document.getElementById("ubicacion").value,
    responsable: document.getElementById("responsable").value,
    departamento: document.getElementById("departamento").value,
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
  
  // Verificar si estamos editando o agregando
  if (form.dataset.editando) {
    actualizarEquipo(form.dataset.editando, datosEquipo);
  } else {
    // Verificar que el número de serie no existe
    if (verificarSerieExistente(datosEquipo.serie)) {
      alert('Ya existe un equipo con ese número de serie. Por favor ingresa uno diferente.');
      return;
    }
    agregarEquipo(datosEquipo);
  }
}

// Función para verificar si existe un número de serie
function verificarSerieExistente(serie) {
  const equipos = JSON.parse(localStorage.getItem("equiposMedicos")) || [];
  return equipos.some(equipo => equipo.serie === serie);
}

// Función para agregar un nuevo equipo
function agregarEquipo(datosEquipo) {
  const equipos = JSON.parse(localStorage.getItem("equiposMedicos")) || [];
  equipos.push(datosEquipo);
  localStorage.setItem("equiposMedicos", JSON.stringify(equipos));
  
  // Limpiar formulario
  form.reset();
  
  // Recargar tabla y dashboard
  cargarEquipos();
  actualizarDashboard();
  cargarEquiposEnSelector();
  
  alert('Equipo registrado correctamente.');
  registrarAccionSistema(`Equipo "${datosEquipo.nombre}" registrado`, 'informativa');
}

// Función para actualizar un equipo existente
function actualizarEquipo(serieOriginal, datosEquipo) {
  const equipos = JSON.parse(localStorage.getItem("equiposMedicos")) || [];
  const index = equipos.findIndex(e => e.serie === serieOriginal);
  
  if (index !== -1) {
    // Verificar que el nuevo número de serie no existe (si cambió)
    if (serieOriginal !== datosEquipo.serie && verificarSerieExistente(datosEquipo.serie)) {
      alert('Ya existe un equipo con ese número de serie. Por favor ingresa uno diferente.');
      return;
    }
    
    equipos[index] = { ...equipos[index], ...datosEquipo };
    localStorage.setItem("equiposMedicos", JSON.stringify(equipos));
    
    // Limpiar formulario y modo edición
    cancelarEdicion();
    
    // Recargar tabla y dashboard
    cargarEquipos();
    actualizarDashboard();
    cargarEquiposEnSelector();
    
    alert('Equipo actualizado correctamente.');
    registrarAccionSistema(`Equipo "${datosEquipo.nombre}" actualizado`, 'informativa');
  }
}

// Función para cargar equipos desde localStorage
function cargarEquipos() {
  const equipos = JSON.parse(localStorage.getItem("equiposMedicos")) || [];
  equiposOriginales = equipos;
  equiposFiltrados = equipos;
  
  tabla.innerHTML = "";
  equipos.forEach(equipo => agregarFilaTabla(equipo));
  
  actualizarContadores();
}

// Función para agregar una fila a la tabla
function agregarFilaTabla(equipo) {
  const fila = document.createElement("tr");
  
  const estadoGarantia = getGarantiaEstado(equipo.fechaGarantia);
  
  // Escapar comillas en el número de serie para evitar problemas en HTML
  const serieEscapada = equipo.serie.replace(/'/g, "\\'").replace(/"/g, "&quot;");
  
  fila.innerHTML = `
    <td>${equipo.serie}</td>
    <td>${equipo.nombre}</td>
    <td>${equipo.marca} ${equipo.modelo}</td>
    <td>${equipo.ubicacion}</td>
    <td><span class="estado ${equipo.estado}">${formatEstado(equipo.estado)}</span></td>
    <td>${formatCategoria(equipo.categoria)}</td>
    <td>${equipo.responsable || 'No asignado'}</td>
    <td>${equipo.proveedor || 'No especificado'}</td>
    <td><span class="garantia ${estadoGarantia.class}">${estadoGarantia.texto}</span></td>
    <td>${equipo.imagen ? `<a href="${equipo.imagen}" target="_blank">Ver imagen</a>` : 'Sin imagen'}</td>
    <td>
      <button class="btn-ver" data-serie="${serieEscapada}">Ver</button>
      <button class="btn-editar" data-serie="${serieEscapada}">Editar</button>
      <button class="btn-clonar" data-serie="${serieEscapada}">Clonar</button>
      <button class="btn-eliminar" data-serie="${serieEscapada}">Eliminar</button>
    </td>
  `;
  
  // Agregar event listeners a los botones
  const btnVer = fila.querySelector('.btn-ver');
  const btnEditar = fila.querySelector('.btn-editar');
  const btnClonar = fila.querySelector('.btn-clonar');
  const btnEliminar = fila.querySelector('.btn-eliminar');
  
  btnVer.addEventListener('click', () => verDetalles(equipo.serie));
  btnEditar.addEventListener('click', () => editarEquipo(equipo.serie));
  btnClonar.addEventListener('click', () => clonarEquipo(equipo.serie));
  btnEliminar.addEventListener('click', () => eliminarEquipo(equipo.serie));
  
  tabla.appendChild(fila);
}

// Funciones auxiliares para formato
function formatEstado(estado) {
  const estados = {
    'operativo': 'Operativo',
    'mantenimiento': 'En Mantenimiento',
    'fuera-servicio': 'Fuera de Servicio',
    'en-calibracion': 'En Calibración'
  };
  return estados[estado] || estado;
}

function formatCategoria(categoria) {
  const categorias = {
    'alta-tecnologia': 'Alta Tecnología',
    'soporte-vida': 'Soporte de Vida',
    'critico': 'Crítico',
    'general': 'General'
  };
  return categorias[categoria] || categoria;
}

// Función para obtener estado de garantía
function getGarantiaEstado(fechaGarantia) {
  if (!fechaGarantia) {
    return { class: 'sin-garantia', texto: 'Sin garantía' };
  }
  
  const ahora = new Date();
  const vencimiento = new Date(fechaGarantia);
  const diasRestantes = Math.ceil((vencimiento - ahora) / (1000 * 60 * 60 * 24));
  
  if (diasRestantes < 0) {
    return { class: 'vencida', texto: 'Vencida' };
  } else if (diasRestantes <= 30) {
    return { class: 'por-vencer', texto: `${diasRestantes} días` };
  } else {
    return { class: 'vigente', texto: 'Vigente' };
  }
}

// Función para eliminar equipo
function eliminarEquipo(serie) {
  if (confirm('¿Estás seguro de que deseas eliminar este equipo? Esta acción no se puede deshacer.')) {
    const equipos = JSON.parse(localStorage.getItem("equiposMedicos")) || [];
    const equipoEliminado = equipos.find(e => e.serie === serie);
    const equiposFiltrados = equipos.filter(e => e.serie !== serie);
    
    localStorage.setItem("equiposMedicos", JSON.stringify(equiposFiltrados));
    
    cargarEquipos();
    actualizarDashboard();
    cargarEquiposEnSelector();
    
    alert('Equipo eliminado correctamente.');
    registrarAccionSistema(`Equipo "${equipoEliminado?.nombre}" eliminado`, 'advertencia');
  }
}

// Función para ver detalles de un equipo
function verDetalles(serie) {
  const equipos = JSON.parse(localStorage.getItem("equiposMedicos")) || [];
  const equipo = equipos.find(e => e.serie === serie);
  
  if (!equipo) {
    alert('Equipo no encontrado.');
    return;
  }
  
  mostrarModalDetalles(equipo);
}

// Función para mostrar modal con detalles del equipo
function mostrarModalDetalles(equipo) {
  const modal = document.createElement('div');
  modal.className = 'modal';
  
  const estadoGarantia = getGarantiaEstado(equipo.fechaGarantia);
  
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close" onclick="cerrarModal()">&times;</span>
      <h2>Detalles del Equipo</h2>
      
      <div class="detalles-grid">
        <div><strong>Nombre:</strong> ${equipo.nombre}</div>
        <div><strong>Marca:</strong> ${equipo.marca}</div>
        <div><strong>Modelo:</strong> ${equipo.modelo}</div>
        <div><strong>Serie:</strong> ${equipo.serie}</div>
        <div><strong>Categoría:</strong> ${formatCategoria(equipo.categoria)}</div>
        <div><strong>Estado:</strong> <span class="estado ${equipo.estado}">${formatEstado(equipo.estado)}</span></div>
        <div><strong>Ubicación:</strong> ${equipo.ubicacion}</div>
        <div><strong>Responsable:</strong> ${equipo.responsable || 'No asignado'}</div>
        <div><strong>Departamento:</strong> ${equipo.departamento || 'No especificado'}</div>
        <div><strong>Proveedor:</strong> ${equipo.proveedor || 'No especificado'}</div>
        <div><strong>Contrato:</strong> ${equipo.contrato || 'No especificado'}</div>
        <div><strong>Fecha de Compra:</strong> ${equipo.fechaCompra || 'No especificada'}</div>
        <div><strong>Garantía:</strong> <span class="garantia ${estadoGarantia.class}">${estadoGarantia.texto}</span></div>
        <div><strong>Costo:</strong> ${equipo.costo ? `$${parseFloat(equipo.costo).toLocaleString()} MXN` : 'No especificado'}</div>
        <div><strong>Manual:</strong> ${equipo.manual ? `<a href="${equipo.manual}" target="_blank">Ver manual</a>` : 'No disponible'}</div>
        <div><strong>Fecha de Registro:</strong> ${equipo.fechaRegistro ? new Date(equipo.fechaRegistro).toLocaleDateString('es-MX') : 'No disponible'}</div>
        
        ${equipo.observaciones ? `<div class="observaciones"><strong>Observaciones:</strong><br>${equipo.observaciones}</div>` : ''}
      </div>
      
      ${equipo.imagen ? `
        <div class="imagen-detalle">
          <h3>Imagen del Equipo</h3>
          <img src="${equipo.imagen}" alt="Imagen de ${equipo.nombre}" style="max-width: 100%; max-height: 300px; object-fit: contain;">
        </div>
      ` : ''}
    </div>
  `;
  
  document.body.appendChild(modal);
}

// Función para cerrar modal
function cerrarModal() {
  const modal = document.querySelector('.modal');
  if (modal) {
    modal.remove();
  }
}

// Función para importar CSV
function handleCSV(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    const csv = e.target.result;
    const lines = csv.split('\n');
    const equipos = JSON.parse(localStorage.getItem("equiposMedicos")) || [];
    let equiposImportados = 0;
    let equiposDuplicados = 0;
    
    // Procesar cada línea (saltando la primera si es encabezado)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const columns = line.split(',').map(col => col.replace(/"/g, '').trim());
      
      if (columns.length < 8) continue; // Mínimo 8 columnas requeridas
      
      const equipoCSV = {
        ubicacion: columns[0] || '',
        categoria: columns[1] || 'general',
        nombre: columns[2] || '',
        marca: columns[3] || '',
        modelo: columns[4] || '',
        serie: columns[5] || '',
        contrato: columns[6] || '',
        imagen: columns[7] || '',
        estado: columns[8] || 'operativo',
        responsable: columns[9] || '',
        departamento: columns[10] || '',
        proveedor: columns[11] || '',
        fechaCompra: columns[12] || '',
        fechaGarantia: columns[13] || '',
        costo: columns[14] || '',
        manual: columns[15] || '',
        observaciones: columns[16] || '',
        fechaRegistro: new Date().toISOString(),
        ultimaActualizacion: new Date().toISOString()
      };
      
      // Verificar si ya existe
      if (!verificarSerieExistente(equipoCSV.serie)) {
        equipos.push(equipoCSV);
        equiposImportados++;
      } else {
        equiposDuplicados++;
      }
    }
    
    localStorage.setItem("equiposMedicos", JSON.stringify(equipos));
    cargarEquipos();
    actualizarDashboard();
    cargarEquiposEnSelector();
    
    alert(`Importación completada:\n- Equipos importados: ${equiposImportados}\n- Equipos duplicados (omitidos): ${equiposDuplicados}`);
    registrarAccionSistema(`${equiposImportados} equipos importados desde CSV`, 'informativa');
  };
  
  reader.readAsText(file);
}

// ==============================================
// FUNCIONES AUXILIARES Y DE SOPORTE
// ==============================================

// Función para actualizar contadores
function actualizarContadores() {
  const equipos = JSON.parse(localStorage.getItem("equiposMedicos")) || [];
  document.getElementById("contador-equipos").textContent = `Total: ${equipos.length} equipos`;
  
  if (equiposFiltrados.length !== equipos.length) {
    document.getElementById("contador-filtrados").textContent = `Mostrando: ${equiposFiltrados.length} equipos`;
  } else {
    document.getElementById("contador-filtrados").textContent = "";
  }
}

// Función para actualizar el dashboard
function actualizarDashboard() {
  const equipos = JSON.parse(localStorage.getItem("equiposMedicos")) || [];
  
  // Estadísticas principales
  document.getElementById("total-equipos").textContent = equipos.length;
  document.getElementById("equipos-operativos").textContent = equipos.filter(e => e.estado === 'operativo').length;
  document.getElementById("equipos-mantenimiento").textContent = equipos.filter(e => e.estado === 'mantenimiento').length;
  document.getElementById("equipos-fuera-servicio").textContent = equipos.filter(e => e.estado === 'fuera-servicio').length;
  
  // Alertas de garantía
  const ahora = new Date();
  let garantiasVencidas = 0;
  let garantiasPorVencer = 0;
  
  equipos.forEach(equipo => {
    if (equipo.fechaGarantia) {
      const vencimiento = new Date(equipo.fechaGarantia);
      const diasRestantes = Math.ceil((vencimiento - ahora) / (1000 * 60 * 60 * 24));
      
      if (diasRestantes < 0) {
        garantiasVencidas++;
      } else if (diasRestantes <= 30) {
        garantiasPorVencer++;
      }
    }
  });
  
  document.getElementById("garantias-vencidas").textContent = garantiasVencidas;
  document.getElementById("garantias-por-vencer").textContent = garantiasPorVencer;
  
  // Equipos críticos con problemas
  const equiposCriticosProblema = equipos.filter(e => 
    (e.categoria === 'critico' || e.categoria === 'soporte-vida') && 
    (e.estado === 'fuera-servicio' || e.estado === 'mantenimiento')
  ).length;
  document.getElementById("equipos-criticos-problema").textContent = equiposCriticosProblema;
  
  // Distribución por categorías
  const categorias = ['alta-tecnologia', 'soporte-vida', 'critico', 'general'];
  const totalEquipos = equipos.length || 1; // Evitar división por cero
  
  categorias.forEach(categoria => {
    const count = equipos.filter(e => e.categoria === categoria).length;
    const porcentaje = (count / totalEquipos) * 100;
    
    document.getElementById(`count-${categoria}`).textContent = count;
    document.getElementById(`bar-${categoria}`).style.width = `${porcentaje}%`;
  });
  
  // Equipos que requieren atención
  actualizarEquiposAtencion();
}

// Función para actualizar equipos que requieren atención
function actualizarEquiposAtencion() {
  const equipos = JSON.parse(localStorage.getItem("equiposMedicos")) || [];
  const contenedor = document.getElementById("equipos-atencion");
  
  const equiposAtencion = equipos.filter(equipo => {
    // Criterios para requerir atención:
    // 1. Equipos críticos fuera de servicio
    // 2. Garantías vencidas
    // 3. Equipos en mantenimiento por mucho tiempo
    
    const esCritico = equipo.categoria === 'critico' || equipo.categoria === 'soporte-vida';
    const fueraServicio = equipo.estado === 'fuera-servicio';
    const enMantenimiento = equipo.estado === 'mantenimiento';
    
    // Verificar garantía vencida
    let garantiaVencida = false;
    if (equipo.fechaGarantia) {
      const ahora = new Date();
      const vencimiento = new Date(equipo.fechaGarantia);
      garantiaVencida = vencimiento < ahora;
    }
    
    return (esCritico && (fueraServicio || enMantenimiento)) || garantiaVencida;
  });
  
  if (equiposAtencion.length === 0) {
    contenedor.innerHTML = '<div class="sin-problemas">✅ Todos los equipos están en buen estado</div>';
    return;
  }
  
  contenedor.innerHTML = equiposAtencion.map(equipo => {
    let problema = '';
    const esCritico = equipo.categoria === 'critico' || equipo.categoria === 'soporte-vida';
    const fueraServicio = equipo.estado === 'fuera-servicio';
    const enMantenimiento = equipo.estado === 'mantenimiento';
    
    if (equipo.fechaGarantia && new Date(equipo.fechaGarantia) < new Date()) {
      problema = 'Garantía vencida';
    } else if (esCritico && fueraServicio) {
      problema = 'Equipo crítico fuera de servicio';
    } else if (esCritico && enMantenimiento) {
      problema = 'Equipo crítico en mantenimiento';
    }
    
    return `
      <div class="equipo-atencion-item">
        <div class="equipo-atencion-info">
          <div class="equipo-atencion-nombre">${equipo.nombre}</div>
          <div class="equipo-atencion-problema">${problema}</div>
          <div class="equipo-atencion-ubicacion">${equipo.ubicacion}</div>
        </div>
        <button class="btn-ver-equipo" onclick="verDetalles('${equipo.serie}')">Ver Detalles</button>
      </div>
    `;
  }).join('');
}

// Función para cargar equipos en selector
function cargarEquiposEnSelector() {
  const equipos = JSON.parse(localStorage.getItem("equiposMedicos")) || [];
  const selector = document.getElementById("equipo-verificar");
  const selectorHistorial = document.getElementById("filtro-equipo-historial");
  
  if (selector) {
    selector.innerHTML = '<option value="">Seleccionar equipo...</option>';
    equipos.forEach(equipo => {
      selector.innerHTML += `<option value="${equipo.serie}">${equipo.nombre} - ${equipo.ubicacion}</option>`;
    });
  }
  
  if (selectorHistorial) {
    selectorHistorial.innerHTML = '<option value="">Todos los equipos</option>';
    equipos.forEach(equipo => {
      selectorHistorial.innerHTML += `<option value="${equipo.serie}">${equipo.nombre} - ${equipo.ubicacion}</option>`;
    });
  }
}

// ==============================================
// FUNCIONES DE FILTRADO Y BÚSQUEDA
// ==============================================

// Función para aplicar filtros
function aplicarFiltros() {
  const equipos = JSON.parse(localStorage.getItem("equiposMedicos")) || [];
  const textoBusqueda = document.getElementById('buscar-texto').value.toLowerCase();
  const filtroEstado = document.getElementById('filtro-estado').value;
  const filtroCategoria = document.getElementById('filtro-categoria').value;
  const filtroGarantia = document.getElementById('filtro-garantia').value;
  
  equiposFiltrados = equipos.filter(equipo => {
    // Filtro de texto
    const coincideTexto = !textoBusqueda || 
      equipo.nombre.toLowerCase().includes(textoBusqueda) ||
      equipo.marca.toLowerCase().includes(textoBusqueda) ||
      equipo.modelo.toLowerCase().includes(textoBusqueda) ||
      equipo.serie.toLowerCase().includes(textoBusqueda) ||
      equipo.ubicacion.toLowerCase().includes(textoBusqueda) ||
      (equipo.responsable && equipo.responsable.toLowerCase().includes(textoBusqueda));
    
    // Filtro de estado
    const coincideEstado = !filtroEstado || equipo.estado === filtroEstado;
    
    // Filtro de categoría
    const coincideCategoria = !filtroCategoria || equipo.categoria === filtroCategoria;
    
    // Filtro de garantía
    let coincideGarantia = true;
    if (filtroGarantia) {
      const estadoGarantia = getGarantiaEstado(equipo.fechaGarantia);
      coincideGarantia = estadoGarantia.class === filtroGarantia;
    }
    
    return coincideTexto && coincideEstado && coincideCategoria && coincideGarantia;
  });
  
  // Mostrar equipos filtrados
  tabla.innerHTML = "";
  equiposFiltrados.forEach(equipo => agregarFilaTabla(equipo));
  
  actualizarContadores();
}

// Función para limpiar filtros
function limpiarFiltros() {
  document.getElementById('buscar-texto').value = '';
  document.getElementById('filtro-estado').value = '';
  document.getElementById('filtro-categoria').value = '';
  document.getElementById('filtro-garantia').value = '';
  
  aplicarFiltros();
}

// Función para exportar CSV
function exportarCSV() {
  const equipos = equiposFiltrados.length > 0 ? equiposFiltrados : JSON.parse(localStorage.getItem("equiposMedicos")) || [];
  
  if (equipos.length === 0) {
    alert('No hay equipos para exportar.');
    return;
  }
  
  const encabezados = [
    'Ubicación', 'Categoría', 'Nombre', 'Marca', 'Modelo', 'Serie', 'Contrato', 'Imagen',
    'Estado', 'Responsable', 'Departamento', 'Proveedor', 'Fecha Compra', 'Fecha Garantía',
    'Costo', 'Manual', 'Observaciones'
  ];
  
  let csvContent = encabezados.join(',') + '\n';
  
  equipos.forEach(equipo => {
    const fila = [
      `"${equipo.ubicacion || ''}"`,
      `"${equipo.categoria || ''}"`,
      `"${equipo.nombre || ''}"`,
      `"${equipo.marca || ''}"`,
      `"${equipo.modelo || ''}"`,
      `"${equipo.serie || ''}"`,
      `"${equipo.contrato || ''}"`,
      `"${equipo.imagen || ''}"`,
      `"${equipo.estado || ''}"`,
      `"${equipo.responsable || ''}"`,
      `"${equipo.departamento || ''}"`,
      `"${equipo.proveedor || ''}"`,
      `"${equipo.fechaCompra || ''}"`,
      `"${equipo.fechaGarantia || ''}"`,
      `"${equipo.costo || ''}"`,
      `"${equipo.manual || ''}"`,
      `"${equipo.observaciones || ''}"`
    ];
    csvContent += fila.join(',') + '\n';
  });
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `equipos_medicos_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ==============================================
// FUNCIONES DE CLONADO DE EQUIPOS
// ==============================================

// Función para clonar equipo
function clonarEquipo(serie) {
  const equipos = JSON.parse(localStorage.getItem("equiposMedicos")) || [];
  const equipoOriginal = equipos.find(e => e.serie === serie);
  
  if (!equipoOriginal) {
    alert('Equipo no encontrado.');
    return;
  }
  
  mostrarModalClonado(equipoOriginal);
}

// Función para mostrar modal de clonado
function mostrarModalClonado(equipoOriginal) {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.id = 'modal-clonar';
  
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close" onclick="cerrarModalClonado()">&times;</span>
      <h2>🔄 Clonar Equipo</h2>
      
      <div class="info-equipo-original">
        <h3>Equipo Original:</h3>
        <div class="datos-equipo-original">
          <strong>${equipoOriginal.nombre}</strong> - ${equipoOriginal.marca} ${equipoOriginal.modelo}<br>
          <span>Serie: ${equipoOriginal.serie}</span> | <span>${equipoOriginal.ubicacion}</span>
        </div>
      </div>
      
      <form id="form-clonar-equipo">
        <div class="campo-clonado">
          <label for="nueva-serie">Nuevo Número de Serie:</label>
          <input type="text" id="nueva-serie" required placeholder="Ingresa el nuevo número de serie">
          <small>Este será el único campo que cambiará. Todo lo demás se copiará igual.</small>
        </div>
        
        <div class="campo-clonado opcional">
          <label for="nueva-ubicacion">Nueva Ubicación (opcional):</label>
          <input type="text" id="nueva-ubicacion" placeholder="Dejar vacío para mantener: ${equipoOriginal.ubicacion}">
        </div>
        
        <div class="campo-clonado opcional">
          <label for="nuevo-responsable">Nuevo Responsable (opcional):</label>
          <input type="text" id="nuevo-responsable" placeholder="Dejar vacío para mantener: ${equipoOriginal.responsable || 'No asignado'}">
        </div>
        
        <div class="acciones-clonado">
          <button type="submit" class="btn-confirmar-clonar">✅ Clonar Equipo</button>
          <button type="button" class="btn-cancelar-clonar" onclick="cerrarModalClonado()">❌ Cancelar</button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Agregar event listener al formulario
  document.getElementById('form-clonar-equipo').addEventListener('submit', function(e) {
    e.preventDefault();
    procesarClonado(equipoOriginal);
  });
  
  // Focus en el campo de nueva serie
  document.getElementById('nueva-serie').focus();
}

// Función para procesar el clonado
function procesarClonado(equipoOriginal) {
  const nuevaSerie = document.getElementById('nueva-serie').value.trim();
  const nuevaUbicacion = document.getElementById('nueva-ubicacion').value.trim();
  const nuevoResponsable = document.getElementById('nuevo-responsable').value.trim();
  
  if (!nuevaSerie) {
    alert('Debes ingresar un número de serie.');
    return;
  }
  
  // Verificar que el nuevo número de serie no existe
  if (verificarSerieExistente(nuevaSerie)) {
    alert('Ya existe un equipo con ese número de serie. Por favor ingresa uno diferente.');
    return;
  }
  
  // Crear el equipo clonado
  const equipoClonado = {
    ...equipoOriginal,
    serie: nuevaSerie,
    ubicacion: nuevaUbicacion || equipoOriginal.ubicacion,
    responsable: nuevoResponsable || equipoOriginal.responsable,
    fechaRegistro: new Date().toISOString(),
    ultimaActualizacion: new Date().toISOString()
  };
  
  // Agregar el equipo clonado
  const equipos = JSON.parse(localStorage.getItem("equiposMedicos")) || [];
  equipos.push(equipoClonado);
  localStorage.setItem("equiposMedicos", JSON.stringify(equipos));
  
  // Cerrar modal
  cerrarModalClonado();
  
  // Recargar tabla y dashboard
  cargarEquipos();
  actualizarDashboard();
  cargarEquiposEnSelector();
  
  alert(`Equipo clonado exitosamente.\nNuevo equipo: ${equipoClonado.nombre} (Serie: ${nuevaSerie})`);
  registrarAccionSistema(`Equipo "${equipoClonado.nombre}" clonado con serie ${nuevaSerie}`, 'informativa');
}

// Función para cerrar modal de clonado
function cerrarModalClonado() {
  const modal = document.getElementById('modal-clonar');
  if (modal) {
    modal.remove();
  }
}

// ==============================================
// FUNCIONES DE EDICIÓN
// ==============================================

// Función para editar equipo
function editarEquipo(serie) {
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
  
  // Marcar que estamos editando
  form.dataset.editando = serie;
  
  // Cambiar el texto del botón
  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.textContent = 'Actualizar Equipo';
  
  // Mostrar mensaje de edición
  mostrarMensajeEdicion(equipo.nombre);
  
  // Scroll al formulario
  document.getElementById('seccion-registro').scrollIntoView({ behavior: 'smooth' });
}

// Función para mostrar mensaje de edición
function mostrarMensajeEdicion(nombreEquipo) {
  const mensajeExistente = document.querySelector('.mensaje-edicion');
  if (mensajeExistente) {
    mensajeExistente.remove();
  }
  
  const mensaje = document.createElement('div');
  mensaje.className = 'mensaje-edicion';
  mensaje.innerHTML = `
    <div class="alerta-edicion">
      <span>Editando equipo: <strong>${nombreEquipo}</strong></span>
      <button type="button" class="btn-cancelar-edicion" onclick="cancelarEdicion()">Cancelar Edición</button>
    </div>
  `;
  
  form.parentNode.insertBefore(mensaje, form);
}

// Función para cancelar edición
function cancelarEdicion() {
  // Limpiar el formulario
  form.reset();
  
  // Quitar el modo de edición
  delete form.dataset.editando;
  
  // Restaurar el texto del botón
  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.textContent = 'Registrar Equipo';
  
  // Quitar mensaje de edición
  const mensaje = document.querySelector('.mensaje-edicion');
  if (mensaje) {
    mensaje.remove();
  }
}

// ==============================================
// FUNCIONES PLACEHOLDER PARA MÓDULOS AVANZADOS
// ==============================================

// Funciones básicas para verificación (placeholder)
function inicializarModuloVerificacion() {
  console.log('Módulo de verificación inicializado');
  cargarEquiposEnSelector();
}

function iniciarVerificacion() {
  console.log('Iniciar verificación');
}

function guardarVerificacion() {
  console.log('Guardar verificación');
}

function cancelarVerificacion() {
  console.log('Cancelar verificación');
}

function aplicarFiltrosHistorial() {
  console.log('Aplicar filtros historial');
}

function exportarVerificaciones() {
  console.log('Exportar verificaciones');
}

// Funciones básicas para sistema de alertas (placeholder)
function inicializarSistemaAlertas() {
  console.log('Sistema de alertas inicializado');
}

function marcarTodasLeidasAlertas() {
  console.log('Marcar todas como leídas');
}

function abrirConfiguracionAlertas() {
  console.log('Abrir configuración de alertas');
}

function limpiarNotificaciones() {
  console.log('Limpiar notificaciones');
}

function guardarConfiguracionAlertas() {
  console.log('Guardar configuración de alertas');
}

function probarAlertas() {
  console.log('Probar alertas');
}

function cerrarConfiguracionAlertas() {
  const modal = document.getElementById('modal-configuracion-alertas');
  if (modal) {
    modal.style.display = 'none';
  }
}

function registrarAccionSistema(descripcion, tipo = 'informativa') {
  console.log(`Acción registrada: ${descripcion} (${tipo})`);
}

// Funciones básicas para dashboard
function generarReporteDashboard() {
  alert('Función de reporte en desarrollo. Los datos se mostrarían en un reporte detallado.');
}

// ==============================================
// FUNCIÓN PARA LIMPIAR DATOS PROBLEMÁTICOS
// ==============================================

// Función para limpiar comillas de números de serie
function limpiarNumerosSerieProblematicos() {
  const equipos = JSON.parse(localStorage.getItem("equiposMedicos")) || [];
  let equiposModificados = false;
  
  equipos.forEach(equipo => {
    if (equipo.serie.includes('"') || equipo.serie.includes("'")) {
      // Remover comillas del número de serie
      equipo.serie = equipo.serie.replace(/['"]/g, '');
      equiposModificados = true;
      console.log(`Serie limpiada: ${equipo.serie} para equipo ${equipo.nombre}`);
    }
  });
  
  if (equiposModificados) {
    localStorage.setItem("equiposMedicos", JSON.stringify(equipos));
    cargarEquipos();
    actualizarDashboard();
    cargarEquiposEnSelector();
    alert('Se han limpiado los números de serie problemáticos. Los botones ahora deberían funcionar correctamente.');
  } else {
    alert('No se encontraron números de serie con comillas.');
  }
}

// ==============================================
// FUNCIONES BÁSICAS PARA MANEJO DE EQUIPOS
// ==============================================
