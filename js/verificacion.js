/**
 * Sistema de Gestión de Equipamiento Médico
 * Módulo de Verificación Diaria de Equipos
 */

// ===== VARIABLES GLOBALES DEL MÓDULO =====
let verificaciones = []; // Array para almacenar las verificaciones realizadas

// ===== FUNCIONES DE INICIALIZACIÓN =====

/**
 * Inicializa el módulo de verificación
 */
function inicializarModuloVerificacion() {
    console.log('Inicializando módulo de verificación diaria...');
    
    // Cargar verificaciones previas desde localStorage
    cargarVerificacionesGuardadas();
    
    // Cargar equipos operativos en el selector
    cargarEquiposOperativosEnSelector();
    
    // Configurar event listeners
    configurarEventListenersVerificacion();
    
    // Actualizar tabla de verificaciones
    actualizarTablaVerificaciones();
    
    console.log('Módulo de verificación inicializado correctamente');
}

/**
 * Carga las verificaciones previas desde localStorage
 */
function cargarVerificacionesGuardadas() {
    try {
        const verificacionesGuardadas = localStorage.getItem('verificacionesEquipos');
        if (verificacionesGuardadas) {
            verificaciones = JSON.parse(verificacionesGuardadas);
            console.log(`${verificaciones.length} verificaciones cargadas desde localStorage`);
        }
    } catch (error) {
        console.error('Error al cargar verificaciones:', error);
        verificaciones = [];
    }
}

/**
 * Carga los equipos operativos en el selector de verificación
 */
function cargarEquiposOperativosEnSelector() {
    console.log('Cargando equipos operativos en el selector...');
    
    const selectorEquipos = document.getElementById("equipo-verificar");
    
    if (!selectorEquipos) {
        console.error("No se encontró el selector de equipos para verificación");
        return;
    }
    
    // Limpiar opciones actuales (mantener solo la primera opción por defecto)
    while (selectorEquipos.options.length > 1) {
        selectorEquipos.remove(1);
    }
    
    // Si no hay equipos definidos, mostrar mensaje de error
    if (!Array.isArray(equipos) || equipos.length === 0) {
        console.error("No hay equipos definidos en el sistema");
        const option = document.createElement("option");
        option.disabled = true;
        option.textContent = "No hay equipos disponibles";
        selectorEquipos.appendChild(option);
        return;
    }
    
    // Filtrar equipos operativos
    const equiposOperativos = equipos.filter(equipo => equipo && equipo.estado === 'operativo');
    
    console.log(`Se encontraron ${equiposOperativos.length} equipos operativos`);
    
    // Agregar los equipos operativos al selector
    equiposOperativos.forEach(equipo => {
        const option = document.createElement("option");
        option.value = equipo.serie;
        option.textContent = `${equipo.nombre} (${equipo.serie}) - ${equipo.ubicacion || 'Sin ubicación'}`;
        selectorEquipos.appendChild(option);
    });
    
    // Si no hay equipos operativos, mostrar mensaje
    if (equiposOperativos.length === 0) {
        const option = document.createElement("option");
        option.disabled = true;
        option.textContent = "No hay equipos operativos disponibles";
        selectorEquipos.appendChild(option);
        console.log("No hay equipos operativos para mostrar en el selector");
    }
}

/**
 * Configura los event listeners para la sección de verificación
 */
function configurarEventListenersVerificacion() {
    console.log('Configurando event listeners para verificación...');
    
    // Botón de iniciar verificación
    const btnIniciarVerificacion = document.getElementById("iniciar-verificacion");
    if (btnIniciarVerificacion) {
        btnIniciarVerificacion.addEventListener("click", iniciarVerificacion);
        console.log('Listener configurado para botón de iniciar verificación');
    }
    
    // Botón de cancelar verificación
    const btnCancelarVerificacion = document.getElementById("cancelar-verificacion");
    if (btnCancelarVerificacion) {
        btnCancelarVerificacion.addEventListener("click", cancelarVerificacion);
        console.log('Listener configurado para botón de cancelar verificación');
    }
    
    // Formulario de verificación
    const formVerificacion = document.getElementById("form-verificacion");
    if (formVerificacion) {
        formVerificacion.addEventListener("submit", function(e) {
            e.preventDefault();
            guardarVerificacion();
        });
        console.log('Listener configurado para formulario de verificación');
    }
    
    // Filtros de historial
    const btnAplicarFiltros = document.getElementById("aplicar-filtros-historial");
    if (btnAplicarFiltros) {
        btnAplicarFiltros.addEventListener("click", filtrarHistorialVerificaciones);
        console.log('Listener configurado para botón de aplicar filtros');
    }
    
    // Botón de exportar verificaciones
    const btnExportar = document.getElementById("exportar-verificaciones");
    if (btnExportar) {
        btnExportar.addEventListener("click", exportarVerificacionesCSV);
        console.log('Listener configurado para botón de exportar verificaciones');
    }
    
    // Llenar selector de equipos en filtros
    const filtroEquipo = document.getElementById("filtro-equipo-historial");
    if (filtroEquipo) {
        actualizarFiltroEquipos(filtroEquipo);
    }
}

// ===== FUNCIONES DE VERIFICACIÓN DIARIA =====

/**
 * Inicia el proceso de verificación de un equipo
 */
function iniciarVerificacion() {
    console.log('Iniciando proceso de verificación...');
    
    const selectorEquipos = document.getElementById("equipo-verificar");
    const responsableInput = document.getElementById("responsable-verificacion");
    
    // Validar que se haya seleccionado un equipo y un responsable
    if (!selectorEquipos.value) {
        console.error("Debe seleccionar un equipo para verificar");
        mostrarMensaje("Por favor, seleccione un equipo para verificar", "error");
        return;
    }
    
    if (!responsableInput.value.trim()) {
        console.error("Debe ingresar un responsable para la verificación");
        mostrarMensaje("Por favor, ingrese el nombre del responsable de la verificación", "error");
        return;
    }
    
    // Obtener el equipo seleccionado
    const equipoSeleccionadoSerie = selectorEquipos.value;
    const equipoSelec = equipos.find(equipo => equipo && equipo.serie === equipoSeleccionadoSerie);
    
    if (!equipoSelec) {
        console.error(`No se encontró el equipo con serie ${equipoSeleccionadoSerie}`);
        mostrarMensaje("Error al cargar la información del equipo", "error");
        return;
    }
    
    console.log("Equipo seleccionado para verificación:", equipoSelec);
    console.log("Responsable de verificación:", responsableInput.value);
    
    // Mostrar el formulario de verificación
    const formularioVerificacion = document.getElementById("formulario-verificacion");
    if (formularioVerificacion) {
        formularioVerificacion.style.display = "block";
        
        // Llenar información del equipo en el formulario
        document.getElementById("nombre-equipo-verificacion").textContent = equipoSelec.nombre;
        document.getElementById("ubicacion-equipo-verificacion").textContent = `Ubicación: ${equipoSelec.ubicacion || 'No especificada'}`;
        document.getElementById("categoria-equipo-verificacion").textContent = `Categoría: ${formatearCategoria(equipoSelec.categoria)}`;
        document.getElementById("serie-equipo-verificacion").textContent = `Serie: ${equipoSelec.serie}`;
        
        // Cargar checklist según la categoría del equipo
        cargarChecklistVerificacion(equipoSelec.categoria);
        
        // Guardar referencia al equipo seleccionado para uso posterior
        window.equipoSeleccionado = equipoSelec;
        
        mostrarMensaje(`Iniciando verificación del equipo: ${equipoSelec.nombre}`, "info");
    } else {
        console.error("No se encontró el formulario de verificación");
    }
}

/**
 * Formatea el nombre de la categoría para mostrar
 */
function formatearCategoria(categoria) {
    const categorias = {
        'alta-tecnologia': 'Alta Tecnología',
        'soporte-vida': 'Soporte de Vida',
        'critico': 'Crítico',
        'general': 'General'
    };
    
    return categorias[categoria] || categoria;
}

/**
 * Carga el checklist según la categoría del equipo
 */
function cargarChecklistVerificacion(categoria) {
    console.log(`Cargando checklist para categoría: ${categoria}`);
    
    const checklistContainer = document.getElementById("checklist-container");
    if (!checklistContainer) {
        console.error("No se encontró el contenedor del checklist");
        return;
    }
    
    // Limpiar checklist actual
    checklistContainer.innerHTML = '';
    
    // Definir ítems de verificación según la categoría
    let itemsVerificacion = [];
    
    switch(categoria) {
        case 'alta-tecnologia':
            itemsVerificacion = [
                "Sistema eléctrico en buen estado",
                "Pantalla sin daños visibles",
                "Cables y conectores intactos",
                "Software actualizado y operativo",
                "Batería cargada (si aplica)",
                "Calibración vigente",
                "Panel de control funcional",
                "Alarmas operativas"
            ];
            break;
        case 'soporte-vida':
            itemsVerificacion = [
                "Sistema eléctrico en buen estado",
                "Batería de respaldo cargada",
                "Alarmas operativas",
                "Funciones críticas operativas",
                "Mangueras y conectores intactos",
                "Sistema de respaldo funcional",
                "Filtros limpios",
                "Sensores calibrados",
                "Panel de control funcional",
                "Indicadores visuales operativos"
            ];
            break;
        case 'critico':
            itemsVerificacion = [
                "Sistema eléctrico en buen estado",
                "Alarmas operativas",
                "Sensores calibrados",
                "Pantalla legible",
                "Cables y conectores intactos",
                "Sistema de medición preciso",
                "Batería funcional (si aplica)",
                "Filtros limpios (si aplica)"
            ];
            break;
        case 'general':
        default:
            itemsVerificacion = [
                "Estado físico adecuado",
                "Sistema eléctrico funcional",
                "Operatividad general",
                "Limpieza adecuada",
                "Sin daños visibles",
                "Funciones básicas operativas"
            ];
            break;
    }
    
    // Crear elementos del checklist
    itemsVerificacion.forEach((item, index) => {
        const itemId = `item-check-${index}`;
        
        const itemDiv = document.createElement("div");
        itemDiv.className = "checklist-item";
        
        const checkboxLabel = document.createElement("label");
        checkboxLabel.className = "checklist-label";
        checkboxLabel.htmlFor = itemId;
        
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = itemId;
        checkbox.name = `check-item-${index}`;
        checkbox.className = "checklist-checkbox";
        checkbox.required = true;
        
        const itemText = document.createTextNode(` ${item}`);
        
        checkboxLabel.appendChild(checkbox);
        checkboxLabel.appendChild(itemText);
        itemDiv.appendChild(checkboxLabel);
        checklistContainer.appendChild(itemDiv);
    });
    
    console.log(`Checklist generado con ${itemsVerificacion.length} ítems`);
}

/**
 * Cancela el proceso de verificación
 */
function cancelarVerificacion() {
    console.log('Cancelando verificación...');
    
    // Ocultar formulario
    const formularioVerificacion = document.getElementById("formulario-verificacion");
    if (formularioVerificacion) {
        formularioVerificacion.style.display = "none";
    }
    
    // Limpiar campos
    document.getElementById("responsable-verificacion").value = "";
    document.getElementById("equipo-verificar").selectedIndex = 0;
    
    // Limpiar observaciones y resultado si existen
    const observaciones = document.getElementById("observaciones-verificacion");
    if (observaciones) observaciones.value = "";
    
    const resultado = document.getElementById("resultado-general");
    if (resultado) resultado.selectedIndex = 0;
    
    // Eliminar referencia al equipo seleccionado
    window.equipoSeleccionado = null;
    
    mostrarMensaje("Verificación cancelada", "info");
}

/**
 * Guarda la verificación realizada
 */
function guardarVerificacion() {
    console.log('Guardando verificación...');
    
    // Obtener información básica
    const equipoSelec = window.equipoSeleccionado;
    const responsable = document.getElementById("responsable-verificacion").value;
    const observaciones = document.getElementById("observaciones-verificacion").value;
    const resultado = document.getElementById("resultado-general").value;
    
    if (!equipoSelec) {
        console.error("No hay equipo seleccionado");
        mostrarMensaje("Error: No se encontró el equipo seleccionado", "error");
        return;
    }
    
    // Verificar resultado seleccionado
    if (!resultado) {
        mostrarMensaje("Por favor seleccione un resultado general", "warning");
        return;
    }
    
    // Obtener items del checklist
    const checklistItems = document.querySelectorAll(".checklist-checkbox");
    const itemsVerificados = [];
    
    let todosVerificados = true;
    checklistItems.forEach((item, index) => {
        if (!item.checked) {
            todosVerificados = false;
        }
        
        itemsVerificados.push({
            texto: item.parentElement.textContent.trim(),
            verificado: item.checked
        });
    });
    
    if (!todosVerificados) {
        mostrarMensaje("Debe completar todos los ítems del checklist", "warning");
        return;
    }
    
    // Crear registro de verificación
    const verificacion = {
        id: `ver-${Date.now()}`,
        equipoId: equipoSelec.serie,
        nombreEquipo: equipoSelec.nombre,
        ubicacionEquipo: equipoSelec.ubicacion || 'No especificada',
        responsable: responsable,
        fecha: new Date().toISOString(),
        resultado: resultado,
        observaciones: observaciones,
        items: itemsVerificados
    };
    
    console.log('Verificación completada:', verificacion);
    
    // Añadir al array y guardar en localStorage
    verificaciones.unshift(verificacion); // Agregar al inicio para que aparezca primero en el historial
    localStorage.setItem('verificacionesEquipos', JSON.stringify(verificaciones));
    
    // Mostrar mensaje de éxito
    mostrarMensaje(`Verificación del equipo "${equipoSelec.nombre}" guardada correctamente`, "success");
    
    // Actualizar tabla de verificaciones
    actualizarTablaVerificaciones();
    
    // Actualizar filtro de equipos en el historial
    const filtroEquipo = document.getElementById("filtro-equipo-historial");
    if (filtroEquipo) {
        actualizarFiltroEquipos(filtroEquipo);
    }
    
    // Ocultar formulario
    document.getElementById("formulario-verificacion").style.display = "none";
    
    // Resetear campos
    document.getElementById("responsable-verificacion").value = "";
    document.getElementById("equipo-verificar").selectedIndex = 0;
    document.getElementById("observaciones-verificacion").value = "";
    document.getElementById("resultado-general").selectedIndex = 0;
    
    // Eliminar referencia
    window.equipoSeleccionado = null;
}

// ===== FUNCIONES DE HISTORIAL DE VERIFICACIONES =====

/**
 * Actualiza la tabla de verificaciones
 */
function actualizarTablaVerificaciones(verificacionesFiltradas = null) {
    console.log('Actualizando tabla de verificaciones...');
    
    const tablaBody = document.querySelector("#tabla-verificaciones tbody");
    if (!tablaBody) {
        console.error("No se encontró el cuerpo de la tabla de verificaciones");
        return;
    }
    
    // Limpiar tabla
    tablaBody.innerHTML = '';
    
    // Usar verificaciones filtradas si se proporcionan, de lo contrario usar todas
    const verificacionesMostrar = verificacionesFiltradas || verificaciones;
    
    if (verificacionesMostrar.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = '<td colspan="6" class="text-center">No hay verificaciones registradas</td>';
        tablaBody.appendChild(tr);
        return;
    }
    
    // Añadir cada verificación a la tabla
    verificacionesMostrar.forEach(verificacion => {
        const fecha = new Date(verificacion.fecha).toLocaleString();
        
        // Formatear resultado
        const resultadoTexto = {
            'conforme': '✅ Conforme',
            'observaciones': '⚠️ Con observaciones',
            'no-conforme': '❌ No conforme'
        }[verificacion.resultado] || verificacion.resultado;
        
        const resultadoClase = `estado-${verificacion.resultado}`;
        
        // Crear fila
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${fecha}</td>
            <td>${verificacion.nombreEquipo}</td>
            <td>${verificacion.ubicacionEquipo}</td>
            <td>${verificacion.responsable}</td>
            <td class="${resultadoClase}">${resultadoTexto}</td>
            <td>
                <button class="btn-ver-detalle" data-id="${verificacion.id}">👁️ Ver</button>
            </td>
        `;
        
        tablaBody.appendChild(tr);
    });
    
    // Configurar botones de ver detalle
    document.querySelectorAll(".btn-ver-detalle").forEach(btn => {
        btn.addEventListener("click", function() {
            const verificacionId = this.getAttribute("data-id");
            mostrarDetalleVerificacion(verificacionId);
        });
    });
    
    console.log(`Tabla actualizada con ${verificacionesMostrar.length} verificaciones`);
}

/**
 * Actualiza el selector de equipos en el filtro del historial
 */
function actualizarFiltroEquipos(filtroEquipo) {
    // Mantener sólo la primera opción (Todos los equipos)
    while (filtroEquipo.options.length > 1) {
        filtroEquipo.remove(1);
    }
    
    // Obtener equipos únicos de las verificaciones
    const equiposVerificados = new Set();
    verificaciones.forEach(verificacion => {
        equiposVerificados.add(verificacion.equipoId);
    });
    
    // Añadir cada equipo al filtro
    equiposVerificados.forEach(equipoId => {
        const equipoVerificado = equipos.find(e => e && e.serie === equipoId);
        if (equipoVerificado) {
            const option = document.createElement("option");
            option.value = equipoId;
            option.textContent = equipoVerificado.nombre;
            filtroEquipo.appendChild(option);
        }
    });
}

/**
 * Filtra el historial de verificaciones según los criterios seleccionados
 */
function filtrarHistorialVerificaciones() {
    const filtroEquipo = document.getElementById("filtro-equipo-historial").value;
    const filtroResultado = document.getElementById("filtro-resultado-historial").value;
    const filtroFechaDesde = document.getElementById("filtro-fecha-desde").value;
    const filtroFechaHasta = document.getElementById("filtro-fecha-hasta").value;
    
    console.log(`Filtrando verificaciones: Equipo=${filtroEquipo}, Resultado=${filtroResultado}, Desde=${filtroFechaDesde}, Hasta=${filtroFechaHasta}`);
    
    // Convertir fechas a timestamp para comparación
    const fechaDesdeTimestamp = filtroFechaDesde ? new Date(filtroFechaDesde).getTime() : 0;
    const fechaHastaTimestamp = filtroFechaHasta ? new Date(filtroFechaHasta + 'T23:59:59').getTime() : Infinity;
    
    // Filtrar verificaciones
    const verificacionesFiltradas = verificaciones.filter(verificacion => {
        const fechaVerificacion = new Date(verificacion.fecha).getTime();
        
        // Filtro por equipo
        if (filtroEquipo && verificacion.equipoId !== filtroEquipo) {
            return false;
        }
        
        // Filtro por resultado
        if (filtroResultado && verificacion.resultado !== filtroResultado) {
            return false;
        }
        
        // Filtro por fecha
        if (fechaVerificacion < fechaDesdeTimestamp || fechaVerificacion > fechaHastaTimestamp) {
            return false;
        }
        
        return true;
    });
    
    // Actualizar tabla con las verificaciones filtradas
    actualizarTablaVerificaciones(verificacionesFiltradas);
    
    console.log(`Filtrado completado: ${verificacionesFiltradas.length} verificaciones cumplen los criterios`);
}

/**
 * Muestra el detalle de una verificación en un modal
 */
function mostrarDetalleVerificacion(verificacionId) {
    console.log(`Mostrando detalle de verificación: ${verificacionId}`);
    
    // Buscar la verificación
    const verificacion = verificaciones.find(v => v.id === verificacionId);
    
    if (!verificacion) {
        console.error(`Verificación con ID ${verificacionId} no encontrada`);
        mostrarMensaje("Error: No se pudo encontrar la verificación seleccionada", "error");
        return;
    }
    
    // Verificar si ya existe el modal
    let modal = document.querySelector('.verificacion-detalle-modal');
    
    // Si no existe, crearlo
    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'verificacion-detalle-modal';
        
        const modalContent = document.createElement('div');
        modalContent.className = 'verificacion-detalle-content';
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
    }
    
    const modalContent = modal.querySelector('.verificacion-detalle-content');
    
    // Formatear fecha
    const fecha = new Date(verificacion.fecha).toLocaleString();
    
    // Formatear resultado
    const resultadoTexto = {
        'conforme': '✅ Conforme',
        'observaciones': '⚠️ Con observaciones',
        'no-conforme': '❌ No conforme'
    }[verificacion.resultado] || verificacion.resultado;
    
    // Contenido del modal
    modalContent.innerHTML = `
        <div class="verificacion-detalle-header">
            <h3>Detalle de Verificación</h3>
            <button class="verificacion-detalle-close">&times;</button>
        </div>
        <div class="verificacion-detalle-info">
            <p><span>Equipo:</span> <span>${verificacion.nombreEquipo}</span></p>
            <p><span>Serie:</span> <span>${verificacion.equipoId}</span></p>
            <p><span>Ubicación:</span> <span>${verificacion.ubicacionEquipo}</span></p>
            <p><span>Responsable:</span> <span>${verificacion.responsable}</span></p>
            <p><span>Fecha:</span> <span>${fecha}</span></p>
            <p><span>Resultado:</span> <span class="estado-${verificacion.resultado}">${resultadoTexto}</span></p>
            ${verificacion.observaciones ? `<p><span>Observaciones:</span> <span>${verificacion.observaciones}</span></p>` : ''}
        </div>
        <h4>Checklist de Verificación</h4>
        <div class="verificacion-detalle-items">
            ${verificacion.items.map(item => `
                <div class="verificacion-detalle-item">
                    <span class="${item.verificado ? 'verificacion-detalle-item-check' : 'verificacion-detalle-item-uncheck'}">
                        ${item.verificado ? '✓' : '✗'}
                    </span>
                    <span>${item.texto}</span>
                </div>
            `).join('')}
        </div>
    `;
    
    // Mostrar modal
    modal.classList.add('active');
    
    // Configurar botón de cerrar
    const btnCerrar = modal.querySelector('.verificacion-detalle-close');
    btnCerrar.addEventListener('click', function() {
        modal.classList.remove('active');
    });
    
    // Cerrar al hacer clic fuera del contenido
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
}

/**
 * Exporta las verificaciones a un archivo CSV
 */
function exportarVerificacionesCSV() {
    console.log('Exportando verificaciones a CSV...');
    
    // Obtener verificaciones a exportar (aplicar filtros si están activos)
    const filtroEquipo = document.getElementById("filtro-equipo-historial").value;
    const filtroResultado = document.getElementById("filtro-resultado-historial").value;
    const filtroFechaDesde = document.getElementById("filtro-fecha-desde").value;
    const filtroFechaHasta = document.getElementById("filtro-fecha-hasta").value;
    
    let verificacionesExportar = verificaciones;
    
    // Si hay filtros aplicados, filtrar las verificaciones
    if (filtroEquipo || filtroResultado || filtroFechaDesde || filtroFechaHasta) {
        const fechaDesdeTimestamp = filtroFechaDesde ? new Date(filtroFechaDesde).getTime() : 0;
        const fechaHastaTimestamp = filtroFechaHasta ? new Date(filtroFechaHasta + 'T23:59:59').getTime() : Infinity;
        
        verificacionesExportar = verificaciones.filter(verificacion => {
            const fechaVerificacion = new Date(verificacion.fecha).getTime();
            
            // Filtro por equipo
            if (filtroEquipo && verificacion.equipoId !== filtroEquipo) {
                return false;
            }
            
            // Filtro por resultado
            if (filtroResultado && verificacion.resultado !== filtroResultado) {
                return false;
            }
            
            // Filtro por fecha
            if (fechaVerificacion < fechaDesdeTimestamp || fechaVerificacion > fechaHastaTimestamp) {
                return false;
            }
            
            return true;
        });
    }
    
    // Si no hay verificaciones, mostrar mensaje
    if (verificacionesExportar.length === 0) {
        mostrarMensaje("No hay verificaciones para exportar", "warning");
        return;
    }
    
    // Formatear resultados para el CSV
    const resultadosTexto = {
        'conforme': 'Conforme',
        'observaciones': 'Con observaciones',
        'no-conforme': 'No conforme'
    };
    
    // Encabezados del CSV
    let csv = 'Fecha,Equipo,Serie,Ubicación,Responsable,Resultado,Observaciones\n';
    
    // Añadir cada verificación
    verificacionesExportar.forEach(v => {
        const fecha = new Date(v.fecha).toLocaleString();
        const resultado = resultadosTexto[v.resultado] || v.resultado;
        
        // Escapar campos de texto para CSV
        const observaciones = v.observaciones ? `"${v.observaciones.replace(/"/g, '""')}"` : '';
        const nombreEquipo = `"${v.nombreEquipo.replace(/"/g, '""')}"`;
        const ubicacion = `"${v.ubicacionEquipo.replace(/"/g, '""')}"`;
        const responsable = `"${v.responsable.replace(/"/g, '""')}"`;
        
        csv += `${fecha},${nombreEquipo},${v.equipoId},${ubicacion},${responsable},${resultado},${observaciones}\n`;
    });
    
    // Crear blob y descargar
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `verificaciones_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    mostrarMensaje(`Se exportaron ${verificacionesExportar.length} verificaciones a CSV`, "success");
}

// ===== UTILIDADES =====

/**
 * Muestra un mensaje al usuario
 * Reutiliza la función mostrarMensaje del script principal si existe
 */
function mostrarMensaje(mensaje, tipo = 'info') {
    // Si existe la función global mostrarMensaje, usarla
    if (typeof window.mostrarMensaje === 'function') {
        window.mostrarMensaje(mensaje, tipo);
        return;
    }
    
    // Si no existe, crear nuestra propia implementación básica
    console.log(`[${tipo.toUpperCase()}] ${mensaje}`);
    alert(`${mensaje}`);
}

// ===== INICIALIZACIÓN DEL MÓDULO =====

// Inicializar el módulo cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
    // Verificar si los equipos ya están cargados
    if (typeof equipos !== 'undefined' && Array.isArray(equipos)) {
        inicializarModuloVerificacion();
    } else {
        // Si los equipos no están cargados, esperar a que lo estén
        console.log('Esperando a que se carguen los equipos...');
        
        // Verificar cada 500ms si los equipos ya están cargados
        const interval = setInterval(function() {
            if (typeof equipos !== 'undefined' && Array.isArray(equipos)) {
                clearInterval(interval);
                console.log('Equipos detectados, inicializando módulo de verificación...');
                inicializarModuloVerificacion();
            }
        }, 500);
        
        // Timeout de seguridad después de 10 segundos
        setTimeout(function() {
            clearInterval(interval);
            console.error('Timeout al esperar los equipos. Inicializando módulo de verificación sin equipos...');
            inicializarModuloVerificacion();
        }, 10000);
    }
});