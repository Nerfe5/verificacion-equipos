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
