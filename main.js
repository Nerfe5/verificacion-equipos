// main.js

// Obtener referencias
const form = document.getElementById("form-equipo");
const tabla = document.getElementById("tabla-equipos").querySelector("tbody");
const inputCSV = document.createElement("input");
inputCSV.type = "file";
inputCSV.accept = ".csv";

document.body.insertAdjacentHTML("beforeend", '<button id="importarCSV">Importar desde CSV</button>');
document.getElementById("importarCSV").addEventListener("click", () => inputCSV.click());
inputCSV.addEventListener("change", handleCSV);

window.onload = function () {
  cargarEquipos();
  actualizarDashboard(); // Actualizar dashboard al cargar
  inicializarModuloVerificacion(); // Inicializar verificación
  
  // Event listeners para verificación
  document.getElementById('iniciar-verificacion').addEventListener('click', iniciarVerificacion);
  document.getElementById('form-verificacion').addEventListener('submit', function(e) {
    e.preventDefault();
    guardarVerificacion();
  });
  document.getElementById('cancelar-verificacion').addEventListener('click', cancelarVerificacion);
  document.getElementById('aplicar-filtros-historial').addEventListener('click', aplicarFiltrosHistorial);
};

// Variables globales para filtros
let equiposOriginales = [];
let equiposFiltrados = [];

// Módulo de Verificación Diaria
let equipoEnVerificacion = null;
let checklistsTemplates = {};

// Inicializar módulo de verificación
function inicializarModuloVerificacion() {
  cargarChecklistsTemplates();
  cargarEquiposEnSelector();
  cargarHistorialVerificaciones();
}

// Templates de checklist por categoría de equipo
function cargarChecklistsTemplates() {
  checklistsTemplates = {
    'alta-tecnologia': [
      'Verificar encendido y funcionamiento del equipo',
      'Comprobar conexiones eléctricas y cables',
      'Verificar pantallas y displays funcionando correctamente',
      'Comprobar calibración y precisión de mediciones',
      'Verificar sistema de alarmas y alertas',
      'Comprobar conectividad de red (si aplica)',
      'Verificar limpieza externa del equipo',
      'Comprobar que no existan daños físicos visibles'
    ],
    'soporte-vida': [
      'Verificar encendido y autotest del equipo',
      'Comprobar funcionamiento de alarmas críticas',
      'Verificar backup de energía (batería/UPS)',
      'Comprobar conexiones de gases medicinales (si aplica)',
      'Verificar integridad de circuitos de paciente',
      'Comprobar funciones de seguridad del paciente',
      'Verificar calibración de parámetros vitales',
      'Comprobar limpieza y desinfección',
      'Verificar accesorios y consumibles necesarios'
    ],
    'critico': [
      'Verificar encendido y funcionamiento básico',
      'Comprobar sistema de alarmas de seguridad',
      'Verificar conexiones eléctricas seguras',
      'Comprobar funcionamiento de controles principales',
      'Verificar sistemas de protección y seguridad',
      'Comprobar calibración de parámetros críticos',
      'Verificar backup de energía',
      'Comprobar limpieza y mantenimiento visible'
    ],
    'general': [
      'Verificar encendido del equipo',
      'Comprobar funcionamiento básico',
      'Verificar conexiones eléctricas',
      'Comprobar limpieza externa',
      'Verificar que no existan daños visibles',
      'Comprobar accesorios principales'
    ]
  };
}

function cargarEquiposEnSelector() {
  const equipos = JSON.parse(localStorage.getItem("equiposMedicos")) || [];
  const selector = document.getElementById('equipo-verificar');
  const selectorHistorial = document.getElementById('filtro-equipo-historial');
  
  // Limpiar selectores
  selector.innerHTML = '<option value="">Seleccionar equipo...</option>';
  selectorHistorial.innerHTML = '<option value="">Todos los equipos</option>';
  
  // Solo mostrar equipos operativos o en mantenimiento
  const equiposVerificables = equipos.filter(e => 
    e.estado === 'operativo' || e.estado === 'mantenimiento'
  );
  
  equiposVerificables.forEach(equipo => {
    const option = document.createElement('option');
    option.value = equipo.serie;
    option.textContent = `${equipo.nombre} - ${equipo.ubicacion} (${equipo.serie})`;
    selector.appendChild(option);
    
    // También agregar al filtro de historial
    const optionHistorial = option.cloneNode(true);
    selectorHistorial.appendChild(optionHistorial);
  });
}

function iniciarVerificacion() {
  const equipoSerie = document.getElementById('equipo-verificar').value;
  const responsable = document.getElementById('responsable-verificacion').value;
  
  if (!equipoSerie || !responsable.trim()) {
    alert('Por favor selecciona un equipo y especifica el responsable de la verificación.');
    return;
  }
  
  const equipos = JSON.parse(localStorage.getItem("equiposMedicos")) || [];
  const equipo = equipos.find(e => e.serie === equipoSerie);
  
  if (!equipo) {
    alert('Equipo no encontrado.');
    return;
  }
  
  equipoEnVerificacion = equipo;
  mostrarFormularioVerificacion(equipo, responsable);
}

function mostrarFormularioVerificacion(equipo, responsable) {
  // Actualizar información del equipo
  document.getElementById('nombre-equipo-verificacion').textContent = equipo.nombre;
  document.getElementById('ubicacion-equipo-verificacion').textContent = `📍 ${equipo.ubicacion}`;
  document.getElementById('categoria-equipo-verificacion').textContent = `🏷️ ${formatCategoria(equipo.categoria)}`;
  document.getElementById('serie-equipo-verificacion').textContent = `🔢 ${equipo.serie}`;
  
  // Generar checklist según la categoría
  generarChecklist(equipo.categoria);
  
  // Mostrar formulario
  document.getElementById('formulario-verificacion').style.display = 'block';
  document.getElementById('formulario-verificacion').scrollIntoView({ behavior: 'smooth' });
  
  // Guardar responsable en el formulario
  document.getElementById('form-verificacion').dataset.responsable = responsable;
}

function generarChecklist(categoria) {
  const container = document.getElementById('checklist-container');
  const items = checklistsTemplates[categoria] || checklistsTemplates['general'];
  
  container.innerHTML = '<h4>📋 Lista de Verificación</h4>';
  
  items.forEach((item, index) => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'checklist-item';
    itemDiv.innerHTML = `
      <div class="checklist-descripcion">${item}</div>
      <div class="checklist-opciones">
        <label class="conforme">
          <input type="radio" name="check_${index}" value="conforme" onchange="actualizarEstiloChecklist(${index})">
          ✅ Conforme
        </label>
        <label class="no-conforme">
          <input type="radio" name="check_${index}" value="no-conforme" onchange="actualizarEstiloChecklist(${index})">
          ❌ No Conforme
        </label>
        <label class="na">
          <input type="radio" name="check_${index}" value="na" onchange="actualizarEstiloChecklist(${index})">
          ➖ N/A
        </label>
      </div>
    `;
    container.appendChild(itemDiv);
  });
}

function actualizarEstiloChecklist(index) {
  const item = document.querySelectorAll('.checklist-item')[index + 1]; // +1 por el h4
  const valorSeleccionado = document.querySelector(`input[name="check_${index}"]:checked`).value;
  
  // Remover clases anteriores
  item.classList.remove('conforme', 'no-conforme', 'na');
  
  // Agregar nueva clase
  item.classList.add(valorSeleccionado);
}

function guardarVerificacion() {
  const form = document.getElementById('form-verificacion');
  const responsable = form.dataset.responsable;
  const observaciones = document.getElementById('observaciones-verificacion').value;
  const resultadoGeneral = document.getElementById('resultado-general').value;
  
  if (!resultadoGeneral) {
    alert('Por favor selecciona el resultado general de la verificación.');
    return;
  }
  
  // Recopilar resultados del checklist
  const checklistResultados = [];
  const checklistItems = checklistsTemplates[equipoEnVerificacion.categoria] || checklistsTemplates['general'];
  
  let todosMarcados = true;
  checklistItems.forEach((item, index) => {
    const valorSeleccionado = document.querySelector(`input[name="check_${index}"]:checked`);
    if (valorSeleccionado) {
      checklistResultados.push({
        item: item,
        resultado: valorSeleccionado.value
      });
    } else {
      todosMarcados = false;
    }
  });
  
  if (!todosMarcados) {
    alert('Por favor completa todos los elementos del checklist.');
    return;
  }
  
  // Crear registro de verificación
  const verificacion = {
    id: Date.now(),
    fecha: new Date().toISOString(),
    fechaLocal: new Date().toLocaleDateString('es-MX'),
    equipoSerie: equipoEnVerificacion.serie,
    equipoNombre: equipoEnVerificacion.nombre,
    equipoUbicacion: equipoEnVerificacion.ubicacion,
    equipoCategoria: equipoEnVerificacion.categoria,
    responsable: responsable,
    checklist: checklistResultados,
    observaciones: observaciones,
    resultadoGeneral: resultadoGeneral
  };
  
  // Guardar en localStorage
  const verificaciones = JSON.parse(localStorage.getItem("verificaciones")) || [];
  verificaciones.unshift(verificacion); // Agregar al inicio
  localStorage.setItem("verificaciones", JSON.stringify(verificaciones));
  
  // Actualizar estado del equipo si es necesario
  if (resultadoGeneral === 'no-conforme') {
    actualizarEstadoEquipoPorVerificacion(equipoEnVerificacion.serie, 'mantenimiento');
  }
  
  alert('Verificación guardada correctamente.');
  cancelarVerificacion();
  cargarHistorialVerificaciones();
  actualizarDashboard(); // Actualizar dashboard
}

function actualizarEstadoEquipoPorVerificacion(serie, nuevoEstado) {
  const equipos = JSON.parse(localStorage.getItem("equiposMedicos")) || [];
  const equipoIndex = equipos.findIndex(e => e.serie === serie);
  
  if (equipoIndex !== -1) {
    equipos[equipoIndex].estado = nuevoEstado;
    equipos[equipoIndex].ultimaActualizacion = new Date().toISOString();
    localStorage.setItem("equiposMedicos", JSON.stringify(equipos));
    cargarEquipos(); // Recargar tabla de equipos
  }
}

function cancelarVerificacion() {
  document.getElementById('formulario-verificacion').style.display = 'none';
  document.getElementById('form-verificacion').reset();
  document.getElementById('equipo-verificar').value = '';
  document.getElementById('responsable-verificacion').value = '';
  equipoEnVerificacion = null;
}

function cargarHistorialVerificaciones() {
  const verificaciones = JSON.parse(localStorage.getItem("verificaciones")) || [];
  const tbody = document.querySelector('#tabla-verificaciones tbody');
  
  tbody.innerHTML = '';
  
  if (verificaciones.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #6c757d;">No hay verificaciones registradas</td></tr>';
    return;
  }
  
  // Mostrar las últimas 20 verificaciones
  const verificacionesRecientes = verificaciones.slice(0, 20);
  
  verificacionesRecientes.forEach(verificacion => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${verificacion.fechaLocal}</td>
      <td>${verificacion.equipoNombre}<br><small>${verificacion.equipoSerie}</small></td>
      <td>${verificacion.equipoUbicacion}</td>
      <td>${verificacion.responsable}</td>
      <td><span class="resultado-badge ${verificacion.resultadoGeneral}">${formatResultadoVerificacion(verificacion.resultadoGeneral)}</span></td>
      <td><button class="btn-ver-verificacion" onclick="verDetalleVerificacion(${verificacion.id})">Ver Detalle</button></td>
    `;
    tbody.appendChild(fila);
  });
}

function formatResultadoVerificacion(resultado) {
  switch(resultado) {
    case 'conforme': return 'Conforme';
    case 'observaciones': return 'Con Observaciones';
    case 'no-conforme': return 'No Conforme';
    default: return resultado;
  }
}

function verDetalleVerificacion(verificacionId) {
  const verificaciones = JSON.parse(localStorage.getItem("verificaciones")) || [];
  const verificacion = verificaciones.find(v => v.id === verificacionId);
  
  if (!verificacion) {
    alert('Verificación no encontrada.');
    return;
  }
  
  mostrarModalVerificacion(verificacion);
}

function mostrarModalVerificacion(verificacion) {
  const modal = document.createElement('div');
  modal.className = 'modal';
  
  const checklistHtml = verificacion.checklist.map(item => `
    <div class="checklist-detalle-item ${item.resultado}">
      <span class="checklist-resultado">${formatResultadoCheckItem(item.resultado)}</span>
      <span class="checklist-descripcion">${item.item}</span>
    </div>
  `).join('');
  
  modal.innerHTML = `
    <div class="modal-content modal-verificacion">
      <span class="close" onclick="cerrarModal()">&times;</span>
      <h2>Detalle de Verificación</h2>
      
      <div class="verificacion-info">
        <div class="info-grid">
          <div><strong>Fecha:</strong> ${verificacion.fechaLocal}</div>
          <div><strong>Equipo:</strong> ${verificacion.equipoNombre}</div>
          <div><strong>Serie:</strong> ${verificacion.equipoSerie}</div>
          <div><strong>Ubicación:</strong> ${verificacion.equipoUbicacion}</div>
          <div><strong>Categoría:</strong> ${formatCategoria(verificacion.equipoCategoria)}</div>
          <div><strong>Responsable:</strong> ${verificacion.responsable}</div>
        </div>
        
        <div class="resultado-principal">
          <strong>Resultado General:</strong>
          <span class="resultado-badge ${verificacion.resultadoGeneral}">
            ${formatResultadoVerificacion(verificacion.resultadoGeneral)}
          </span>
        </div>
      </div>
      
      <div class="checklist-detalle">
        <h3>Checklist Completado</h3>
        ${checklistHtml}
      </div>
      
      ${verificacion.observaciones ? `
        <div class="observaciones-detalle">
          <h3>Observaciones</h3>
          <p>${verificacion.observaciones}</p>
        </div>
      ` : ''}
    </div>
  `;
  
  document.body.appendChild(modal);
}

function formatResultadoCheckItem(resultado) {
  switch(resultado) {
    case 'conforme': return '✅';
    case 'no-conforme': return '❌';
    case 'na': return '➖';
    default: return '?';
  }
}

// Filtros y búsqueda
function aplicarFiltros() {
  const equipos = JSON.parse(localStorage.getItem("equiposMedicos")) || [];
  equiposOriginales = equipos;
  
  const textoBusqueda = document.getElementById('buscar-texto').value.toLowerCase();
  const filtroEstado = document.getElementById('filtro-estado').value;
  const filtroCategoria = document.getElementById('filtro-categoria').value;
  const filtroGarantia = document.getElementById('filtro-garantia').value;
  
  equiposFiltrados = equipos.filter(equipo => {
    // Filtro de texto (busca en múltiples campos)
    const coincideTexto = !textoBusqueda || 
      equipo.nombre.toLowerCase().includes(textoBusqueda) ||
      equipo.marca.toLowerCase().includes(textoBusqueda) ||
      equipo.modelo.toLowerCase().includes(textoBusqueda) ||
      equipo.serie.toLowerCase().includes(textoBusqueda) ||
      equipo.ubicacion.toLowerCase().includes(textoBusqueda) ||
      (equipo.responsable && equipo.responsable.toLowerCase().includes(textoBusqueda)) ||
      (equipo.proveedor && equipo.proveedor.toLowerCase().includes(textoBusqueda));
    
    // Filtro de estado
    const coincideEstado = !filtroEstado || equipo.estado === filtroEstado;
    
    // Filtro de categoría
    const coincideCategoria = !filtroCategoria || equipo.categoria === filtroCategoria;
    
    // Filtro de garantía
    const coincideGarantia = !filtroGarantia || verificarFiltroGarantia(equipo, filtroGarantia);
    
    return coincideTexto && coincideEstado && coincideCategoria && coincideGarantia;
  });
  
  mostrarEquiposFiltrados();
  actualizarContadores();
}

function verificarFiltroGarantia(equipo, filtroGarantia) {
  const estadoGarantia = getGarantiaEstado(equipo.fechaGarantia);
  
  switch(filtroGarantia) {
    case 'vigente':
      return estadoGarantia.class === 'vigente';
    case 'por-vencer':
      return estadoGarantia.class === 'por-vencer';
    case 'vencida':
      return estadoGarantia.class === 'vencida';
    case 'sin-garantia':
      return estadoGarantia.class === 'sin-garantia';
    default:
      return true;
  }
}

function mostrarEquiposFiltrados() {
  tabla.innerHTML = "";
  equiposFiltrados.forEach(equipo => agregarFilaTabla(equipo));
}

function limpiarFiltros() {
  document.getElementById('buscar-texto').value = '';
  document.getElementById('filtro-estado').value = '';
  document.getElementById('filtro-categoria').value = '';
  document.getElementById('filtro-garantia').value = '';
  aplicarFiltros();
}

function actualizarContadores() {
  const totalEquipos = equiposOriginales.length;
  const equiposMostrados = equiposFiltrados.length;
  
  document.getElementById('contador-equipos').textContent = `Total: ${totalEquipos} equipos`;
  
  if (equiposMostrados !== totalEquipos) {
    document.getElementById('contador-filtrados').textContent = `Mostrando: ${equiposMostrados} equipos`;
  } else {
    document.getElementById('contador-filtrados').textContent = '';
  }
}

function exportarCSV() {
  const equipos = equiposFiltrados.length > 0 ? equiposFiltrados : equiposOriginales;
  
  if (equipos.length === 0) {
    alert('No hay equipos para exportar.');
    return;
  }
  
  // Encabezados del CSV
  const headers = [
    'Serie', 'Nombre', 'Marca', 'Modelo', 'Ubicacion', 'Estado', 'Categoria',
    'Responsable', 'Departamento', 'Proveedor', 'Contrato', 'Fecha_Compra',
    'Fecha_Garantia', 'Costo_MXN', 'Imagen', 'Manual', 'Observaciones',
    'Fecha_Registro'
  ];
  
  // Convertir datos a formato CSV
  const csvContent = [
    headers.join(','),
    ...equipos.map(equipo => [
      `"${equipo.serie || ''}"`,
      `"${equipo.nombre || ''}"`,
      `"${equipo.marca || ''}"`,
      `"${equipo.modelo || ''}"`,
      `"${equipo.ubicacion || ''}"`,
      `"${formatEstado(equipo.estado) || ''}"`,
      `"${formatCategoria(equipo.categoria) || ''}"`,
      `"${equipo.responsable || ''}"`,
      `"${equipo.departamento || ''}"`,
      `"${equipo.proveedor || ''}"`,
      `"${equipo.contrato || ''}"`,
      `"${equipo.fechaCompra || ''}"`,
      `"${equipo.fechaGarantia || ''}"`,
      `"${equipo.costo || ''}"`,
      `"${equipo.imagen || ''}"`,
      `"${equipo.manual || ''}"`,
      `"${equipo.observaciones || ''}"`,
      `"${equipo.fechaRegistro || ''}"`
    ].join(','))
  ].join('\n');
  
  // Crear y descargar archivo
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `equipos_medicos_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  alert(`Se exportaron ${equipos.length} equipos correctamente.`);
}

// Funcionalidad de edición de equipos
function editarEquipo(serie) {
  const equipos = JSON.parse(localStorage.getItem("equiposMedicos")) || [];
  const equipo = equipos.find(eq => eq.serie === serie);
  if (equipo) {
    llenarFormularioParaEdicion(equipo);
    scrollToForm();
  }
}

function llenarFormularioParaEdicion(equipo) {
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
  
  // Cambiar el texto del botón y agregar indicador de edición
  const submitButton = document.querySelector('button[type="submit"]');
  submitButton.textContent = 'Actualizar Equipo';
  submitButton.style.backgroundColor = '#ffc107';
  
  // Marcar que estamos en modo edición
  form.dataset.editando = serie;
  
  // Agregar mensaje de edición
  mostrarMensajeEdicion(equipo.nombre);
}

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
      <strong>Modo Edición:</strong> Editando "${nombreEquipo}"
      <button onclick="cancelarEdicion()" class="btn-cancelar-edicion">Cancelar</button>
    </div>
  `;
  
  // Insertar antes del formulario
  form.parentNode.insertBefore(mensaje, form);
}

function cancelarEdicion() {
  // Limpiar formulario
  form.reset();
  
  // Restaurar botón
  const submitButton = document.querySelector('button[type="submit"]');
  submitButton.textContent = 'Registrar Equipo';
  submitButton.style.backgroundColor = '#28a745';
  
  // Quitar marca de edición
  delete form.dataset.editando;
  
  // Remover mensaje de edición
  const mensaje = document.querySelector('.mensaje-edicion');
  if (mensaje) {
    mensaje.remove();
  }
}

function scrollToForm() {
  form.scrollIntoView({ behavior: 'smooth' });
}

// Dashboard functionality
function actualizarDashboard() {
  const equipos = JSON.parse(localStorage.getItem("equiposMedicos")) || [];
  
  // Actualizar estadísticas principales
  actualizarEstadisticasPrincipales(equipos);
  
  // Actualizar alertas
  actualizarAlertas(equipos);
  
  // Actualizar distribución por categorías
  actualizarCategoriasDistribucion(equipos);
  
  // Actualizar equipos que requieren atención
  actualizarEquiposAtencion(equipos);
}

function actualizarEstadisticasPrincipales(equipos) {
  const total = equipos.length;
  const operativos = equipos.filter(e => e.estado === 'operativo').length;
  const mantenimiento = equipos.filter(e => e.estado === 'mantenimiento').length;
  const fueraServicio = equipos.filter(e => e.estado === 'fuera-servicio').length;
  
  document.getElementById('total-equipos').textContent = total;
  document.getElementById('equipos-operativos').textContent = operativos;
  document.getElementById('equipos-mantenimiento').textContent = mantenimiento;
  document.getElementById('equipos-fuera-servicio').textContent = fueraServicio;
}

function actualizarAlertas(equipos) {
  let garantiasVencidas = 0;
  let garantiasPorVencer = 0;
  let equiposCriticosProblema = 0;
  
  equipos.forEach(equipo => {
    const estadoGarantia = getGarantiaEstado(equipo.fechaGarantia);
    
    // Contar garantías vencidas
    if (estadoGarantia.class === 'vencida') {
      garantiasVencidas++;
    }
    
    // Contar garantías por vencer
    if (estadoGarantia.class === 'por-vencer') {
      garantiasPorVencer++;
    }
    
    // Contar equipos críticos con problemas
    if ((equipo.categoria === 'critico' || equipo.categoria === 'soporte-vida') && 
        (equipo.estado === 'mantenimiento' || equipo.estado === 'fuera-servicio')) {
      equiposCriticosProblema++;
    }
  });
  
  document.getElementById('garantias-vencidas').textContent = garantiasVencidas;
  document.getElementById('garantias-por-vencer').textContent = garantiasPorVencer;
  document.getElementById('equipos-criticos-problema').textContent = equiposCriticosProblema;
}

function actualizarCategoriasDistribucion(equipos) {
  const categorias = {
    'alta-tecnologia': 0,
    'soporte-vida': 0,
    'critico': 0,
    'general': 0
  };
  
  // Contar equipos por categoría
  equipos.forEach(equipo => {
    if (categorias.hasOwnProperty(equipo.categoria)) {
      categorias[equipo.categoria]++;
    }
  });
  
  const total = equipos.length || 1; // Evitar división por cero
  
  // Actualizar contadores y barras
  Object.keys(categorias).forEach(categoria => {
    const count = categorias[categoria];
    const percentage = (count / total) * 100;
    
    document.getElementById(`count-${categoria}`).textContent = count;
    document.getElementById(`bar-${categoria}`).style.width = `${percentage}%`;
  });
}

function actualizarEquiposAtencion(equipos) {
  const equiposProblema = [];
  
  equipos.forEach(equipo => {
    const problemas = [];
    
    // Verificar estado problemático
    if (equipo.estado === 'mantenimiento') {
      problemas.push('En mantenimiento');
    }
    if (equipo.estado === 'fuera-servicio') {
      problemas.push('Fuera de servicio');
    }
    
    // Verificar garantía
    const estadoGarantia = getGarantiaEstado(equipo.fechaGarantia);
    if (estadoGarantia.class === 'vencida') {
      problemas.push('Garantía vencida');
    }
    if (estadoGarantia.class === 'por-vencer') {
      problemas.push('Garantía por vencer');
    }
    
    // Verificar equipos críticos
    if ((equipo.categoria === 'critico' || equipo.categoria === 'soporte-vida') && 
        equipo.estado !== 'operativo') {
      problemas.push('Equipo crítico no operativo');
    }
    
    if (problemas.length > 0) {
      equiposProblema.push({
        equipo: equipo,
        problemas: problemas
      });
    }
  });
  
  mostrarEquiposAtencion(equiposProblema);
}

function mostrarEquiposAtencion(equiposProblema) {
  const container = document.getElementById('equipos-atencion');
  
  if (equiposProblema.length === 0) {
    container.innerHTML = '<div class="sin-problemas">✅ No hay equipos que requieran atención inmediata</div>';
    return;
  }
  
  // Ordenar por criticidad (críticos y soporte vida primero)
  equiposProblema.sort((a, b) => {
    const criticidadA = (a.equipo.categoria === 'critico' || a.equipo.categoria === 'soporte-vida') ? 1 : 0;
    const criticidadB = (b.equipo.categoria === 'critico' || b.equipo.categoria === 'soporte-vida') ? 1 : 0;
    return criticidadB - criticidadA;
  });
  
  container.innerHTML = equiposProblema.map(item => `
    <div class="equipo-atencion-item">
      <div class="equipo-atencion-info">
        <div class="equipo-atencion-nombre">
          ${item.equipo.nombre} - ${item.equipo.marca} (${item.equipo.serie})
        </div>
        <div class="equipo-atencion-problema">
          ${item.problemas.join(', ')}
        </div>
        <div class="equipo-atencion-ubicacion">
          📍 ${item.equipo.ubicacion} | ${formatCategoria(item.equipo.categoria)}
        </div>
      </div>
      <button class="btn-ver-equipo" onclick="verDetalles('${item.equipo.serie}')">
        Ver Detalles
      </button>
    </div>
  `).join('');
}

function generarReporteDashboard() {
  const equipos = JSON.parse(localStorage.getItem("equiposMedicos")) || [];
  
  if (equipos.length === 0) {
    alert('No hay equipos registrados para generar reporte.');
    return;
  }
  
  const total = equipos.length;
  const operativos = equipos.filter(e => e.estado === 'operativo').length;
  const mantenimiento = equipos.filter(e => e.estado === 'mantenimiento').length;
  const fueraServicio = equipos.filter(e => e.estado === 'fuera-servicio').length;
  
  const porcentajeOperativo = ((operativos / total) * 100).toFixed(1);
  
  let reporte = `=== REPORTE DEL DASHBOARD ===\n`;
  reporte += `Fecha: ${new Date().toLocaleDateString('es-MX')}\n\n`;
  reporte += `ESTADÍSTICAS GENERALES:\n`;
  reporte += `• Total de equipos: ${total}\n`;
  reporte += `• Equipos operativos: ${operativos} (${porcentajeOperativo}%)\n`;
  reporte += `• En mantenimiento: ${mantenimiento}\n`;
  reporte += `• Fuera de servicio: ${fueraServicio}\n\n`;
  
  // Alertas
  const garantiasVencidas = equipos.filter(e => getGarantiaEstado(e.fechaGarantia).class === 'vencida').length;
  const garantiasPorVencer = equipos.filter(e => getGarantiaEstado(e.fechaGarantia).class === 'por-vencer').length;
  
  reporte += `ALERTAS:\n`;
  reporte += `• Garantías vencidas: ${garantiasVencidas}\n`;
  reporte += `• Garantías por vencer: ${garantiasPorVencer}\n\n`;
  
  // Distribución por categorías
  const categorias = {};
  equipos.forEach(e => {
    categorias[e.categoria] = (categorias[e.categoria] || 0) + 1;
  });
  
  reporte += `DISTRIBUCIÓN POR CATEGORÍAS:\n`;
  Object.entries(categorias).forEach(([cat, count]) => {
    reporte += `• ${formatCategoria(cat)}: ${count}\n`;
  });
  
  // Crear y descargar archivo
  const blob = new Blob([reporte], { type: 'text/plain;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `reporte_dashboard_${new Date().toISOString().split('T')[0]}.txt`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  alert('Reporte del dashboard generado correctamente.');
}

// Filtrado y exportación de verificaciones
function aplicarFiltrosHistorial() {
  const equipoFiltro = document.getElementById('filtro-equipo-historial').value;
  const resultadoFiltro = document.getElementById('filtro-resultado-historial').value;
  const fechaDesde = document.getElementById('filtro-fecha-desde').value;
  const fechaHasta = document.getElementById('filtro-fecha-hasta').value;
  
  const verificaciones = JSON.parse(localStorage.getItem("verificaciones")) || [];
  
  let verificacionesFiltradas = verificaciones.filter(verificacion => {
    // Filtro por equipo
    if (equipoFiltro && verificacion.equipoSerie !== equipoFiltro) {
      return false;
    }
    
    // Filtro por resultado
    if (resultadoFiltro && verificacion.resultadoGeneral !== resultadoFiltro) {
      return false;
    }
    
    // Filtro por fecha
    if (fechaDesde || fechaHasta) {
      const fechaVerificacion = new Date(verificacion.fecha);
      
      if (fechaDesde) {
        const desde = new Date(fechaDesde);
        if (fechaVerificacion < desde) return false;
      }
      
      if (fechaHasta) {
        const hasta = new Date(fechaHasta);
        hasta.setHours(23, 59, 59); // Final del día
        if (fechaVerificacion > hasta) return false;
      }
    }
    
    return true;
  });
  
  mostrarVerificacionesFiltradas(verificacionesFiltradas);
}

function mostrarVerificacionesFiltradas(verificaciones) {
  const tbody = document.querySelector('#tabla-verificaciones tbody');
  tbody.innerHTML = '';
  
  if (verificaciones.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #6c757d;">No se encontraron verificaciones con los filtros aplicados</td></tr>';
    return;
  }
  
  verificaciones.forEach(verificacion => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${verificacion.fechaLocal}</td>
      <td>${verificacion.equipoNombre}<br><small>${verificacion.equipoSerie}</small></td>
      <td>${verificacion.equipoUbicacion}</td>
      <td>${verificacion.responsable}</td>
      <td><span class="resultado-badge ${verificacion.resultadoGeneral}">${formatResultadoVerificacion(verificacion.resultadoGeneral)}</span></td>
      <td><button class="btn-ver-verificacion" onclick="verDetalleVerificacion(${verificacion.id})">Ver Detalle</button></td>
    `;
    tbody.appendChild(fila);
  });
}

function exportarVerificaciones() {
  const verificaciones = JSON.parse(localStorage.getItem("verificaciones")) || [];
  
  if (verificaciones.length === 0) {
    alert('No hay verificaciones para exportar.');
    return;
  }
  
  const headers = [
    'Fecha', 'Equipo', 'Serie', 'Ubicacion', 'Categoria', 'Responsable', 
    'Resultado_General', 'Observaciones', 'Items_Conformes', 'Items_No_Conformes'
  ];
  
  const csvContent = [
    headers.join(','),
    ...verificaciones.map(v => {
      const conformes = v.checklist.filter(item => item.resultado === 'conforme').length;
      const noConformes = v.checklist.filter(item => item.resultado === 'no-conforme').length;
      
      return [
        `"${v.fechaLocal}"`,
        `"${v.equipoNombre}"`,
        `"${v.equipoSerie}"`,
        `"${v.equipoUbicacion}"`,
        `"${formatCategoria(v.equipoCategoria)}"`,
        `"${v.responsable}"`,
        `"${formatResultadoVerificacion(v.resultadoGeneral)}"`,
        `"${v.observaciones || ''}"`,
        `"${conformes}"`,
        `"${noConformes}"`
      ].join(',');
    })
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `verificaciones_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  alert(`Se exportaron ${verificaciones.length} verificaciones correctamente.`);
}

// NOTA: El CSV debe tener encabezados (opcional) y columnas en este orden:
// ubicacion, categoria, nombre, marca, modelo, serie, contrato, imagen, estado, responsable, departamento, proveedor, fechaCompra, fechaGarantia, costo, manual, observaciones
// Los primeros 8 campos son obligatorios para mantener compatibilidad, los demás son opcionales

// ==============================================
// SISTEMA DE ALERTAS AUTOMÁTICAS
// ==============================================

let alertasConfig = {};
let intervalVerificacionAlertas = null;
let notificacionesActivas = [];

function inicializarSistemaAlertas() {
  cargarConfiguracionAlertas();
  verificarYGenerarAlertas();
  iniciarVerificacionPeriodica();
  registrarAccionSistema('Sistema de alertas inicializado', 'informativa');
}

function cargarConfiguracionAlertas() {
  const configGuardada = localStorage.getItem('alertasConfig');
  if (configGuardada) {
    alertasConfig = JSON.parse(configGuardada);
  } else {
    // Configuración por defecto
    alertasConfig = {
      garantiaVencida: true,
      garantiaPorVencer: true,
      diasGarantiaAlerta: 30,
      equiposCriticos: true,
      verificacionesPendientes: true,
      mantenimientoProlongado: true,
      diasMantenimientoAlerta: 7,
      soporteVida: true,
      verificacionesNoConformes: true,
      frecuencia: 1800000 // 30 minutos
    };
    guardarConfiguracionAlertas();
  }
  
  // Aplicar configuración a la UI
  aplicarConfiguracionAUI();
}

function aplicarConfiguracionAUI() {
  document.getElementById('alerta-garantia-vencida').checked = alertasConfig.garantiaVencida;
  document.getElementById('alerta-garantia-por-vencer').checked = alertasConfig.garantiaPorVencer;
  document.getElementById('dias-garantia-alerta').value = alertasConfig.diasGarantiaAlerta;
  document.getElementById('alerta-equipos-criticos').checked = alertasConfig.equiposCriticos;
  document.getElementById('alerta-verificaciones-pendientes').checked = alertasConfig.verificacionesPendientes;
  document.getElementById('alerta-mantenimiento-prolongado').checked = alertasConfig.mantenimientoProlongado;
  document.getElementById('dias-mantenimiento-alerta').value = alertasConfig.diasMantenimientoAlerta;
  document.getElementById('alerta-soporte-vida').checked = alertasConfig.soporteVida;
  document.getElementById('alerta-verificaciones-no-conformes').checked = alertasConfig.verificacionesNoConformes;
  document.getElementById('frecuencia-alertas').value = alertasConfig.frecuencia;
}

function guardarConfiguracionAlertas() {
  alertasConfig = {
    garantiaVencida: document.getElementById('alerta-garantia-vencida').checked,
    garantiaPorVencer: document.getElementById('alerta-garantia-por-vencer').checked,
    diasGarantiaAlerta: parseInt(document.getElementById('dias-garantia-alerta').value),
    equiposCriticos: document.getElementById('alerta-equipos-criticos').checked,
    verificacionesPendientes: document.getElementById('alerta-verificaciones-pendientes').checked,
    mantenimientoProlongado: document.getElementById('alerta-mantenimiento-prolongado').checked,
    diasMantenimientoAlerta: parseInt(document.getElementById('dias-mantenimiento-alerta').value),
    soporteVida: document.getElementById('alerta-soporte-vida').checked,
    verificacionesNoConformes: document.getElementById('alerta-verificaciones-no-conformes').checked,
    frecuencia: parseInt(document.getElementById('frecuencia-alertas').value)
  };
  
  localStorage.setItem('alertasConfig', JSON.stringify(alertasConfig));
  
  // Reiniciar verificación periódica con nueva frecuencia
  iniciarVerificacionPeriodica();
  
  alert('Configuración de alertas guardada correctamente.');
  cerrarConfiguracionAlertas();
  
  // Verificar alertas inmediatamente
  verificarYGenerarAlertas();
  
  registrarAccionSistema('Configuración de alertas actualizada', 'informativa');
}

function iniciarVerificacionPeriodica() {
  // Limpiar intervalo anterior si existe
  if (intervalVerificacionAlertas) {
    clearInterval(intervalVerificacionAlertas);
  }
  
  // Iniciar nuevo intervalo
  intervalVerificacionAlertas = setInterval(() => {
    verificarYGenerarAlertas();
  }, alertasConfig.frecuencia);
}

function verificarYGenerarAlertas() {
  const equipos = JSON.parse(localStorage.getItem("equiposMedicos")) || [];
  const verificaciones = JSON.parse(localStorage.getItem("verificaciones")) || [];
  const nuevasAlertas = [];
  
  const ahora = new Date();
  
  // 1. Verificar garantías vencidas
  if (alertasConfig.garantiaVencida) {
    equipos.forEach(equipo => {
      if (equipo.fechaGarantia) {
        const vencimiento = new Date(equipo.fechaGarantia);
        if (vencimiento < ahora) {
          nuevasAlertas.push({
            id: `garantia-vencida-${equipo.serie}`,
            tipo: 'critica',
            titulo: '🚨 Garantía Vencida',
            mensaje: `La garantía del equipo "${equipo.nombre}" (${equipo.serie}) venció el ${new Date(equipo.fechaGarantia).toLocaleDateString('es-MX')}`,
            equipoSerie: equipo.serie,
            fechaCreacion: ahora.toISOString(),
            accion: 'ver-equipo'
          });
        }
      }
    });
  }
  
  // 2. Verificar garantías por vencer
  if (alertasConfig.garantiaPorVencer) {
    equipos.forEach(equipo => {
      if (equipo.fechaGarantia) {
        const vencimiento = new Date(equipo.fechaGarantia);
        const diasRestantes = Math.ceil((vencimiento - ahora) / (1000 * 60 * 60 * 24));
        
        if (diasRestantes > 0 && diasRestantes <= alertasConfig.diasGarantiaAlerta) {
          nuevasAlertas.push({
            id: `garantia-por-vencer-${equipo.serie}`,
            tipo: 'advertencia',
            titulo: '⚠️ Garantía por Vencer',
            mensaje: `La garantía del equipo "${equipo.nombre}" (${equipo.serie}) vence en ${diasRestantes} días`,
            equipoSerie: equipo.serie,
            fechaCreacion: ahora.toISOString(),
            accion: 'ver-equipo'
          });
        }
      }
    });
  }
  
  // 3. Verificar equipos críticos fuera de servicio
  if (alertasConfig.equiposCriticos) {
    equipos.forEach(equipo => {
      if ((equipo.categoria === 'critico' || equipo.categoria === 'soporte-vida') && 
          equipo.estado === 'fuera-servicio') {
        nuevasAlertas.push({
          id: `critico-fuera-${equipo.serie}`,
          tipo: 'critica',
          titulo: '🚨 Equipo Crítico Fuera de Servicio',
          mensaje: `El equipo crítico "${equipo.nombre}" (${equipo.serie}) está fuera de servicio`,
          equipoSerie: equipo.serie,
          fechaCreacion: ahora.toISOString(),
          accion: 'ver-equipo'
        });
      }
    });
  }
  
  // 4. Verificar equipos de soporte de vida con problemas
  if (alertasConfig.soporteVida) {
    equipos.forEach(equipo => {
      if (equipo.categoria === 'soporte-vida' && 
          (equipo.estado === 'mantenimiento' || equipo.estado === 'fuera-servicio')) {
        nuevasAlertas.push({
          id: `soporte-vida-problema-${equipo.serie}`,
          tipo: 'critica',
          titulo: '🚨 Equipo de Soporte de Vida con Problemas',
          mensaje: `El equipo de soporte de vida "${equipo.nombre}" (${equipo.serie}) está en estado: ${formatEstado(equipo.estado)}`,
          equipoSerie: equipo.serie,
          fechaCreacion: ahora.toISOString(),
          accion: 'ver-equipo'
        });
      }
    });
  }
  
  // 5. Verificar mantenimiento prolongado
  if (alertasConfig.mantenimientoProlongado) {
    equipos.forEach(equipo => {
      if (equipo.estado === 'mantenimiento' && equipo.ultimaActualizacion) {
        const ultimaActualizacion = new Date(equipo.ultimaActualizacion);
        const diasEnMantenimiento = Math.ceil((ahora - ultimaActualizacion) / (1000 * 60 * 60 * 24));
        
        if (diasEnMantenimiento >= alertasConfig.diasMantenimientoAlerta) {
          nuevasAlertas.push({
            id: `mantenimiento-prolongado-${equipo.serie}`,
            tipo: 'advertencia',
            titulo: '⚠️ Mantenimiento Prolongado',
            mensaje: `El equipo "${equipo.nombre}" (${equipo.serie}) lleva ${diasEnMantenimiento} días en mantenimiento`,
            equipoSerie: equipo.serie,
            fechaCreacion: ahora.toISOString(),
            accion: 'ver-equipo'
          });
        }
      }
    });
  }
  
  // 6. Verificar verificaciones no conformes recientes
  if (alertasConfig.verificacionesNoConformes) {
    const verificacionesRecientes = verificaciones.filter(v => {
      const fechaVerificacion = new Date(v.fecha);
      const horasTranscurridas = (ahora - fechaVerificacion) / (1000 * 60 * 60);
      return horasTranscurridas <= 24 && v.resultadoGeneral === 'no-conforme';
    });
    
    verificacionesRecientes.forEach(verificacion => {
      nuevasAlertas.push({
        id: `verificacion-no-conforme-${verificacion.id}`,
        tipo: 'advertencia',
        titulo: '⚠️ Verificación No Conforme',
        mensaje: `Verificación no conforme detectada para "${verificacion.equipoNombre}" (${verificacion.equipoSerie})`,
        equipoSerie: verificacion.equipoSerie,
        fechaCreacion: ahora.toISOString(),
        accion: 'ver-verificacion',
        verificacionId: verificacion.id
      });
    });
  }
  
  // 7. Verificar verificaciones diarias pendientes (equipos sin verificar en 24 horas)
  if (alertasConfig.verificacionesPendientes) {
    equipos.forEach(equipo => {
      if (equipo.estado === 'operativo' && 
          (equipo.categoria === 'critico' || equipo.categoria === 'soporte-vida')) {
        
        const ultimaVerificacion = verificaciones.find(v => 
          v.equipoSerie === equipo.serie && 
          new Date(v.fecha) > new Date(ahora.getTime() - 24 * 60 * 60 * 1000)
        );
        
        if (!ultimaVerificacion) {
          nuevasAlertas.push({
            id: `verificacion-pendiente-${equipo.serie}`,
            tipo: 'informativa',
            titulo: 'ℹ️ Verificación Diaria Pendiente',
            mensaje: `El equipo "${equipo.nombre}" (${equipo.serie}) no ha sido verificado en las últimas 24 horas`,
            equipoSerie: equipo.serie,
            fechaCreacion: ahora.toISOString(),
            accion: 'iniciar-verificacion'
          });
        }
      }
    });
  }
  
  // Agregar nuevas alertas (evitar duplicados)
  const alertasExistentes = JSON.parse(localStorage.getItem('notificacionesActivas')) || [];
  const idsExistentes = alertasExistentes.map(a => a.id);
  
  const alertasRealmente_nuevas = nuevasAlertas.filter(alerta => !idsExistentes.includes(alerta.id));
  
  if (alertasRealmente_nuevas.length > 0) {
    const todasLasAlertas = [...alertasExistentes, ...alertasRealmente_nuevas];
    localStorage.setItem('notificacionesActivas', JSON.stringify(todasLasAlertas));
    
    // Mostrar notificación del navegador si está permitido
    mostrarNotificacionNavegador(alertasRealmente_nuevas);
    
    // Registrar en el log
    registrarAccionSistema(`${alertasRealmente_nuevas.length} nuevas alertas generadas`, 'informativa');
  }
  
  // Actualizar UI
  actualizarUIAlertas();
}

function mostrarNotificacionNavegador(alertas) {
  if ('Notification' in window) {
    if (Notification.permission === 'granted') {
      alertas.forEach(alerta => {
        if (alerta.tipo === 'critica') {
          new Notification(alerta.titulo, {
            body: alerta.mensaje,
            icon: '🚨',
            requireInteraction: true
          });
        }
      });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          mostrarNotificacionNavegador(alertas.filter(a => a.tipo === 'critica'));
        }
      });
    }
  }
}

function actualizarUIAlertas() {
  const alertas = JSON.parse(localStorage.getItem('notificacionesActivas')) || [];
  
  // Actualizar contador de notificaciones
  document.getElementById('badge-total').textContent = alertas.length;
  
  // Contar por tipo
  const conteos = {
    critica: alertas.filter(a => a.tipo === 'critica').length,
    advertencia: alertas.filter(a => a.tipo === 'advertencia').length,
    informativa: alertas.filter(a => a.tipo === 'informativa').length,
    mantenimiento: alertas.filter(a => a.tipo === 'mantenimiento').length
  };
  
  document.getElementById('count-criticas').textContent = conteos.critica;
  document.getElementById('count-advertencias').textContent = conteos.advertencia;
  document.getElementById('count-informativas').textContent = conteos.informativa;
  document.getElementById('count-mantenimiento').textContent = conteos.mantenimiento;
  
  // Mostrar lista de notificaciones
  mostrarListaNotificaciones(alertas);
}

function mostrarListaNotificaciones(alertas) {
  const container = document.getElementById('lista-notificaciones');
  
  if (alertas.length === 0) {
    container.innerHTML = '<div class="sin-notificaciones">✅ No hay notificaciones activas</div>';
    return;
  }
  
  // Ordenar por criticidad y fecha
  const orden = { 'critica': 1, 'advertencia': 2, 'mantenimiento': 3, 'informativa': 4 };
  alertas.sort((a, b) => {
    if (orden[a.tipo] !== orden[b.tipo]) {
      return orden[a.tipo] - orden[b.tipo];
    }
    return new Date(b.fechaCreacion) - new Date(a.fechaCreacion);
  });
  
  container.innerHTML = alertas.map(alerta => `
    <div class="notificacion-item ${alerta.tipo} ${alerta.leida ? 'leida' : ''}" data-id="${alerta.id}">
      <div class="notificacion-content">
        <div class="notificacion-header">
          <span class="notificacion-titulo">${alerta.titulo}</span>
          <span class="notificacion-tiempo">${calcularTiempoTranscurrido(alerta.fechaCreacion)}</span>
        </div>
        <div class="notificacion-mensaje">${alerta.mensaje}</div>
        <div class="notificacion-acciones">
          ${generarBotonesAccion(alerta)}
          <button class="btn-marcar-leida" onclick="marcarAlertaLeida('${alerta.id}')">
            ${alerta.leida ? '📖 Leída' : '👁️ Marcar como leída'}
          </button>
          <button class="btn-descartar" onclick="descartarAlerta('${alerta.id}')">🗑️ Descartar</button>
        </div>
      </div>
    </div>
  `).join('');
}

function generarBotonesAccion(alerta) {
  switch(alerta.accion) {
    case 'ver-equipo':
      return `<button class="btn-accion-principal" onclick="verDetalles('${alerta.equipoSerie}')">👁️ Ver Equipo</button>`;
    case 'ver-verificacion':
      return `<button class="btn-accion-principal" onclick="verDetalleVerificacion(${alerta.verificacionId})">👁️ Ver Verificación</button>`;
    case 'iniciar-verificacion':
      return `<button class="btn-accion-principal" onclick="iniciarVerificacionDesdeAlerta('${alerta.equipoSerie}')">🔍 Verificar Ahora</button>`;
    default:
      return '';
  }
}

function calcularTiempoTranscurrido(fechaCreacion) {
  const ahora = new Date();
  const fecha = new Date(fechaCreacion);
  const diferencia = ahora - fecha;
  
  const minutos = Math.floor(diferencia / (1000 * 60));
  const horas = Math.floor(diferencia / (1000 * 60 * 60));
  const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
  
  if (dias > 0) return `hace ${dias} día${dias > 1 ? 's' : ''}`;
  if (horas > 0) return `hace ${horas} hora${horas > 1 ? 's' : ''}`;
  if (minutos > 0) return `hace ${minutos} minuto${minutos > 1 ? 's' : ''}`;
  return 'hace un momento';
}

function marcarAlertaLeida(alertaId) {
  const alertas = JSON.parse(localStorage.getItem('notificacionesActivas')) || [];
  const alertaIndex = alertas.findIndex(a => a.id === alertaId);
  
  if (alertaIndex !== -1) {
    alertas[alertaIndex].leida = true;
    localStorage.setItem('notificacionesActivas', JSON.stringify(alertas));
    actualizarUIAlertas();
  }
}

function descartarAlerta(alertaId) {
  const alertas = JSON.parse(localStorage.getItem('notificacionesActivas')) || [];
  const alertasFiltradas = alertas.filter(a => a.id !== alertaId);
  localStorage.setItem('notificacionesActivas', JSON.stringify(alertasFiltradas));
  actualizarUIAlertas();
  registrarAccionSistema('Alerta descartada', 'informativa');
}

function marcarTodasLeidasAlertas() {
  const alertas = JSON.parse(localStorage.getItem('notificacionesActivas')) || [];
  alertas.forEach(alerta => alerta.leida = true);
  localStorage.setItem('notificacionesActivas', JSON.stringify(alertas));
  actualizarUIAlertas();
  registrarAccionSistema('Todas las alertas marcadas como leídas', 'informativa');
}

function limpiarNotificaciones() {
  if (confirm('¿Estás seguro de que quieres limpiar todas las notificaciones?')) {
    localStorage.setItem('notificacionesActivas', JSON.stringify([]));
    actualizarUIAlertas();
    registrarAccionSistema('Notificaciones limpiadas', 'informativa');
  }
}

function abrirConfiguracionAlertas() {
  document.getElementById('modal-configuracion-alertas').style.display = 'block';
}

function cerrarConfiguracionAlertas() {
  document.getElementById('modal-configuracion-alertas').style.display = 'none';
}

function probarAlertas() {
  const alertaPrueba = {
    id: `prueba-${Date.now()}`,
    tipo: 'informativa',
    titulo: '🧪 Alerta de Prueba',
    mensaje: 'Esta es una alerta de prueba para verificar que el sistema funciona correctamente',
    fechaCreacion: new Date().toISOString(),
    accion: 'ninguna'
  };
  
  const alertas = JSON.parse(localStorage.getItem('notificacionesActivas')) || [];
  alertas.push(alertaPrueba);
  localStorage.setItem('notificacionesActivas', JSON.stringify(alertas));
  
  actualizarUIAlertas();
  registrarAccionSistema('Alerta de prueba generada', 'informativa');
  
  alert('Alerta de prueba generada. Revisa el panel de notificaciones.');
}

function iniciarVerificacionDesdeAlerta(equipoSerie) {
  // Seleccionar el equipo en el dropdown
  document.getElementById('equipo-verificar').value = equipoSerie;
  
  // Hacer scroll al módulo de verificación
  document.getElementById('modulo-verificacion').scrollIntoView({ behavior: 'smooth' });
  
  // Enfocar el campo de responsable
  setTimeout(() => {
    document.getElementById('responsable-verificacion').focus();
  }, 1000);
}

function registrarAccionSistema(accion, tipo) {
  const acciones = JSON.parse(localStorage.getItem('logAccionesSistema')) || [];
  const nuevaAccion = {
    id: Date.now(),
    fecha: new Date().toISOString(),
    fechaLocal: new Date().toLocaleString('es-MX'),
    accion: accion,
    tipo: tipo
  };
  
  acciones.unshift(nuevaAccion);
  
  // Mantener solo las últimas 50 acciones
  if (acciones.length > 50) {
    acciones.splice(50);
  }
  
  localStorage.setItem('logAccionesSistema', JSON.stringify(acciones));
  actualizarLogAcciones();
}

function actualizarLogAcciones() {
  const acciones = JSON.parse(localStorage.getItem('logAccionesSistema')) || [];
  const container = document.getElementById('log-acciones');
  
  if (acciones.length === 0) {
    container.innerHTML = '<div class="sin-acciones">No hay acciones registradas</div>';
    return;
  }
  
  // Mostrar las últimas 10 acciones
  const accionesRecientes = acciones.slice(0, 10);
  
  container.innerHTML = accionesRecientes.map(accion => `
    <div class="accion-item ${accion.tipo}">
      <span class="accion-tiempo">${accion.fechaLocal}</span>
      <span class="accion-descripcion">${accion.accion}</span>
    </div>
  `).join('');
}
