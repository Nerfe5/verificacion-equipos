// main.js

// ==============================================
// VARIABLES GLOBALES
// ==============================================
let equiposOriginales = [];
let equiposFiltrados = [];

// Variables para el sistema de alertas
let alertasActivas = [];
let configuracionAlertas = {
  garantiaVencida: true,
  garantiaPorVencer: true,
  diasGarantiaAlerta: 30,
  equiposCriticos: true,
  verificacionesPendientes: true,
  mantenimientoProlongado: true,
  diasMantenimientoAlerta: 7,
  soporteVida: true,
  verificacionesNoConformes: true,
  frecuenciaAlertas: 1800000 // 30 minutos por defecto
};
let intervalVerificacionAlertas = null;

// Obtener referencias
const form = document.getElementById("form-equipo");
const tabla = document.getElementById("tabla-equipos").querySelector("tbody");

// Función para inicializar módulo de verificación diaria (stub)
function inicializarModuloVerificacion() {
  // Cargar selector de equipos para verificación
  cargarEquiposEnSelector();
  // Ocultar formulario de verificación al iniciar
  const formulario = document.getElementById('formulario-verificacion');
  if (formulario) formulario.style.display = 'none';
}

// ========================================
// INICIALIZACIÓN DE LA APLICACIÓN
// ========================================
// Esta función se ejecuta cuando se carga la página
// NO carga datos de prueba automáticamente
// Solo inicializa la interfaz con los datos existentes
window.onload = function () {
  // ========================================
  // 1. LIMPIAR NÚMEROS DE SERIE PROBLEMÁTICOS
  // ========================================
  // Detecta y corrige automáticamente números de serie con comillas
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
  
  // ========================================
  // 2. NOTA IMPORTANTE SOBRE DATOS DE PRUEBA
  // ========================================
  // Los datos de prueba se cargan ÚNICAMENTE cuando el usuario
  // presiona explícitamente el botón "📋 Cargar Datos de Prueba"
  // NO se cargan automáticamente aquí
  
  // ========================================
  // 3. INICIALIZAR INTERFAZ Y MÓDULOS
  // ========================================
  cargarEquipos(); // Cargar equipos existentes (NO crea nuevos)
  actualizarDashboard(); // Actualizar dashboard con datos existentes
  inicializarModuloVerificacion(); // Inicializar verificación
  inicializarSistemaAlertas(); // Inicializar sistema de alertas
  inicializarDashboardGrafico(); // Inicializar dashboard gráfico
  
  // ========================================
  // 4. CONFIGURAR EVENT LISTENERS
  // ========================================
  
  // Event listeners para el formulario de registro de equipos
  form.addEventListener("submit", manejarSubmitEquipo);
  
  // Event listener para el botón de cancelar
  const btnCancelar = document.getElementById('btn-cancelar');
  if (btnCancelar) {
    btnCancelar.addEventListener('click', cancelarEdicion);
  }
  
  // Event listeners para botones de utilidad
  const btnCargarDatos = document.getElementById('cargarDatosPrueba');
  const btnLimpiarSeries = document.getElementById('limpiarSeries');
  const btnLimpiarDatos = document.getElementById('limpiarDatos');
  
  if (btnCargarDatos) {
    btnCargarDatos.addEventListener('click', () => {
      if (typeof cargarDatosPrueba === 'function') {
        cargarDatosPrueba();
      } else {
        alert('La función cargarDatosPrueba no está disponible. Asegúrate de que el archivo agregar_datos_prueba.js esté cargado.');
      }
    });
  }
  
  if (btnLimpiarSeries) {
    btnLimpiarSeries.addEventListener('click', limpiarNumerosSerieProblematicos);
  }
  
  if (btnLimpiarDatos) {
    btnLimpiarDatos.addEventListener('click', limpiarTodosLosDatos);
  }
  
  // ========================================
  // EVENT LISTENER DEL FORMULARIO PRINCIPAL
  // ========================================
  // CRÍTICO: Sin esto no funciona el registro manual
  form.addEventListener('submit', manejarSubmitEquipo);
  
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
  const btnMarcarLeidas = document.getElementById('marcar-todas-leidas');
  const btnConfigurarAlertas = document.getElementById('configurar-alertas');
  const btnLimpiarNotificaciones = document.getElementById('limpiar-notificaciones');
  const btnGuardarConfiguracion = document.getElementById('guardar-configuracion');
  const btnProbarAlertas = document.getElementById('probar-alertas');
  
  if (btnMarcarLeidas) btnMarcarLeidas.addEventListener('click', marcarTodasLeidasAlertas);
  if (btnConfigurarAlertas) btnConfigurarAlertas.addEventListener('click', abrirConfiguracionAlertas);
  if (btnLimpiarNotificaciones) btnLimpiarNotificaciones.addEventListener('click', limpiarNotificaciones);
  if (btnGuardarConfiguracion) btnGuardarConfiguracion.addEventListener('click', guardarConfiguracionAlertas);
  if (btnProbarAlertas) btnProbarAlertas.addEventListener('click', probarAlertas);
  
  // Verificar que los botones fueron encontrados
  console.log('Botones de alertas encontrados:', {
    marcarLeidas: !!btnMarcarLeidas,
    configurarAlertas: !!btnConfigurarAlertas,
    limpiarNotificaciones: !!btnLimpiarNotificaciones,
    guardarConfiguracion: !!btnGuardarConfiguracion,
    probarAlertas: !!btnProbarAlertas
  });
  
  // Event listener para cerrar modal with escape
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      cerrarConfiguracionAlertas();
    }
  });
  
  // Event listener para cerrar modal haciendo click fuera
  document.getElementById('modal-configuracion-alertas')?.addEventListener('click', function(e) {
    if (e.target === this) {
      cerrarConfiguracionAlertas();
    }
  });
  
  // Registrar inicialización del sistema
  registrarEventoSistema('Sistema iniciado correctamente', 'Todos los módulos cargados');
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

// Función para editar equipo
function editarEquipo(serie) {
  const equipos = JSON.parse(localStorage.getItem("equiposMedicos")) || [];
  const equipo = equipos.find(e => e.serie === serie);
  
  if (!equipo) {
    alert('Equipo no encontrado.');
    return;
  }
  
  // Confirmar acción
  if (!confirm(`¿Deseas editar el equipo "${equipo.nombre}" (${equipo.serie})?`)) {
    return;
  }
  
  // Llenar el formulario con los datos del equipo
  document.getElementById("nombre").value = equipo.nombre || '';
  document.getElementById("marca").value = equipo.marca || '';
  document.getElementById("modelo").value = equipo.modelo || '';
  document.getElementById("serie").value = equipo.serie || '';
  document.getElementById("categoria").value = equipo.categoria || 'general';
  document.getElementById("estado").value = equipo.estado || 'operativo';
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
  
  // Activar modo edición
  activarModoEdicion(serie, 'Actualizar Equipo');
  
  // Hacer scroll al formulario
  form.scrollIntoView({ behavior: 'smooth' });
  
  // Mostrar mensaje de modo edición
  mostrarMensajeEdicion(`Modo edición activado para "${equipo.nombre}". Modifica los datos y presiona "Actualizar Equipo" o "Cancelar".`);
}

// Función para clonar equipo
function clonarEquipo(serie) {
  const equipos = JSON.parse(localStorage.getItem("equiposMedicos")) || [];
  const equipo = equipos.find(e => e.serie === serie);
  
  if (!equipo) {
    alert('Equipo no encontrado.');
    return;
  }
  
  // Confirmar acción
  if (!confirm(`¿Deseas clonar el equipo "${equipo.nombre}" (${equipo.serie})?`)) {
    return;
  }
  
  // Llenar el formulario con los datos del equipo
  document.getElementById("nombre").value = equipo.nombre || '';
  document.getElementById("marca").value = equipo.marca || '';
  document.getElementById("modelo").value = equipo.modelo || '';
  document.getElementById("serie").value = ''; // Serie vacía para evitar duplicados
  document.getElementById("categoria").value = equipo.categoria || 'general';
  document.getElementById("estado").value = equipo.estado || 'operativo';
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
  
  // Activar modo clonación
  activarModoClonacion('Registrar Equipo Clonado');
  
  // Hacer scroll al formulario
  form.scrollIntoView({ behavior: 'smooth' });
  
  // Foco en el campo de número de serie
  document.getElementById("serie").focus();
  
  // Mostrar mensaje de modo clonación
  mostrarMensajeEdicion(`Equipo "${equipo.nombre}" clonado. Modifica el número de serie y otros datos según sea necesario.`);
}

// Función para activar modo edición
function activarModoEdicion(serie, textoBoton) {
  // Marcar el formulario como en modo edición
  form.dataset.editando = serie;
  
  // Cambiar apariencia del formulario
  form.classList.add('form-editing');
  
  // Cambiar el texto y estilo del botón de submit
  const submitButton = document.getElementById('btn-submit');
  const cancelButton = document.getElementById('btn-cancelar');
  
  if (submitButton) {
    submitButton.textContent = textoBoton;
  }
  
  // Mostrar botón de cancelar
  if (cancelButton) {
    cancelButton.style.display = 'inline-block';
  }
}

// Función para activar modo clonación
function activarModoClonacion(textoBoton) {
  // Marcar el formulario como en modo clonación
  form.dataset.clonando = 'true';
  
  // Cambiar apariencia del formulario
  form.classList.add('form-editing');
  
  // Cambiar el texto del botón de submit
  const submitButton = document.getElementById('btn-submit');
  const cancelButton = document.getElementById('btn-cancelar');
  
  if (submitButton) {
    submitButton.textContent = textoBoton;
  }
  
  // Mostrar botón de cancelar
  if (cancelButton) {
    cancelButton.style.display = 'inline-block';
  }
}

// Función para mostrar mensaje de edición
function mostrarMensajeEdicion(mensaje) {
  // Crear o actualizar el mensaje
  let mensajeDiv = document.getElementById('mensaje-edicion');
  if (!mensajeDiv) {
    mensajeDiv = document.createElement('div');
    mensajeDiv.id = 'mensaje-edicion';
    mensajeDiv.style.cssText = `
      background-color: #fff3cd;
      color: #856404;
      padding: 12px;
      border: 1px solid #ffeaa7;
      border-radius: 4px;
      margin-bottom: 15px;
      font-weight: bold;
      text-align: center;
    `;
    form.insertBefore(mensajeDiv, form.firstChild);
  }
  
  mensajeDiv.textContent = mensaje;
  mensajeDiv.style.display = 'block';
}

// Función para ocultar mensaje de edición
function ocultarMensajeEdicion() {
  const mensajeDiv = document.getElementById('mensaje-edicion');
  if (mensajeDiv) {
    mensajeDiv.style.display = 'none';
  }
}

// Función para activar modo edición
function activarModoEdicion(serie, textoBoton) {
  // Marcar el formulario como en modo edición
  form.dataset.editando = serie;
  
  // Cambiar apariencia del formulario
  form.classList.add('form-editing');
  
  // Cambiar el texto y estilo del botón de submit
  const submitButton = document.getElementById('btn-submit');
  const cancelButton = document.getElementById('btn-cancelar');
  
  if (submitButton) {
    submitButton.textContent = textoBoton;
  }
  
  // Mostrar botón de cancelar
  if (cancelButton) {
    cancelButton.style.display = 'inline-block';
  }
}

// Función para activar modo clonación
function activarModoClonacion(textoBoton) {
  // Marcar el formulario como en modo clonación
  form.dataset.clonando = 'true';
  
  // Cambiar apariencia del formulario
  form.classList.add('form-editing');
  
  // Cambiar el texto del botón de submit
  const submitButton = document.getElementById('btn-submit');
  const cancelButton = document.getElementById('btn-cancelar');
  
  if (submitButton) {
    submitButton.textContent = textoBoton;
  }
  
  // Mostrar botón de cancelar
  if (cancelButton) {
    cancelButton.style.display = 'inline-block';
  }
}

// Función para mostrar mensaje de edición
function mostrarMensajeEdicion(mensaje) {
  // Crear o actualizar el mensaje
  let mensajeDiv = document.getElementById('mensaje-edicion');
  if (!mensajeDiv) {
    mensajeDiv = document.createElement('div');
    mensajeDiv.id = 'mensaje-edicion';
    mensajeDiv.style.cssText = `
      background-color: #fff3cd;
      color: #856404;
      padding: 12px;
      border: 1px solid #ffeaa7;
      border-radius: 4px;
      margin-bottom: 15px;
      font-weight: bold;
      text-align: center;
    `;
    form.insertBefore(mensajeDiv, form.firstChild);
  }
  
  mensajeDiv.textContent = mensaje;
  mensajeDiv.style.display = 'block';
}

// Función para ocultar mensaje de edición
function ocultarMensajeEdicion() {
  const mensajeDiv = document.getElementById('mensaje-edicion');
  if (mensajeDiv) {
    mensajeDiv.style.display = 'none';
  }
}

// Función para cancelar edición
function cancelarEdicion() {
  // Confirmar cancelación
  if (form.dataset.editando || form.dataset.clonando) {
    if (!confirm('¿Estás seguro de que deseas cancelar? Se perderán todos los cambios.')) {
      return;
    }
  }
  
  // Limpiar el modo edición/clonación
  delete form.dataset.editando;
  delete form.dataset.clonando;
  
  // Restaurar apariencia del formulario
  form.classList.remove('form-editing');
  
  // Restaurar el texto y estilo del botón de submit
  const submitButton = document.getElementById('btn-submit');
  const cancelButton = document.getElementById('btn-cancelar');
  
  if (submitButton) {
    submitButton.textContent = 'Registrar Equipo';
  }
  
  // Ocultar botón de cancelar
  if (cancelButton) {
    cancelButton.style.display = 'none';
  }
  
  // Limpiar el formulario
  form.reset();
  
  // Ocultar mensaje de edición
  ocultarMensajeEdicion();
  
  // Hacer scroll al formulario
  form.scrollIntoView({ behavior: 'smooth' });
  
  // Mensaje de confirmación
  alert('Operación cancelada. El formulario ha sido limpiado.');
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

// Función para cargar equipos en selectores
function cargarEquiposEnSelector() {
  const equipos = JSON.parse(localStorage.getItem("equiposMedicos")) || [];
  const selector = document.getElementById('equipo-verificar');
  
  if (selector) {
    selector.innerHTML = '<option value="">Seleccionar equipo...</option>';
    equipos.forEach(equipo => {
      const option = document.createElement('option');
      option.value = equipo.serie;
      option.textContent = `${equipo.nombre} (${equipo.serie}) - ${equipo.ubicacion}`;
      selector.appendChild(option);
    });
  }
  
  // También cargar en filtros de historial
  const filtroHistorial = document.getElementById('filtro-equipo-historial');
  if (filtroHistorial) {
    filtroHistorial.innerHTML = '<option value="">Todos los equipos</option>';
    equipos.forEach(equipo => {
      const option = document.createElement('option');
      option.value = equipo.serie;
      option.textContent = `${equipo.nombre} (${equipo.serie})`;
      filtroHistorial.appendChild(option);
    });
  }
}

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
  
  // Actualizar también el dashboard gráfico
  actualizarDashboardGrafico();
}

// ==============================================
// FUNCIONES PARA DASHBOARD GRÁFICO CSS
// ==============================================

// Función principal para actualizar todos los gráficos
function actualizarDashboardGrafico() {
  const equipos = JSON.parse(localStorage.getItem("equiposMedicos")) || [];
  
  actualizarGraficoEstados(equipos);
  actualizarIndicadorOperatividad(equipos);
  actualizarGraficoCategorias(equipos);
  actualizarMetricasGarantias(equipos);
}

// Función para actualizar gráfico de estados (barras CSS)
function actualizarGraficoEstados(equipos) {
  const estados = {
    'operativo': 0,
    'mantenimiento': 0,
    'fuera-servicio': 0,
    'en-calibracion': 0
  };
  
  // Contar equipos por estado
  equipos.forEach(equipo => {
    if (estados.hasOwnProperty(equipo.estado)) {
      estados[equipo.estado]++;
    }
  });
  
  const totalEquipos = equipos.length || 1;
  
  // Actualizar barras y valores
  Object.keys(estados).forEach(estado => {
    const count = estados[estado];
    const porcentaje = (count / totalEquipos) * 100;
    
    const barra = document.getElementById(`barra-${estado}`);
    const valor = document.getElementById(`valor-${estado}`);
    
    if (barra && valor) {
      // Animación de la barra
      setTimeout(() => {
        barra.style.width = `${porcentaje}%`;
      }, 100);
      
      valor.textContent = count;
      barra.setAttribute('data-count', count);
    }
  });
}

// Función para actualizar indicador circular de operatividad
function actualizarIndicadorOperatividad(equipos) {
  const totalEquipos = equipos.length;
  const equiposOperativos = equipos.filter(e => e.estado === 'operativo').length;
  const porcentajeOperatividad = totalEquipos > 0 ? (equiposOperativos / totalEquipos) * 100 : 0;
  
  const circleProgress = document.getElementById('circle-operatividad');
  const percentageElement = document.getElementById('operatividad-percentage');
  const textoOperativos = document.getElementById('equipos-operativos-texto');
  
  if (circleProgress && percentageElement && textoOperativos) {
    // Calcular el ángulo para el gradiente cónico
    const angulo = (porcentajeOperatividad / 100) * 360;
    
    // Colores basados en el porcentaje
    let color = '#e74c3c'; // Rojo para bajo
    if (porcentajeOperatividad >= 80) {
      color = '#27ae60'; // Verde para alto
    } else if (porcentajeOperatividad >= 60) {
      color = '#f39c12'; // Amarillo para medio
    }
    
    // Actualizar el círculo con animación
    setTimeout(() => {
      circleProgress.style.background = `conic-gradient(${color} 0deg, ${color} ${angulo}deg, #e9ecef ${angulo}deg)`;
    }, 200);
    
    percentageElement.textContent = `${Math.round(porcentajeOperatividad)}%`;
    textoOperativos.textContent = `${equiposOperativos} de ${totalEquipos} equipos operativos`;
  }
}

// Función para actualizar gráfico de categorías
function actualizarGraficoCategorias(equipos) {
  const categorias = {
    'alta_tecnologia': 0,
    'soporte_vida': 0,
    'critico': 0,
    'general': 0
  };
  
  // Contar equipos por categoría
  equipos.forEach(equipo => {
    if (categorias.hasOwnProperty(equipo.categoria)) {
      categorias[equipo.categoria]++;
    }
  });
  
  const totalEquipos = equipos.length || 1;
  
  // Actualizar barras y valores
  Object.keys(categorias).forEach(categoria => {
    const count = categorias[categoria];
    const porcentaje = (count / totalEquipos) * 100;
    
    const barra = document.getElementById(`cat-barra-${categoria}`);
    const valor = document.getElementById(`cat-valor-${categoria}`);
    
    if (barra && valor) {
      // Animación de la barra
      setTimeout(() => {
        barra.style.width = `${porcentaje}%`;
      }, 150);
      
      valor.textContent = count;
    }
  });
}

// Función para actualizar métricas de garantías
function actualizarMetricasGarantias(equipos) {
  const ahora = new Date();
  let garantiasVigentes = 0;
  let garantiasPorVencer = 0;
  let garantiasVencidas = 0;
  
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
  
  // Actualizar valores
  const vigentesElement = document.getElementById('garantias-vigentes-count');
  const porVencerElement = document.getElementById('garantias-por-vencer-count');
  const vencidasElement = document.getElementById('garantias-vencidas-count');
  
  if (vigentesElement) vigentesElement.textContent = garantiasVigentes;
  if (porVencerElement) porVencerElement.textContent = garantiasPorVencer;
  if (vencidasElement) vencidasElement.textContent = garantiasVencidas;
}

// Función para exportar dashboard como imagen (básica)
function exportarDashboardImagen() {
  // Implementación básica - en el futuro se puede mejorar con html2canvas
  const dashboardData = {
    fecha: new Date().toISOString(),
    equipos: JSON.parse(localStorage.getItem("equiposMedicos")) || [],
    timestamp: Date.now()
  };
  
  const dataStr = JSON.stringify(dashboardData, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `dashboard_equipos_${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  
  URL.revokeObjectURL(url);
  
  alert('Dashboard exportado como archivo JSON. En futuras versiones se podrá exportar como imagen.');
}

// Función para inicializar el dashboard gráfico
function inicializarDashboardGrafico() {
  // Agregar event listeners para los botones del dashboard gráfico
  const btnActualizarGraficos = document.getElementById('actualizar-graficos');
  const btnExportarDashboard = document.getElementById('exportar-dashboard-imagen');
  
  if (btnActualizarGraficos) {
    btnActualizarGraficos.addEventListener('click', () => {
      actualizarDashboardGrafico();
      // Actualizar también el dashboard principal
      actualizarDashboard();
      alert('Gráficos actualizados correctamente');
    });
  }
  
  if (btnExportarDashboard) {
    btnExportarDashboard.addEventListener('click', exportarDashboardImagen);
  }
  
  // Actualizar gráficos al inicializar
  actualizarDashboardGrafico();
}

// Función modificada de actualizar dashboard para incluir gráficos
function actualizarDashboard() {
  const equipos = JSON.parse(localStorage.getItem("equiposMedicos")) || [];
  
  // Estadísticas principales (código existente)
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
  
  // Actualizar también el dashboard gráfico
  actualizarDashboardGrafico();
}

// Función para limpiar filtros y recargar vista
function limpiarFiltros() {
  const buscar = document.getElementById('buscar-texto');
  const estado = document.getElementById('filtro-estado');
  const categoria = document.getElementById('filtro-categoria');
  const garantia = document.getElementById('filtro-garantia');
  if (buscar) buscar.value = '';
  if (estado) estado.value = '';
  if (categoria) categoria.value = '';
  if (garantia) garantia.value = '';
  cargarEquipos();
  actualizarDashboard();
}

// ==============================================
// FUNCIONES DE DEPURACIÓN Y PRUEBA
// ==============================================

// Función para verificar el estado del sistema de alertas
function diagnosticarSistemaAlertas() {
  console.log('🔍 DIAGNÓSTICO DEL SISTEMA DE ALERTAS');
  console.log('=====================================');
  
  // Verificar elementos del DOM
  const elementos = [
    'configurar-alertas',
    'modal-configuracion-alertas',
    'marcar-todas-leidas',
    'limpiar-notificaciones',
    'lista-notificaciones',
    'badge-total'
  ];
  
  console.log('📋 Elementos del DOM:');
  elementos.forEach(id => {
    const elemento = document.getElementById(id);
    console.log(`  ${id}: ${elemento ? '✅ Encontrado' : '❌ No encontrado'}`);
  });
  
  // Verificar configuración
  console.log('⚙️ Configuración actual:', configuracionAlertas);
  
  // Verificar alertas activas
  console.log(`🔔 Alertas activas: ${alertasActivas.length}`);
  
  // Verificar event listeners (simulación)
  console.log('👂 Probando event listeners...');
  const btnConfiguracion = document.getElementById('configurar-alertas');
  if (btnConfiguracion) {
    console.log('  ✅ Botón configurar-alertas encontrado');
    // Simular click
    try {
      abrirConfiguracionAlertas();
      console.log('  ✅ Función abrirConfiguracionAlertas ejecutada');
    } catch (error) {
      console.log('  ❌ Error al ejecutar función:', error);
    }
  }
  
  console.log('=====================================');
}

// Función para probar manualmente el botón
function probarBotonConfiguracion() {
  console.log('🧪 Probando botón de configuración manualmente...');
  
  const boton = document.getElementById('configurar-alertas');
  if (boton) {
    console.log('✅ Botón encontrado, simulando click...');
    boton.click();
  } else {
    console.error('❌ Botón no encontrado');
  }
}

// Exportar funciones de depuración a la ventana global para acceso desde consola
window.debugAlertas = {
  diagnosticar: diagnosticarSistemaAlertas,
  probarBoton: probarBotonConfiguracion,
  abrirModal: abrirConfiguracionAlertas,
  cerrarModal: cerrarConfiguracionAlertas
};

console.log('🛠️ Funciones de debug disponibles en window.debugAlertas');

// ==============================================
// FUNCIONES ADICIONALES PARA COMPLETAR EL SISTEMA
// ==============================================

// Función para registrar eventos del sistema
function registrarEventoSistema(evento, detalles = '') {
  const timestamp = new Date().toISOString();
  registrarAccionSistema(`${evento}${detalles ? ': ' + detalles : ''}`, 'informativa');
  console.log(`[${timestamp}] ${evento}${detalles ? ': ' + detalles : ''}`);
}

// Función para registrar acciones en el log del sistema
function registrarAccionSistema(accion, tipo = 'informativa') {
  const timestamp = new Date().toLocaleString();
  const logContainer = document.getElementById('log-acciones');
  
  if (logContainer) {
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry ${tipo}`;
    logEntry.innerHTML = `
      <span class="log-timestamp">${timestamp}</span>
      <span class="log-message">${accion}</span>
    `;
    
    // Agregar al inicio del log
    logContainer.insertBefore(logEntry, logContainer.firstChild);
    
    // Mantener solo los últimos 20 logs
    while (logContainer.children.length > 20) {
      logContainer.removeChild(logContainer.lastChild);
    }
  }
  
  console.log(`[SISTEMA] ${accion}`);
}

// Función para mostrar notificaciones del sistema
function mostrarNotificacionSistema(mensaje, tipo = 'info') {
  console.log(`[NOTIFICACIÓN ${tipo.toUpperCASE()}] ${mensaje}`);
  
  // También registrar en el log
  registrarAccionSistema(mensaje, tipo);
  
  // Crear notificación visual (opcional)
  const notificacion = document.createElement('div');
  notificacion.className = `notificacion-sistema ${tipo}`;
  notificacion.textContent = mensaje;
  notificacion.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    border-radius: 6px;
    color: white;
    z-index: 10000;
    font-weight: bold;
    max-width: 300px;
    word-wrap: break-word;
    opacity: 0;
    transition: opacity 0.3s ease;
  `;
  
  // Colores según tipo
  switch(tipo) {
    case 'success':
      notificacion.style.backgroundColor = '#28a745';
      break;
    case 'error':
      notificacion.style.backgroundColor = '#dc3545';
      break;
    case 'warning':
      notificacion.style.backgroundColor = '#ffc107';
      notificacion.style.color = '#212529';
      break;
    default:
      notificacion.style.backgroundColor = '#17a2b8';
  }
  
  document.body.appendChild(notificacion);
  
  // Animar entrada
  setTimeout(() => notificacion.style.opacity = '1', 100);
  
  // Remover después de 4 segundos
  setTimeout(() => {
    notificacion.style.opacity = '0';
    setTimeout(() => {
      if (notificacion.parentNode) {
        notificacion.parentNode.removeChild(notificacion);
      }
    }, 300);
  }, 4000);
}

// ==============================================
// SISTEMA DE NOTIFICACIONES Y ALERTAS - FUNCIONES PRINCIPALES
// ==============================================

// Función para inicializar el sistema de alertas
function inicializarSistemaAlertas() {
  console.log('🔔 Inicializando sistema de alertas...');
  
  // Cargar configuración guardada
  cargarConfiguracionAlertas();
  
  // Verificar alertas inmediatamente
  verificarAlertas();
  
  // Configurar verificación automática
  configurarVerificacionAutomatica();
  
  // Actualizar interfaz
  actualizarPanelNotificaciones();
  actualizarResumenAlertas();
  
  console.log('✅ Sistema de alertas inicializado correctamente');
}

// Función para cargar configuración desde localStorage
function cargarConfiguracionAlertas() {
  const configGuardada = localStorage.getItem('configuracionAlertas');
  if (configGuardada) {
    configuracionAlertas = { ...configuracionAlertas, ...JSON.parse(configGuardada) };
  }
  
  const alertasGuardadas = localStorage.getItem('alertasActivas');
  if (alertasGuardadas) {
    alertasActivas = JSON.parse(alertasGuardadas);
  }
}

// Función para abrir modal de configuración
function abrirConfiguracionAlertas() {
  console.log('🔧 Abriendo modal de configuración de alertas...');

  const modal = document.getElementById('modal-configuracion-alertas');

  if (!modal) {
    console.error('❌ Modal de configuración no encontrado en el DOM');
    mostrarNotificacionSistema('❌ Error: Modal de configuración no encontrado', 'error');
    return;
  }

  console.log('✅ Modal encontrado, configurando valores...');

  // Mostrar modal
  modal.style.display = 'block';

  try {
    // Cargar valores actuales en el modal
    const elementos = {
      'alerta-garantia-vencida': configuracionAlertas.garantiaVencida,
      'alerta-garantia-por-vencer': configuracionAlertas.garantiaPorVencer,
      'dias-garantia-alerta': configuracionAlertas.diasGarantiaAlerta,
      'alerta-equipos-criticos': configuracionAlertas.equiposCriticos,
      'alerta-verificaciones-pendientes': configuracionAlertas.verificacionesPendientes,
      'alerta-mantenimiento-prolongado': configuracionAlertas.mantenimientoProlongado,
      'dias-mantenimiento-alerta': configuracionAlertas.diasMantenimientoAlerta,
      'alerta-soporte-vida': configuracionAlertas.soporteVida,
      'alerta-verificaciones-no-conformes': configuracionAlertas.verificacionesNoConformes,
      'frecuencia-alertas': configuracionAlertas.frecuenciaAlertas
    };

    // Aplicar valores a los elementos del formulario
    
    console.log('✅ Configuración guardada:', configuracionAlertas);
  } catch (error) {
    console.error('❌ Error al guardar configuración:', error);
    mostrarNotificacionSistema('❌ Error al guardar la configuración: ' + error.message, 'error');
  }
}

// Función para cerrar modal de configuración de alertas
function cerrarConfiguracionAlertas() {
  const modal = document.getElementById('modal-configuracion-alertas');
  if (modal) {
    modal.style.display = 'none';
  }
}

// Función para actualizar sección de equipos que requieren atención
function actualizarEquiposAtencion() {
  const contenedor = document.getElementById('equipos-atencion');
  if (!contenedor) return;
  contenedor.innerHTML = '';
  const equipos = JSON.parse(localStorage.getItem('equiposMedicos')) || [];
  // Listar equipos que no están operativos
  equipos.filter(e => e.estado !== 'operativo').forEach(equipo => {
    const div = document.createElement('div');
    div.className = 'equipo-atencion';
    div.textContent = `${equipo.nombre} (${equipo.serie}) - Estado: ${formatEstado(equipo.estado)}`;
    contenedor.appendChild(div);
  });
}

// Funciones stubs para sistema de alertas
function verificarAlertas() {
  // Implementar lógica de verificación de alertas
  alertasActivas = []; // placeholder
}

function configurarVerificacionAutomatica() {
  // Configura intervalos de verificación basados en configuracionAlertas.frecuenciaAlertas
  if (intervalVerificacionAlertas) clearInterval(intervalVerificacionAlertas);
  intervalVerificacionAlertas = setInterval(verificarAlertas, configuracionAlertas.frecuenciaAlertas);
}

function actualizarPanelNotificaciones() {
  const lista = document.getElementById('lista-notificaciones');
  const badge = document.getElementById('badge-total');
  if (!lista || !badge) return;
  lista.innerHTML = '';
  alertasActivas.forEach(alerta => {
    const div = document.createElement('div');
    div.className = `notificacion ${alerta.leida ? 'leida' : 'pendiente'}`;
    div.textContent = alerta.mensaje;
    lista.appendChild(div);
  });
  badge.textContent = alertasActivas.filter(a => !a.leida).length;
}

function actualizarResumenAlertas() {
  // Placeholder: actualizar contadores por tipo en resumen-alertas
  document.getElementById('count-criticas').textContent = alertasActivas.filter(a => a.tipo === 'critica').length;
  document.getElementById('count-advertencias').textContent = alertasActivas.filter(a => a.tipo === 'advertencia').length;
  document.getElementById('count-informativas').textContent = alertasActivas.filter(a => a.tipo === 'informativa').length;
  document.getElementById('count-mantenimiento').textContent = alertasActivas.filter(a => a.tipo === 'mantenimiento').length;
}

// Módulo Verificación Diaria: funciones básicas
function iniciarVerificacion(e) {
  e.preventDefault();
  const serie = document.getElementById('equipo-verificar').value;
  if (!serie) {
    alert('Selecciona un equipo para verificar.');
    return;
  }
  const equipos = JSON.parse(localStorage.getItem('equiposMedicos')) || [];
  const equipo = equipos.find(e => e.serie === serie);
  if (!equipo) {
    alert('Equipo no encontrado.');
    return;
  }
  // Mostrar datos equipo
  document.getElementById('nombre-equipo-verificacion').textContent = equipo.nombre;
  document.getElementById('ubicacion-equipo-verificacion').textContent = equipo.ubicacion;
  document.getElementById('categoria-equipo-verificacion').textContent = formatCategoria(equipo.categoria);
  document.getElementById('serie-equipo-verificacion').textContent = equipo.serie;
  // Generar checklist según categoría
  generarChecklist(equipo.categoria);
  // Mostrar formulario
  document.getElementById('formulario-verificacion').style.display = 'block';
}

function guardarVerificacion() {
  // Recoger datos del formulario
  const resultado = document.getElementById('resultado-general').value;
  const obs = document.getElementById('observaciones-verificacion').value;
  const fecha = new Date().toISOString();
  const serie = document.getElementById('equipo-verificar').value;
  const responsable = document.getElementById('responsable-verificacion').value;
  // Guardar en localStorage (historial)
  const historial = JSON.parse(localStorage.getItem('historialVerificaciones')) || [];
  historial.push({ fecha, serie, responsable, resultado, observaciones: obs });
  localStorage.setItem('historialVerificaciones', JSON.stringify(historial));
  alert('Verificación guardada.');
  cancelarVerificacion();
}

function cancelarVerificacion() {
  // Ocultar formulario de verificación
  document.getElementById('formulario-verificacion').style.display = 'none';
  // Limpiar campos
  document.getElementById('responsable-verificacion').value = '';
  document.getElementById('resultado-general').value = '';
  document.getElementById('observaciones-verificacion').value = '';
  // Reset select
  document.getElementById('equipo-verificar').value = '';
  // Limpiar checklist dinámico
  document.getElementById('checklist-container').innerHTML = '';
}

function aplicarFiltrosHistorial() {
  // Cargar historial completo y mostrar en consola por ahora
  const historial = JSON.parse(localStorage.getItem('historialVerificaciones')) || [];
  console.log('Historial verificaciones:', historial);
  alert(`Total verificaciones: ${historial.length}`);
}

function exportarVerificaciones() {
  const historial = JSON.parse(localStorage.getItem('historialVerificaciones')) || [];
  if (!historial.length) {
    alert('No hay verificaciones para exportar.');
    return;
  }
  // Generar CSV básico
  let csv = 'Fecha,Serie,Responsable,Resultado,Observaciones\n';
  historial.forEach(v => {
    csv += `${v.fecha},${v.serie},${v.responsable},${v.resultado},"${v.observaciones}"\n`;
  });
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'verificaciones.csv';
  link.click();
  URL.revokeObjectURL(url);
}

// Función para limpiar números de serie problemáticos (stub global)
function limpiarNumerosSerieProblematicos() {
  const equipos = JSON.parse(localStorage.getItem("equiposMedicos")) || [];
  let modif = 0;
  equipos.forEach(e => {
    if (e.serie.includes("'") || e.serie.includes('"')) {
      e.serie = e.serie.replace(/['"]/g, '');
      modif++;
    }
  });
  if (modif > 0) {
    localStorage.setItem("equiposMedicos", JSON.stringify(equipos));
    cargarEquipos();
    actualizarDashboard();
    alert(`Se han limpiado ${modif} números de serie problemáticos.`);
  } else {
    alert('No se encontraron números de serie problemáticos.');
  }
}

// Función para aplicar filtros de búsqueda y estado
function aplicarFiltros() {
  const texto = document.getElementById('buscar-texto').value.trim().toLowerCase();
  const estadoVal = document.getElementById('filtro-estado').value;
  const categoriaVal = document.getElementById('filtro-categoria').value;
  const garantiaVal = document.getElementById('filtro-garantia').value;

  // Filtrar sobre el array original
  equiposFiltrados = equiposOriginales.filter(e => {
    let ok = true;
    // Filtro de texto en campos clave
    if (texto) {
      const cadena = `${e.nombre} ${e.marca} ${e.modelo} ${e.serie} ${e.ubicacion}`.toLowerCase();
      ok = cadena.includes(texto);
    }
    // Filtro por estado
    if (ok && estadoVal) ok = e.estado === estadoVal;
    // Filtro por categoría
    if (ok && categoriaVal) ok = e.categoria === categoriaVal;
    // Filtro por garantía
    if (ok && garantiaVal) {
      const estGar = getGarantiaEstado(e.fechaGarantia).class;
      ok = (
        (garantiaVal === 'vigente' && estGar === 'vigente') ||
        (garantiaVal === 'por-vencer' && estGar === 'por-vencer') ||
        (garantiaVal === 'vencida' && estGar === 'vencida') ||
        (garantiaVal === 'sin-garantia' && estGar === 'sin-garantia')
      );
    }
    return ok;
  });

  // Renderizar tabla con resultados filtrados
  tabla.innerHTML = '';
  equiposFiltrados.forEach(agregarFilaTabla);

  // Actualizar contadores y métricas
  actualizarContadores();
}

// Función global para cerrar modal genérico
function cerrarModal() {
  const modal = document.querySelector('.modal');
  if (modal) modal.remove();
}

// Plantillas de checklist por categoría de equipo
const checklistTemplates = {
  'soporte-vida': [
    { name: 'nivel-bateria', text: 'Verificar nivel de batería' },
    { name: 'alarma-funcional', text: 'Comprobar alarma funcional' }
  ],
  'alta-tecnologia': [
    { name: 'conexiones-red', text: 'Verificar conexiones de red' },
    { name: 'software-actualizado', text: 'Confirmar software actualizado' }
  ],
  'critico': [
    { name: 'prueba-funcional', text: 'Realizar prueba funcional completa' },
    { name: 'revisar-cables', text: 'Revisar cables y conectores' }
  ],
  'general': [
    { name: 'limpieza', text: 'Verificar limpieza del equipo' },
    { name: 'fusibles', text: 'Comprobar estado de fusibles' }
  ]
};

// Genera y muestra checklist dinámico en el formulario de verificación
function generarChecklist(categoria) {
  const container = document.getElementById('checklist-container');
  container.innerHTML = '';
  const items = checklistTemplates[categoria] || [{ name: 'check-general', text: 'Revisión general del equipo' }];
  items.forEach(item => {
    const div = document.createElement('div');
    div.className = 'checklist-item';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = item.name;
    checkbox.name = item.name;
    const label = document.createElement('label');
    label.htmlFor = item.name;
    label.textContent = item.text;
    div.appendChild(checkbox);
    div.appendChild(label);
    container.appendChild(div);
  });
}