/**
 * Sistema de Gestión de Equipamiento Médico
 * Módulo de Verificación Diaria de Equipos
 * 
 * ÍNDICE DE SECCIONES:
 * 1. CONFIGURACIÓN Y VARIABLES GLOBALES
 * 2. SISTEMA DE INICIALIZACIÓN
 * 3. GESTIÓN DE INTERFAZ DE USUARIO (UI)
 * 4. SISTEMA DE NOTIFICACIONES
 * 5. FUNCIONALIDADES DE VERIFICACIÓN
 * 6. GESTIÓN DEL HISTORIAL
 * 7. EXPORTACIÓN Y REPORTES PDF
 * 8. UTILIDADES Y HELPERS
 */

// ================================================================
// 1. CONFIGURACIÓN Y VARIABLES GLOBALES
// ================================================================

let verificaciones = []; // Array para almacenar las verificaciones realizadas


// ================================================================
// 2. SISTEMA DE INICIALIZACIÓN
// ================================================================

/**
 * Inicializa el módulo de verificación
 */
function inicializarModuloVerificacion() {
    console.log('Inicializando módulo de verificación diaria...');
    
       // Diagnóstico: Verificar elementos clave
    console.log('Diagnóstico de elementos DOM:');
    const elementosClave = [
        { id: "equipo-verificar", desc: "Selector de equipos" },
        { id: "responsable-verificacion", desc: "Campo de responsable" },
        { id: "formulario-verificacion", desc: "Formulario de verificación" },
        { id: "checklist-container", desc: "Contenedor del checklist" },
        { id: "tabla-verificaciones", desc: "Tabla de verificaciones" }
    ];
    
    elementosClave.forEach(elem => {
        const domElem = document.getElementById(elem.id);
        console.log(`${elem.desc} (${elem.id}): ${domElem ? 'Encontrado ✓' : 'NO ENCONTRADO ✗'}`);
    });
    
    // Verificar que equipos esté definido
    if (!Array.isArray(equipos) || equipos.length === 0) {
        console.error('Error: La variable "equipos" no contiene datos válidos');
        mostrarMensaje('Error al cargar datos de equipos', 'error');
    } else {
        console.log(`Array de equipos disponible con ${equipos.length} elementos`);
    }
    
    // Cargar verificaciones previas desde localStorage
    cargarVerificacionesGuardadas();
    
    // Cargar equipos operativos en el selector
    cargarEquiposOperativosEnSelector();

     // Actualizar el selector de filtro de equipos
    const filtroEquipo = document.getElementById("filtro-equipo-historial");
    if (filtroEquipo) {
        actualizarFiltroEquipos(filtroEquipo);
    }
    
    // Configurar event listeners
    configurarEventListenersVerificacion();
    
    // Inicializar la tabla de verificaciones
    inicializarTablaVerificaciones();

setTimeout(() => {
    const filtroEquipo = document.getElementById("filtro-equipo-historial");
    if (filtroEquipo) {
        console.log("Actualizando filtro de equipos después de inicialización...");
        actualizarFiltroEquipos(filtroEquipo);
    } else {
        console.error("No se encontró el elemento filtro-equipo-historial");
    }
}, 500);
    
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
    
    // Botón para iniciar verificación
    const btnIniciarVerificacion = document.getElementById("iniciar-verificacion");
    if (btnIniciarVerificacion) {
        btnIniciarVerificacion.addEventListener("click", iniciarVerificacion);
        console.log('Listener configurado para botón de iniciar verificación');
    }
    
    // Botón para cancelar verificación
    const btnCancelarVerificacion = document.getElementById("cancelar-verificacion");
    if (btnCancelarVerificacion) {
        btnCancelarVerificacion.addEventListener("click", cancelarVerificacion);
        console.log('Listener configurado para botón de cancelar verificación');
    }
    
    // Formulario de verificación para guardar
    const formVerificacion = document.getElementById("form-verificacion");
    if (formVerificacion) {
        formVerificacion.addEventListener("submit", function(e) {
            e.preventDefault();
            guardarVerificacion();
        });
        console.log('Listener configurado para formulario de verificación');
    }
    
    // Botón para aplicar filtros de historial
    const btnAplicarFiltros = document.getElementById("aplicar-filtros-historial");
    if (btnAplicarFiltros) {
        btnAplicarFiltros.addEventListener("click", filtrarHistorialVerificaciones);
        console.log('Listener configurado para botón de aplicar filtros');
    }
    
    // Botón para exportar verificaciones
    const btnExportarVerificaciones = document.getElementById("exportar-verificaciones");
    if (btnExportarVerificaciones) {
        btnExportarVerificaciones.addEventListener("click", exportarVerificacionesCSV);
        console.log('Listener configurado para botón de exportar verificaciones');
    }
    
    // Botón para limpiar filtros
    const btnLimpiarFiltros = document.getElementById("limpiar-filtros-historial");
    if (btnLimpiarFiltros) {
        btnLimpiarFiltros.addEventListener("click", limpiarFiltrosHistorial);
        console.log('Listener configurado para botón de limpiar filtros');
    }
    
    // Botón para generar PDF
    const btnGenerarPDF = document.getElementById("btn-generar-pdf-equipo");
    if (btnGenerarPDF) {
        btnGenerarPDF.addEventListener("click", generarPDFEquipo);
        console.log('Listener configurado para botón de generar PDF');
    }
}


// ================================================================
// 3. GESTIÓN DE INTERFAZ DE USUARIO (UI)
// ================================================================

/**
 * Carga el checklist de verificación según la categoría del equipo
 * @param {string} categoria - Categoría del equipo
 */
function cargarChecklistVerificacion(categoria) {
    console.log(`Cargando checklist para categoría: ${categoria}`);
    
    const checklistContainer = document.getElementById("checklist-container");
    if (!checklistContainer) {
        console.error("Contenedor del checklist no encontrado");
        return;
    }
    
    // Limpiar contenedor
    checklistContainer.innerHTML = '';
    
    // Definir ítems del checklist según la categoría
    let items = [];
    
    switch(categoria) {
        case 'alta-tecnologia':
            items = [
                "El equipo enciende correctamente",
                "La pantalla/display funciona sin errores",
                "Los controles responden adecuadamente",
                "Las conexiones están en buen estado",
                "No presenta mensajes de error al iniciar",
                "Calibración dentro de parámetros",
                "Software actualizado a la versión correcta",
                "Los accesorios están completos y funcionales",
                "El equipo se comunica correctamente con sistemas externos",
                "La batería de respaldo funciona correctamente",
                "Los filtros están limpios y en buen estado",
                "Sistema de refrigeración funcionando correctamente"
            ];
            break;
        case 'soporte-vida':
            items = [
                "El equipo enciende correctamente",
                "Las alarmas funcionan y son audibles",
                "La batería principal está cargada",
                "La batería de respaldo funciona correctamente",
                "Los sensores funcionan adecuadamente",
                "Las válvulas y conectores están en buen estado",
                "No hay fugas en el sistema",
                "El sistema de respaldo se activa correctamente",
                "El equipo responde adecuadamente en prueba de carga",
                "Los filtros están limpios y en buen estado"
            ];
            break;
        case 'critico':
            items = [
                "El equipo enciende correctamente",
                "Los parámetros vitales se muestran correctamente",
                "Las alarmas se activan en condiciones críticas",
                "El sistema de respaldo funciona correctamente",
                "Los controles responden sin demora",
                "Las conexiones están seguras",
                "No presenta mensajes de error",
                "Los accesorios están completos y funcionales"
            ];
            break;
        case 'general':
            items = [
                "El equipo enciende correctamente",
                "No presenta daños físicos visibles",
                "Los controles funcionan adecuadamente",
                "Las conexiones están en buen estado",
                "El equipo está limpio y desinfectado",
                "La calibración está dentro de parámetros"
            ];
            break;
        default:
            items = [
                "El equipo enciende correctamente",
                "Los controles funcionan adecuadamente",
                "No presenta daños físicos",
                "Las conexiones están en buen estado"
            ];
    }
    
    // Crear elementos del checklist
    items.forEach((item, index) => {
        const checklistItem = document.createElement('div');
        checklistItem.className = 'checklist-item';
        
        const id = `check-${index}`;
        
        checklistItem.innerHTML = `
            <label class="checklist-label" for="${id}">
                <input type="checkbox" id="${id}" class="checklist-checkbox" checked>
                ${item}
            </label>
        `;
        
        checklistContainer.appendChild(checklistItem);
    });
    
    console.log(`Checklist generado con ${items.length} ítems`);
}

/**
 * Inicializar la tabla de verificaciones
 */
function inicializarTablaVerificaciones() {
    const tablaHead = document.querySelector("#tabla-verificaciones thead");
    if (!tablaHead) {
        console.error("No se encontró el encabezado de la tabla de verificaciones");
        return;
    }
    
    // Crear encabezados de la tabla
    tablaHead.innerHTML = `
        <tr>
            <th>Fecha</th>
            <th>Equipo</th>
            <th>Ubicación</th>
            <th>Responsable</th>
            <th>Resultado</th>
            <th>Acciones</th>
        </tr>
    `;
    
    // Actualizar la tabla con las verificaciones
    actualizarTablaVerificaciones();
}

/**
 * Actualiza la tabla de verificaciones
 */
/**
 * Actualiza la tabla de verificaciones
 */
function actualizarTablaVerificaciones(verificacionesFiltradas = null) {
    console.log('Actualizando tabla de verificaciones...');
    
    const datosVerificaciones = verificacionesFiltradas || verificaciones;
    console.log(`Total de verificaciones a mostrar: ${datosVerificaciones.length}`);
    
    const tablaVerificaciones = document.getElementById('tabla-verificaciones');
    if (!tablaVerificaciones) {
        console.error('Error: No se encontró la tabla de verificaciones');
        return;
    }
    
    const tbody = tablaVerificaciones.querySelector('tbody');
    if (!tbody) {
        console.error('Error: No se encontró el cuerpo de la tabla');
        return;
    }
    
    // Limpiar tabla actual
    limpiarElemento(tbody);
    
    if (datosVerificaciones.length === 0) {
        // Si no hay verificaciones, mostrar mensaje
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 6; // Ajustar según el número de columnas
        td.textContent = 'No hay verificaciones registradas';
        td.style.textAlign = 'center';
        td.style.padding = '20px';
        tr.appendChild(td);
        tbody.appendChild(tr);
        return;
    }
    
    // Ordenar por fecha (más reciente primero)
    const verificacionesOrdenadas = [...datosVerificaciones].sort((a, b) => 
        new Date(b.fecha) - new Date(a.fecha)
    );
    
    // Añadir filas a la tabla
    verificacionesOrdenadas.forEach(verif => {
        const tr = document.createElement('tr');
        
        // Fecha
        const tdFecha = document.createElement('td');
        tdFecha.textContent = formatearFecha(verif.fecha);
        tr.appendChild(tdFecha);
        
        // Equipo
        const tdEquipo = document.createElement('td');
        tdEquipo.textContent = verif.nombreEquipo || 'Sin nombre';
        tr.appendChild(tdEquipo);
        
        // Ubicación
        const tdUbicacion = document.createElement('td');
        tdUbicacion.textContent = verif.ubicacionEquipo || 'No especificada';
        tr.appendChild(tdUbicacion);
        
        // Responsable
        const tdResponsable = document.createElement('td');
        tdResponsable.textContent = verif.responsable || 'No especificado';
        tr.appendChild(tdResponsable);
        
        // Resultado
        const tdResultado = document.createElement('td');
        const resultadoTexto = formatearResultadoVerificacion(verif.resultado);
        tdResultado.textContent = resultadoTexto;
        
        // Aplicar clase según resultado
        if (verif.resultado === 'conforme') {
            tdResultado.classList.add('estado-conforme');
        } else if (verif.resultado === 'observaciones') {
            tdResultado.classList.add('estado-observaciones');
        } else if (verif.resultado === 'no-conforme') {
            tdResultado.classList.add('estado-no-conforme');
        }
        
        tr.appendChild(tdResultado);
        
        // Acciones
        const tdAcciones = document.createElement('td');
        tdAcciones.className = 'acciones-container';
        
   // Botón Ver Detalle
const btnVerDetalle = document.createElement('button');
btnVerDetalle.className = 'btn-acciones btn-ver-detalle';
btnVerDetalle.innerHTML = '👁️';  // Ícono de ojo
btnVerDetalle.title = 'Ver detalle';
btnVerDetalle.addEventListener('click', () => mostrarDetalleVerificacion(verif.id));
tdAcciones.appendChild(btnVerDetalle);

// Botón PDF
const btnPDF = document.createElement('button');
btnPDF.className = 'btn-acciones btn-pdf-verificacion';
btnPDF.innerHTML = '📋';  // Ícono de documento
btnPDF.title = 'Generar PDF';
btnPDF.addEventListener('click', () => generarPDFEquipoDesdeHistorial(verif.equipoId));
tdAcciones.appendChild(btnPDF);

// Botón Duplicar
const btnDuplicar = document.createElement('button');
btnDuplicar.className = 'btn-acciones btn-duplicar-verificacion';
btnDuplicar.innerHTML = '📚';  // Ícono de reciclar/repetir
btnDuplicar.title = 'Duplicar verificación';
btnDuplicar.addEventListener('click', () => duplicarVerificacion(verif.id));
tdAcciones.appendChild(btnDuplicar);

// Botón Eliminar
const btnEliminar = document.createElement('button');
btnEliminar.className = 'btn-acciones btn-eliminar-verificacion';
btnEliminar.innerHTML = '🗑️';  // Ícono de papelera
btnEliminar.title = 'Eliminar verificación';
btnEliminar.addEventListener('click', () => eliminarVerificacion(verif.id));
tdAcciones.appendChild(btnEliminar);
        
        tr.appendChild(tdAcciones);
        tbody.appendChild(tr);
    });
    
    console.log(`Tabla actualizada con ${verificacionesOrdenadas.length} verificaciones`);
}

/**
 * Muestra el detalle completo de una verificación
 * @param {string} verificacionId - ID de la verificación a mostrar
 */
function mostrarDetalleVerificacion(verificacionId) {
    console.log(`Mostrando detalle de verificación: ${verificacionId}`);
    
    // Buscar la verificación
    const verificacion = verificaciones.find(v => v.id === verificacionId);
    
    if (!verificacion) {
        mostrarMensaje("No se encontró la verificación solicitada", "error");
        return;
    }
    
    // Crear modal para mostrar detalles
    const modal = document.createElement('div');
    modal.className = 'detalle-verificacion-modal';
    
    // Formatear fecha
    const fecha = new Date(verificacion.fecha).toLocaleString();
    
    // Formatear resultado
    const resultadoTexto = {
        'conforme': '✅ Conforme',
        'observaciones': '⚠️ Con observaciones',
        'no-conforme': '❌ No conforme'
    }[verificacion.resultado] || verificacion.resultado;
    
    const resultadoClase = `estado-${verificacion.resultado}`;
    
    // Crear HTML para items verificados
    let itemsHTML = '';
    if (verificacion.items && verificacion.items.length > 0) {
        itemsHTML = '<div class="verificacion-items"><h4>Elementos verificados:</h4><ul>';
        verificacion.items.forEach(item => {
            const iconoItem = item.verificado ? '✅' : '❌';
            itemsHTML += `<li>${iconoItem} ${item.texto}</li>`;
        });
        itemsHTML += '</ul></div>';
    }
    
    // Construir el contenido del modal
    modal.innerHTML = `
        <div class="detalle-verificacion-content">
            <div class="detalle-verificacion-header">
                <h3>Detalle de Verificación</h3>
                <button class="btn-cerrar-detalle">✖</button>
            </div>
            <div class="detalle-verificacion-body">
                <div class="detalle-verificacion-info">
                    <div class="detalle-verificacion-equipo">
                        <h4>${verificacion.nombreEquipo}</h4>
                        <p><strong>ID/Serie:</strong> ${verificacion.equipoId}</p>
                        <p><strong>Ubicación:</strong> ${verificacion.ubicacionEquipo}</p>
                    </div>
                    <div class="detalle-verificacion-datos">
                        <p><strong>Fecha:</strong> ${fecha}</p>
                        <p><strong>Responsable:</strong> ${verificacion.responsable}</p>
                        <p><strong>Resultado:</strong> <span class="${resultadoClase}">${resultadoTexto}</span></p>
                    </div>
                </div>
                
                ${itemsHTML}
                
                <div class="detalle-verificacion-observaciones">
                    <h4>Observaciones:</h4>
                    <p>${verificacion.observaciones || "Sin observaciones"}</p>
                </div>
                
                <div class="detalle-verificacion-acciones">
                    <button class="btn-pdf-verificacion-detalle" data-equipo="${verificacion.equipoId}">📄 Generar PDF</button>
                    <button class="btn-duplicar-verificacion-detalle" data-id="${verificacion.id}">🔄 Duplicar verificación</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Mostrar el modal con animación
    setTimeout(() => {
        modal.classList.add('active');
    }, 50);
    
    // Configurar botón de cerrar
    const btnCerrar = modal.querySelector('.btn-cerrar-detalle');
    btnCerrar.addEventListener('click', () => {
        modal.classList.remove('active');
        setTimeout(() => {
            document.body.removeChild(modal);
        }, 300);
    });
    
    // Configurar botón de generar PDF
    const btnPDF = modal.querySelector('.btn-pdf-verificacion-detalle');
    btnPDF.addEventListener('click', () => {
        generarPDFEquipoDesdeHistorial(verificacion.equipoId);
    });
    
    // Configurar botón de duplicar verificación
    const btnDuplicar = modal.querySelector('.btn-duplicar-verificacion-detalle');
    btnDuplicar.addEventListener('click', () => {
        duplicarVerificacion(verificacion.id);
        // Cerrar modal después de duplicar
        modal.classList.remove('active');
        setTimeout(() => {
            document.body.removeChild(modal);
        }, 300);
    });
    
    // Cerrar al hacer clic fuera del contenido
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
            setTimeout(() => {
                document.body.removeChild(modal);
            }, 300);
        }
    });
}

/**
 * Muestra el PDF en un modal para previsualizarlo antes de descargar
 */
function mostrarPDFEnModal(doc, titulo) {
    // Generar el PDF como base64
    const pdfData = doc.output('datauristring');
    
    // Crear modal para mostrar el PDF
    const modal = document.createElement('div');
    modal.className = 'pdf-preview-modal';
    modal.innerHTML = `
        <div class="pdf-preview-content">
            <div class="pdf-preview-header">
                <h3>${titulo}</h3>
                <div class="pdf-preview-actions">
                    <button class="btn-descargar-pdf">💾 Descargar</button>
                    <button class="btn-cerrar-pdf">✖</button>
                </div>
            </div>
            <div class="pdf-preview-body">
                <iframe src="${pdfData}" width="100%" height="100%"></iframe>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Mostrar el modal con animación
    setTimeout(() => {
        modal.classList.add('active');
    }, 50);
    
    // Configurar botón de descarga
    const btnDescargar = modal.querySelector('.btn-descargar-pdf');
    btnDescargar.addEventListener('click', () => {
        // Nombre del archivo basado en el equipo
        const equipo = titulo.replace('Información del equipo ', '');
        const filename = `equipo_${equipo.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.pdf`;
        doc.save(filename);
    });
    
    // Configurar botón de cerrar
    const btnCerrar = modal.querySelector('.btn-cerrar-pdf');
    btnCerrar.addEventListener('click', () => {
        modal.classList.remove('active');
        setTimeout(() => {
            document.body.removeChild(modal);
        }, 300);
    });
    
    // Cerrar al hacer clic fuera del contenido
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
            setTimeout(() => {
                document.body.removeChild(modal);
            }, 300);
        }
    });
}

/**
 * Actualiza el selector de equipos en el filtro del historial
 */
function actualizarFiltroEquipos(filtroEquipo) {
    console.log('Actualizando filtro de equipos...');
    
    // Verificar que el elemento existe
    if (!filtroEquipo) {
        console.error("Error: El elemento filtroEquipo no existe");
        return;
    }
    
    // Mantener sólo la primera opción (Todos los equipos)
    while (filtroEquipo.options.length > 1) {
        filtroEquipo.remove(1);
    }
    
    // Obtener equipos únicos de las verificaciones
    const equiposVerificados = new Set();
    verificaciones.forEach(verificacion => {
        if (verificacion.equipoId) {
            equiposVerificados.add(verificacion.equipoId);
        }
    });
    
    console.log(`Equipos únicos encontrados para filtro: ${equiposVerificados.size}`);
    if (equiposVerificados.size > 0) {
        console.log(`IDs de equipos encontrados: ${Array.from(equiposVerificados).join(', ')}`);
    } else {
        console.warn("No se encontraron equipos en las verificaciones");
    }
    
    // Añadir directamente los equipos desde las verificaciones
    // (sin depender de la variable equipos global)
    const equiposAgregados = new Set();
    
    verificaciones.forEach(verificacion => {
        if (verificacion.equipoId && verificacion.nombreEquipo && !equiposAgregados.has(verificacion.equipoId)) {
            const option = document.createElement("option");
            option.value = verificacion.equipoId;
            option.textContent = `${verificacion.nombreEquipo} (${verificacion.equipoId})`;
            filtroEquipo.appendChild(option);
            equiposAgregados.add(verificacion.equipoId);
            console.log(`Añadido equipo al filtro directamente: ${verificacion.nombreEquipo}`);
        }
    });
    
    console.log(`Filtro de equipos actualizado con ${equiposAgregados.size} equipos`);
}


// ================================================================
// 4. SISTEMA DE NOTIFICACIONES
// ================================================================

/**
 * Muestra un mensaje en la interfaz utilizando un sistema de toast
 * @param {string} mensaje - El mensaje a mostrar
 * @param {string} tipo - Tipo de mensaje ('success', 'error', 'info', 'warning')
 */
function mostrarMensaje(mensaje, tipo) {
    console.log(`[${tipo.toUpperCase()}] ${mensaje}`);
    
    // Crear el elemento toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo}`;
    
    // Iconos para los diferentes tipos de mensajes
    const iconos = {
        'success': '✅',
        'error': '❌',
        'warning': '⚠️',
        'info': 'ℹ️'
    };
    
    // Crear el contenido del toast
    toast.innerHTML = `
        <div class="toast-content">
            <div class="toast-icon">${iconos[tipo] || 'ℹ️'}</div>
            <div class="toast-message">${mensaje}</div>
        </div>
        <button class="toast-close">×</button>
    `;
    
    // Añadir al contenedor de toasts (crear si no existe)
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        document.body.appendChild(toastContainer);
    }
    
    // Añadir el toast al contenedor
    toastContainer.appendChild(toast);
    
    // Animación de entrada
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Configurar el cierre automático
    const tiempoVisible = tipo === 'error' ? 6000 : 4000;
    const timeoutId = setTimeout(() => {
        cerrarToast(toast);
    }, tiempoVisible);
    
    // Configurar el botón de cerrar
    const btnCerrar = toast.querySelector('.toast-close');
    if (btnCerrar) {
        btnCerrar.addEventListener('click', () => {
            clearTimeout(timeoutId);
            cerrarToast(toast);
        });
    }
}

/**
 * Cierra un toast con animación
 * @param {HTMLElement} toast - Elemento toast a cerrar
 */
function cerrarToast(toast) {
    toast.classList.add('hiding');
    
    // Eliminar después de la animación de salida
    setTimeout(() => {
        if (toast && toast.parentNode) {
            toast.parentNode.removeChild(toast);
            
            // Si no hay más toasts, eliminar el contenedor
            const toastContainer = document.getElementById('toast-container');
            if (toastContainer && toastContainer.children.length === 0) {
                toastContainer.parentNode.removeChild(toastContainer);
            }
        }
    }, 500); // tiempo de la animación de salida
}


// ================================================================
// 5. FUNCIONALIDADES DE VERIFICACIÓN
// ================================================================

/**
 * Inicia el proceso de verificación de un equipo
 */
function iniciarVerificacion() {
    console.log('Iniciando proceso de verificación...');
    
    const selectorEquipo = document.getElementById("equipo-verificar");
    const responsableInput = document.getElementById("responsable-verificacion");
    
    if (!selectorEquipo || !selectorEquipo.value) {
        mostrarMensaje("Por favor, seleccione un equipo para verificar", "error");
        return;
    }
    
    if (!responsableInput || !responsableInput.value.trim()) {
        mostrarMensaje("Por favor, ingrese el nombre del responsable", "error");
        return;
    }
    
    const equipoId = selectorEquipo.value;
    const responsable = responsableInput.value.trim();
    
    // Buscar el equipo seleccionado
    const equipo = equipos.find(eq => eq.id === equipoId || eq.serie === equipoId);
    
    if (!equipo) {
        mostrarMensaje("Equipo no encontrado", "error");
        return;
    }
    
    console.log('Equipo seleccionado para verificación:', equipo);
    console.log('Responsable de verificación:', responsable);
    
    // IMPORTANTE: Guardar referencia al equipo seleccionado
    window.equipoSeleccionado = equipo;
    
    // Mostrar el formulario de verificación
    const formularioVerificacion = document.getElementById("formulario-verificacion");
    if (formularioVerificacion) {
        formularioVerificacion.style.display = "block";
        
        // Actualizar la información del equipo seleccionado
        const tituloEquipo = document.getElementById("titulo-equipo-verificacion");
        if (tituloEquipo) {
            tituloEquipo.textContent = `${equipo.nombre} - ${equipo.marca} ${equipo.modelo}`;
        }
        
        // Mostrar datos adicionales del equipo
        const datosEquipo = document.getElementById("datos-equipo-verificacion");
        if (datosEquipo) {
            datosEquipo.innerHTML = `
                <p><strong>ID:</strong> ${equipo.id || equipo.serie}</p>
                <p><strong>Serie:</strong> ${equipo.serie || 'N/A'}</p>
                <p><strong>Categoría:</strong> ${formatearCategoria(equipo.categoria)}</p>
                <p><strong>Ubicación:</strong> ${equipo.ubicacion || 'No especificada'}</p>
            `;
        }
        
        // Cargar el checklist según la categoría del equipo
        cargarChecklistVerificacion(equipo.categoria);
        
        // Ocultar selector de equipos mientras se realiza la verificación
        document.querySelector('.selector-equipo').style.display = 'none';
    } else {
        console.error("No se encontró el formulario de verificación");
    }
}

/**
 * Cancela el proceso de verificación y oculta el formulario
 */
function cancelarVerificacion() {
    console.log('Cancelando proceso de verificación...');
    
    // Ocultar formulario de verificación
    const formularioVerificacion = document.getElementById("formulario-verificacion");
    if (formularioVerificacion) {
        formularioVerificacion.style.display = "none";
    }
    
    // Mostrar selector de equipos
    const selectorEquipo = document.querySelector('.selector-equipo');
    if (selectorEquipo) {
        selectorEquipo.style.display = 'block';
    }
    
    // Limpiar campos del formulario
    const formVerificacion = document.getElementById("form-verificacion");
if (formVerificacion) {
    formVerificacion.reset();
} else {
    console.warn("No se encontró el formulario para resetear");
}
    
    // Eliminar referencia al equipo seleccionado
    delete window.equipoSeleccionado;
    
    mostrarMensaje("Proceso de verificación cancelado", "info");
}

/**
 * Guarda la verificación actual en el historial
 */
function guardarVerificacion() {
    console.log('Guardando verificación...');
    
    const selectorEquipo = document.getElementById("equipo-verificar");
    const responsableInput = document.getElementById("responsable-verificacion");
    const observacionesInput = document.getElementById("observaciones-verificacion");
    const resultadoSelect = document.getElementById("resultado-general");
    
    // Validaciones
    if (!selectorEquipo || !selectorEquipo.value) {
        mostrarMensaje("Por favor, seleccione un equipo para verificar", "error");
        return;
    }
    
    if (!responsableInput || !responsableInput.value.trim()) {
        mostrarMensaje("Por favor, ingrese el nombre del responsable", "error");
        return;
    }
    
    // Obtener datos del equipo seleccionado
    const equipoId = selectorEquipo.value;
    const equipo = equipos.find(eq => eq.id === equipoId || eq.serie === equipoId);
    
    if (!equipo) {
        mostrarMensaje("Equipo no encontrado", "error");
        return;
    }
    
    // Obtener datos de la verificación
    const responsable = responsableInput.value.trim();
    const observaciones = observacionesInput ? observacionesInput.value.trim() : '';
    const resultado = resultadoSelect ? resultadoSelect.value : 'conforme';
    
    // Crear objeto de verificación
    const nuevaVerificacion = {
        id: `ver-${Date.now()}`, // ID único para la verificación
        equipoId: equipo.serie,
        nombreEquipo: equipo.nombre,
        ubicacionEquipo: equipo.ubicacion || "No especificada",
        fecha: new Date().toISOString(),
        responsable: responsable,
        resultado: resultado,
        observaciones: observaciones,
        items: [] // Se llenará según el checklist
    };
    
    // Obtener items del checklist
    const checkboxes = document.querySelectorAll('.checklist-checkbox');
    checkboxes.forEach(checkbox => {
        const itemTexto = checkbox.parentElement.innerText.trim();
        nuevaVerificacion.items.push({
            texto: itemTexto,
            verificado: checkbox.checked
        });
    });
    
    // Guardar en el "historial" (array de verificaciones)
    verificaciones.unshift(nuevaVerificacion);
    console.log('Verificación guardada:', nuevaVerificacion);
    
    // Actualizar tabla de verificaciones
    actualizarTablaVerificaciones();
    
    // Guardar en localStorage
    try {
        localStorage.setItem('verificacionesEquipos', JSON.stringify(verificaciones));
        console.log('Verificaciones guardadas en localStorage');
    } catch (error) {
        console.error('Error al guardar en localStorage:', error);
    }
    
    // Ocultar formulario 
    const formularioVerificacion = document.getElementById("formulario-verificacion");
    if (formularioVerificacion) {
        formularioVerificacion.style.display = "none";
    }
    
    // Mostrar selector de equipos
    const selectorEquipo2 = document.querySelector('.selector-equipo');
    if (selectorEquipo2) {
        selectorEquipo2.style.display = 'block';
    }
    
    // Limpiar campos del formulario - Con validación
    const formVerificacion = document.getElementById("form-verificacion");
    if (formVerificacion) {
        formVerificacion.reset();
    } else {
        console.warn("No se encontró el formulario para resetear");
    }
    
    // Actualizar el selector de filtro de equipos
    const filtroEquipo = document.getElementById("filtro-equipo-historial");
    if (filtroEquipo) {
        actualizarFiltroEquipos(filtroEquipo);
    }
    
    // Eliminar referencia al equipo seleccionado
    delete window.equipoSeleccionado;
    
    // Mostrar mensaje de éxito al final
    mostrarMensaje("Verificación guardada correctamente", "success");
}

/**
 * Duplica una verificación existente para ahorrar tiempo en verificaciones rutinarias
 * @param {string} verificacionId - ID de la verificación a duplicar
 */
function duplicarVerificacion(verificacionId) {
    console.log(`Duplicando verificación: ${verificacionId}`);
    
    // Buscar la verificación a duplicar
    const verificacion = verificaciones.find(v => v.id === verificacionId);
    
    if (!verificacion) {
        mostrarMensaje("Error: No se encontró la verificación seleccionada", "error");
        return;
    }
    
    // Obtener el equipo asociado a la verificación
    const equipo = equipos.find(eq => eq.serie === verificacion.equipoId);
    
    if (!equipo) {
        mostrarMensaje(`Error: No se encontró el equipo ${verificacion.equipoId} en el sistema`, "error");
        return;
    }
    
    // Verificar si el equipo sigue operativo
    if (equipo.estado !== 'operativo') {
        mostrarMensaje(`El equipo ${equipo.nombre} no está en estado operativo actualmente`, "warning");
        return;
    }
    
    // Configurar el selector de equipo
    const selectorEquipo = document.getElementById("equipo-verificar");
    if (!selectorEquipo) {
        mostrarMensaje("Error: No se encontró el selector de equipos", "error");
        return;
    }
    
    // Seleccionar el equipo en el selector
    let equipoEncontrado = false;
    for (let i = 0; i < selectorEquipo.options.length; i++) {
        if (selectorEquipo.options[i].value === verificacion.equipoId) {
            selectorEquipo.selectedIndex = i;
            equipoEncontrado = true;
            break;
        }
    }
    
    if (!equipoEncontrado) {
        mostrarMensaje(`El equipo ${equipo.nombre} ya no está disponible para verificación`, "warning");
        return;
    }
    
    // Rellenar el campo de responsable (opcionalmente conservar el anterior)
    const responsableInput = document.getElementById("responsable-verificacion");
    if (responsableInput) {
        responsableInput.value = verificacion.responsable;
    }
    
    // IMPORTANTE: Guardar referencia al equipo seleccionado para que la verificación funcione
    window.equipoSeleccionado = equipo;
    
    // Mostrar el formulario de verificación
    const formularioVerificacion = document.getElementById("formulario-verificacion");
    if (formularioVerificacion) {
        formularioVerificacion.style.display = "block";
        
        // Actualizar la información del equipo seleccionado
        const tituloEquipo = document.getElementById("titulo-equipo-verificacion");
        if (tituloEquipo) {
            tituloEquipo.textContent = `${equipo.nombre} - ${equipo.marca} ${equipo.modelo}`;
        }
        
        // Mostrar datos adicionales del equipo
        const datosEquipo = document.getElementById("datos-equipo-verificacion");
        if (datosEquipo) {
            datosEquipo.innerHTML = `
                <p><strong>ID:</strong> ${equipo.id || equipo.serie}</p>
                <p><strong>Serie:</strong> ${equipo.serie || 'N/A'}</p>
                <p><strong>Categoría:</strong> ${formatearCategoria(equipo.categoria)}</p>
                <p><strong>Ubicación:</strong> ${equipo.ubicacion || 'No especificada'}</p>
            `;
        }
        
        // Asegurarse de que el contenedor del checklist exista
        const checklistContainer = document.getElementById("checklist-container");
        if (!checklistContainer) {
            console.error("Contenedor del checklist no encontrado");
            
            // Crear el contenedor si no existe
            const nuevoContainer = document.createElement('div');
            nuevoContainer.id = 'checklist-container';
            nuevoContainer.className = 'checklist-container';
            formularioVerificacion.insertBefore(nuevoContainer, document.getElementById('form-verificacion'));
        }
        
        // Cargar el checklist según la categoría del equipo
        cargarChecklistVerificacion(equipo.categoria);
        
        // Esperar a que el checklist se cargue para marcar las casillas
        setTimeout(() => {
            // Marcar todas las casillas del checklist
            const checkboxes = document.querySelectorAll('.checklist-checkbox');
            checkboxes.forEach(checkbox => {
                checkbox.checked = true;
            });
            
            // Pre-llenar observaciones si las había
            const observacionesTextarea = document.getElementById("observaciones-verificacion");
            if (observacionesTextarea) {
                observacionesTextarea.value = verificacion.observaciones || "";
            }
            
            // Pre-seleccionar el resultado
            const resultadoSelect = document.getElementById("resultado-general");
            if (resultadoSelect) {
                resultadoSelect.value = verificacion.resultado;
            }
            
            // Hacer scroll suave hacia el formulario de verificación
            formularioVerificacion.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start'
            });
            
            // Añadir un efecto de resaltado temporal para llamar la atención
            formularioVerificacion.classList.add('highlight-effect');
            setTimeout(() => {
                formularioVerificacion.classList.remove('highlight-effect');
            }, 1500);
            
            // Añadir un indicador visual de duplicación
            const indicadorDuplicacion = document.createElement('div');
            indicadorDuplicacion.className = 'duplicacion-indicator';
            indicadorDuplicacion.innerHTML = `
                <div class="duplicacion-icon">🔄</div>
                <div class="duplicacion-text">
                    <strong>Verificación duplicada</strong>
                    <span>Se han copiado los valores de la verificación anterior. Por favor revise y confirme.</span>
                </div>
            `;
            
            // Insertar el indicador al principio del formulario
            formularioVerificacion.insertBefore(
                indicadorDuplicacion, 
                formularioVerificacion.firstChild
            );
            
            // Eliminar el indicador después de guardar o cancelar la verificación
            const btnGuardar = document.querySelector('.btn-guardar-verificacion');
            const btnCancelar = document.querySelector('.btn-cancelar-verificacion');
            
            if (btnGuardar) {
                btnGuardar.addEventListener('click', function() {
                    const indicator = document.querySelector('.duplicacion-indicator');
                    if (indicator) indicator.remove();
                }, { once: true });
            }
            
            if (btnCancelar) {
                btnCancelar.addEventListener('click', function() {
                    const indicator = document.querySelector('.duplicacion-indicator');
                    if (indicator) indicator.remove();
                }, { once: true });
            }
            
            mostrarMensaje("Se ha duplicado la verificación anterior. Revise los datos y guarde la nueva verificación.", "info");
        }, 300); // Aumentar el tiempo de espera para asegurar que todo esté cargado
        
        // Ocultar selector de equipos mientras se realiza la verificación
        document.querySelector('.selector-equipo').style.display = 'none';
    }
}

/**
 * Elimina una verificación específica
 * @param {string} verificacionId - ID de la verificación a eliminar
 */
function eliminarVerificacion(verificacionId) {
    console.log(`Eliminando verificación: ${verificacionId}`);
    
    // Confirmar antes de eliminar
    if (!confirm("¿Estás seguro de que deseas eliminar esta verificación? Esta acción no se puede deshacer.")) {
        return;
    }
    
    // Buscar y eliminar la verificación
    const index = verificaciones.findIndex(v => v.id === verificacionId);
    if (index !== -1) {
        // Guardar información para el mensaje
        const equipo = verificaciones[index].nombreEquipo;
        const fecha = new Date(verificaciones[index].fecha).toLocaleString();
            
    // Actualizar el selector de filtro de equipos después de eliminar una verificación
    const filtroEquipo = document.getElementById("filtro-equipo-historial");
    if (filtroEquipo) {
        actualizarFiltroEquipos(filtroEquipo);
    }
        
        // Eliminar la verificación
        verificaciones.splice(index, 1);
        
        // Guardar cambios en localStorage
        try {
            localStorage.setItem('verificacionesEquipos', JSON.stringify(verificaciones));
        } catch (error) {
            console.error('Error al guardar en localStorage:', error);
        }
        
        // Actualizar la tabla
        actualizarTablaVerificaciones();
        
        mostrarMensaje(`Verificación de ${equipo} del ${fecha} eliminada correctamente`, "success");
    } else {
        mostrarMensaje("No se encontró la verificación para eliminar", "error");
    }
}


// ================================================================
// 6. GESTIÓN DEL HISTORIAL
// ================================================================

/**
 * Filtra el historial de verificaciones según los criterios seleccionados
 */
function filtrarHistorialVerificaciones() {
    console.log('Filtrando historial de verificaciones...');
      
    const fechaDesdeInput = document.getElementById("filtro-fecha-desde");
    const fechaHastaInput = document.getElementById("filtro-fecha-hasta");
    const equipoFiltro = document.getElementById("filtro-equipo-historial");
    const resultadoFiltro = document.getElementById("filtro-resultado-historial");
    
    // Obtener valores de los filtros y mostrar logs
    const fechaDesdeStr = fechaDesdeInput ? fechaDesdeInput.value : '';
    const fechaHastaStr = fechaHastaInput ? fechaHastaInput.value : '';
    const equipoSeleccionado = equipoFiltro ? equipoFiltro.value : '';
    const resultadoSeleccionado = resultadoFiltro ? resultadoFiltro.value : '';
    
    console.log(`Filtros aplicados:`);
    console.log(`- Fecha desde: ${fechaDesdeStr || 'No seleccionada'}`);
    console.log(`- Fecha hasta: ${fechaHastaStr || 'No seleccionada'}`);
    console.log(`- Equipo: ${equipoSeleccionado || 'Todos'}`);
    console.log(`- Resultado: ${resultadoSeleccionado || 'Todos'}`);
    
    // Convertir fechas de manera más robusta
    let fechaDesde = null;
    let fechaHasta = null;
    
    if (fechaDesdeStr) {
        fechaDesde = new Date(fechaDesdeStr);
        fechaDesde.setHours(0, 0, 0, 0); // Inicio del día
        console.log(`Fecha desde convertida: ${fechaDesde.toISOString()}`);
    }
    
    if (fechaHastaStr) {
        fechaHasta = new Date(fechaHastaStr);
        fechaHasta.setHours(23, 59, 59, 999); // Final del día
        console.log(`Fecha hasta convertida: ${fechaHasta.toISOString()}`);
    }
    
    // Filtrar verificaciones con logs detallados
    let contador = {total: 0, fechaDesde: 0, fechaHasta: 0, equipo: 0, resultado: 0, final: 0};
    
    const verificacionesFiltradas = verificaciones.filter(v => {
        contador.total++;
        // Convertir la fecha de la verificación
        const fechaVerif = new Date(v.fecha);
        
        // Aplicar filtros
        const cumpleFechaDesde = !fechaDesde || fechaVerif >= fechaDesde;
        if (!cumpleFechaDesde) return false;
        contador.fechaDesde++;
        
        const cumpleFechaHasta = !fechaHasta || fechaVerif <= fechaHasta;
        if (!cumpleFechaHasta) return false;
        contador.fechaHasta++;
        
        const cumpleEquipo = !equipoSeleccionado || v.equipoId === equipoSeleccionado;
        if (!cumpleEquipo) return false;
        contador.equipo++;
        
        const cumpleResultado = !resultadoSeleccionado || v.resultado === resultadoSeleccionado;
        if (!cumpleResultado) return false;
        contador.resultado++;
        
        contador.final++;
        return true;
    });
    
    console.log(`Proceso de filtrado:`);
    console.log(`- Total verificaciones: ${contador.total}`);
    console.log(`- Pasaron filtro fecha desde: ${contador.fechaDesde}`);
    console.log(`- Pasaron filtro fecha hasta: ${contador.fechaHasta}`);
    console.log(`- Pasaron filtro equipo: ${contador.equipo}`);
    console.log(`- Pasaron filtro resultado: ${contador.resultado}`);
    console.log(`- Resultado final: ${contador.final}`);
    
    // Actualizar tabla con verificaciones filtradas
    actualizarTablaVerificaciones(verificacionesFiltradas);
    
    mostrarMensaje(`Historial filtrado: ${verificacionesFiltradas.length} verificaciones encontradas`, "info");
}

/**
 * Exporta las verificaciones actuales a un archivo CSV
 */
function exportarVerificacionesCSV() {
    console.log('Exportando verificaciones a CSV...');
    
    // Obtener los datos de la tabla (puede mejorarse para incluir todos los datos)
    const rows = [];
    const tabla = document.querySelector("#tabla-verificaciones");
    if (!tabla) {
        mostrarMensaje("No se encontró la tabla de verificaciones", "error");
        return;
    }
    
    // Obtener encabezados
    const encabezados = Array.from(tabla.querySelectorAll("thead th"));
    const encabezadosTexto = encabezados.map(th => th.innerText.trim());
    rows.push(encabezadosTexto);
    
    // Obtener filas
    const filas = tabla.querySelectorAll("tbody tr");
    filas.forEach(tr => {
        const cols = tr.querySelectorAll("td");
        const filaTexto = Array.from(cols).map(td => td.innerText.trim());
        rows.push(filaTexto);
    });
    
    // Convertir a CSV
    const csvContent = "data:text/csv;charset=utf-8," 
        + rows.map(e => e.join(",")).join("\n");
    
    // Descargar archivo
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `verificaciones_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    mostrarMensaje("Verificaciones exportadas a CSV", "success");
}

/**
 * Limpia los filtros del historial y restaura la vista completa
 */
function limpiarFiltrosHistorial() {
    console.log('Limpiando filtros del historial...');
    
    // Resetear los valores de los filtros con los IDs CORRECTOS
    const fechaDesdeInput = document.getElementById("filtro-fecha-desde");
    const fechaHastaInput = document.getElementById("filtro-fecha-hasta");
    const equipoFiltro = document.getElementById("filtro-equipo-historial");
    const resultadoFiltro = document.getElementById("filtro-resultado-historial");
    
    // Limpiar los campos de filtro
    if (fechaDesdeInput) {
        fechaDesdeInput.value = '';
        console.log('Campo fecha desde limpiado');
    } else {
        console.warn('No se encontró el campo fecha desde');
    }
    
    if (fechaHastaInput) {
        fechaHastaInput.value = '';
        console.log('Campo fecha hasta limpiado');
    } else {
        console.warn('No se encontró el campo fecha hasta');
    }
    
    if (equipoFiltro) equipoFiltro.selectedIndex = 0;
    if (resultadoFiltro) resultadoFiltro.selectedIndex = 0;
    
    // Actualizar la tabla con todas las verificaciones
    actualizarTablaVerificaciones();
    
    mostrarMensaje("Filtros eliminados. Mostrando todas las verificaciones.", "info");
}


// ================================================================
// 7. EXPORTACIÓN Y REPORTES PDF
// ================================================================



/**
 * Genera un PDF con información de un equipo y sus verificaciones
 */
function generarPDFEquipo() {
    console.log('Generando PDF de equipo...');
    
    // Obtener el equipo seleccionado
    const selectorEquipo = document.getElementById("equipo-verificar");
    if (!selectorEquipo || !selectorEquipo.value) {
        mostrarMensaje("Por favor, seleccione un equipo primero", "error");
        return;
    }
    
    const equipoId = selectorEquipo.value;
    const equipo = equipos.find(eq => eq.serie === equipoId);
    
    if (!equipo) {
        mostrarMensaje("No se encontró información del equipo seleccionado", "error");
        return;
    }
    
    // Generar PDF para el equipo seleccionado
    generarPDFEquipoDesdeHistorial(equipoId);
}

/**
 * Genera un PDF con información detallada de un equipo y su historial de verificaciones
 * @param {string} equipoId - ID del equipo para generar el PDF
 */
function generarPDFEquipoDesdeHistorial(equipoId) {
    console.log(`Generando PDF para equipo: ${equipoId}`);
    
    // Buscar el equipo
    const equipo = equipos.find(eq => eq.serie === equipoId);
    
    if (!equipo) {
        mostrarMensaje("No se encontró información del equipo seleccionado", "error");
        return;
    }
    
    // Buscar verificaciones del equipo
    const verificacionesEquipo = verificaciones.filter(v => v.equipoId === equipoId);
    
    // Verificar disponibilidad de jsPDF
    if (!esPDFDisponible()) {
        mostrarMensaje("Error: Biblioteca jsPDF no encontrada. Verifique la conexión a internet", "error");
        console.error("jsPDF no está disponible correctamente");
        return;
    }
    
    try {
        // Obtener la clase jsPDF
        const jsPDF = obtenerJsPDF();
        
        // Crear nuevo documento PDF
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        
        // Configuración de estilos
        const colorPrimario = [41, 128, 185]; // Azul
        const colorSecundario = [44, 62, 80]; // Azul oscuro
        const colorTexto = [52, 73, 94]; // Gris azulado
        
        // Título del documento
        doc.setFontSize(22);
        doc.setTextColor(colorPrimario[0], colorPrimario[1], colorPrimario[2]);
        doc.text('Información del equipo ' + equipo.nombre, pageWidth/2, 20, {align: 'center'});
        
        // Agregar la fecha de generación
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Fecha de generación: ${new Date().toLocaleString()}`, pageWidth - 15, 10, {align: 'right'});
        
        // Información general del equipo
        doc.setFontSize(14);
        doc.setTextColor(colorSecundario[0], colorSecundario[1], colorSecundario[2]);
        doc.text('Datos generales del equipo', 14, 35);
        
        // Línea divisoria
        doc.setDrawColor(colorPrimario[0], colorPrimario[1], colorPrimario[2]);
        doc.setLineWidth(0.5);
        doc.line(14, 38, pageWidth - 14, 38);
        
        // Detalles del equipo
        doc.setFontSize(12);
        doc.setTextColor(colorTexto[0], colorTexto[1], colorTexto[2]);
        let y = 45;
        doc.text(`Nombre: ${equipo.nombre}`, 14, y); y += 7;
        doc.text(`ID/Serie: ${equipo.serie}`, 14, y); y += 7;
        doc.text(`Marca: ${equipo.marca || 'No especificada'}`, 14, y); y += 7;
        doc.text(`Modelo: ${equipo.modelo || 'No especificado'}`, 14, y); y += 7;
        doc.text(`Categoría: ${formatearCategoria(equipo.categoria)}`, 14, y); y += 7;
        doc.text(`Ubicación: ${equipo.ubicacion || 'No especificada'}`, 14, y); y += 7;
        doc.text(`Estado: ${formatearEstado(equipo.estado)}`, 14, y); y += 7;
        
        // Más información si está disponible
        if (equipo.fechaAdquisicion) {
            doc.text(`Fecha de adquisición: ${new Date(equipo.fechaAdquisicion).toLocaleDateString()}`, 14, y);
            y += 7;
        }
        if (equipo.ultimoMantenimiento) {
            doc.text(`Último mantenimiento: ${new Date(equipo.ultimoMantenimiento).toLocaleDateString()}`, 14, y);
            y += 7;
        }
        if (equipo.proximoMantenimiento) {
            doc.text(`Próximo mantenimiento: ${new Date(equipo.proximoMantenimiento).toLocaleDateString()}`, 14, y);
            y += 7;
        }
        
        y += 10;
        
        // Historial de verificaciones
        doc.setFontSize(14);
        doc.setTextColor(colorSecundario[0], colorSecundario[1], colorSecundario[2]);
        doc.text('Historial de verificaciones', 14, y);
        y += 3;
        
        // Línea divisoria
        doc.setDrawColor(colorPrimario[0], colorPrimario[1], colorPrimario[2]);
        doc.setLineWidth(0.5);
        doc.line(14, y, pageWidth - 14, y);
        y += 10;
        
        if (verificacionesEquipo.length === 0) {
            doc.setFontSize(12);
            doc.setTextColor(colorTexto[0], colorTexto[1], colorTexto[2]);
            doc.text('No hay verificaciones registradas para este equipo.', 14, y);
        } else {
            // Encabezados de la tabla de verificaciones
            const headers = ['Fecha', 'Responsable', 'Resultado', 'Observaciones'];
            const columnWidths = [40, 40, 30, 70];
            
            doc.setFontSize(11);
            doc.setTextColor(255, 255, 255);
            
            // Fondo para encabezados
            doc.setFillColor(colorPrimario[0], colorPrimario[1], colorPrimario[2]);
            doc.rect(14, y - 5, pageWidth - 28, 8, 'F');
            
            // Textos de encabezados
            let xPos = 16;
            headers.forEach((header, i) => {
                doc.text(header, xPos, y);
                xPos += columnWidths[i];
            });
            y += 8;
            
            // Limitar a las 10 verificaciones más recientes
            const verificacionesMostrar = verificacionesEquipo.slice(0, 10);
            
            // Contenido de la tabla
            doc.setTextColor(colorTexto[0], colorTexto[1], colorTexto[2]);
            let colorFila = true;
            
            verificacionesMostrar.forEach(verif => {
                // Alternar color de fondo para filas
                if (colorFila) {
                    doc.setFillColor(240, 240, 240);
                    doc.rect(14, y - 5, pageWidth - 28, 8, 'F');
                }
                colorFila = !colorFila;
                
                // Fecha formateada
                const fecha = new Date(verif.fecha).toLocaleDateString();
                
                // Acortar texto de observaciones
                const obsAcortadas = verif.observaciones ? 
                    acortarTextoLargo(verif.observaciones, 30) : 'Sin observaciones';
                
                // Formatear resultado
                const resultadoTexto = formatearResultadoVerificacion(verif.resultado);
                
                // Escribir datos de la fila
                xPos = 16;
                doc.text(fecha, xPos, y); xPos += columnWidths[0];
                doc.text(verif.responsable, xPos, y); xPos += columnWidths[1];
                doc.text(resultadoTexto, xPos, y); xPos += columnWidths[2];
                doc.text(obsAcortadas, xPos, y);
                
                y += 8;
                
                // Si llegamos al final de la página, crear una nueva
                if (y > 270) {
                    doc.addPage();
                    y = 20;
                    
                    // Encabezado en la nueva página
                    doc.setFontSize(14);
                    doc.setTextColor(colorSecundario[0], colorSecundario[1], colorSecundario[2]);
                    doc.text(`Historial de verificaciones - ${equipo.nombre} (continuación)`, 14, y);
                    y += 8;
                    
                    // Repetir encabezados de tabla
                    doc.setFontSize(11);
                    doc.setTextColor(255, 255, 255);
                    doc.setFillColor(colorPrimario[0], colorPrimario[1], colorPrimario[2]);
                    doc.rect(14, y - 5, pageWidth - 28, 8, 'F');
                    
                    xPos = 16;
                    headers.forEach((header, i) => {
                        doc.text(header, xPos, y);
                        xPos += columnWidths[i];
                    });
                    y += 8;
                    
                    doc.setTextColor(colorTexto[0], colorTexto[1], colorTexto[2]);
                }
            });
            
            // Si hay más verificaciones que no se muestran
            if (verificacionesEquipo.length > 10) {
                y += 5;
                doc.setFontSize(10);
                doc.setTextColor(100, 100, 100);
                doc.text(`* Se muestran las 10 verificaciones más recientes de un total de ${verificacionesEquipo.length}.`, 14, y);
            }
        } // Cierre correcto del bloque else

        // Pie de página (ahora dentro del try)
        const yFooter = doc.internal.pageSize.getHeight() - 10;
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text('Sistema de Gestión de Equipamiento Médico - Verificación Diaria de Equipos', pageWidth/2, yFooter, {align: 'center'});
        
        // Mostrar PDF en modal (dentro del try)
        mostrarPDFEnModal(doc, `Información del equipo ${equipo.nombre}`);
        
    } catch (error) {
        console.error("Error al generar PDF:", error);
        mostrarMensaje("Error al generar el PDF: " + error.message, "error");
    }
}
/**
 * Genera un reporte completo de todas las verificaciones en un periodo
 */
function generarReporteVerificacionesPDF() {
    console.log('Generando reporte completo de verificaciones...');
    
    // Obtener fechas de filtro si existen
    const fechaDesdeInput = document.getElementById("fecha-desde");
    const fechaHastaInput = document.getElementById("fecha-hasta");
    
    let fechaDesde = fechaDesdeInput && fechaDesdeInput.value ? 
        new Date(fechaDesdeInput.value) : null;
    let fechaHasta = fechaHastaInput && fechaHastaInput.value ? 
        new Date(fechaHastaInput.value) : null;
    
    // Si no hay fechas seleccionadas, usar último mes
    if (!fechaDesde && !fechaHasta) {
        fechaHasta = new Date();
        fechaDesde = new Date();
        fechaDesde.setMonth(fechaDesde.getMonth() - 1);
    }
    
    // Filtrar verificaciones
    let verificacionesFiltradas = verificaciones;
    if (fechaDesde) {
        verificacionesFiltradas = verificacionesFiltradas.filter(v => new Date(v.fecha) >= fechaDesde);
    }
    if (fechaHasta) {
        verificacionesFiltradas = verificacionesFiltradas.filter(v => new Date(v.fecha) <= fechaHasta);
    }
    
    // Crear PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Título
    doc.setFontSize(18);
    doc.setTextColor(41, 128, 185);
    doc.text('Reporte de Verificaciones de Equipos', pageWidth/2, 20, {align: 'center'});
    
    // Periodo del reporte
    let periodoTexto = "Periodo: ";
    if (fechaDesde) {
        periodoTexto += fechaDesde.toLocaleDateString();
    } else {
        periodoTexto += "Inicio";
    }
    periodoTexto += " - ";
    if (fechaHasta) {
        periodoTexto += fechaHasta.toLocaleDateString();
    } else {
        periodoTexto += "Actual";
    }
    
    doc.setFontSize(12);
    doc.text(periodoTexto, pageWidth/2, 30, {align: 'center'});
    
    // Resumen
    doc.setFontSize(14);
    doc.setTextColor(44, 62, 80);
    doc.text('Resumen', 14, 45);
    
    // Línea
    doc.setDrawColor(41, 128, 185);
    doc.setLineWidth(0.5);
    doc.line(14, 48, pageWidth - 14, 48);
    
    // Contar resultados
    const totalVerificaciones = verificacionesFiltradas.length;
    const conformes = verificacionesFiltradas.filter(v => v.resultado === 'conforme').length;
    const observaciones = verificacionesFiltradas.filter(v => v.resultado === 'observaciones').length;
    const noConformes = verificacionesFiltradas.filter(v => v.resultado === 'no-conforme').length;
    
    // Estadísticas
    doc.setFontSize(12);
    doc.setTextColor(52, 73, 94);
    let y = 55;
    doc.text(`Total de verificaciones: ${totalVerificaciones}`, 14, y); y += 8;
    doc.text(`Conformes: ${conformes} (${Math.round(conformes/totalVerificaciones*100) || 0}%)`, 14, y); y += 8;
    doc.text(`Con observaciones: ${observaciones} (${Math.round(observaciones/totalVerificaciones*100) || 0}%)`, 14, y); y += 8;
    doc.text(`No conformes: ${noConformes} (${Math.round(noConformes/totalVerificaciones*100) || 0}%)`, 14, y); y += 15;
    
    // Lista de verificaciones
    doc.setFontSize(14);
    doc.setTextColor(44, 62, 80);
    doc.text('Detalle de verificaciones', 14, y);
    y += 3;
    
    // Línea
    doc.setDrawColor(41, 128, 185);
    doc.setLineWidth(0.5);
    doc.line(14, y, pageWidth - 14, y);
    y += 10;
    
    // Encabezados
    const headers = ['Fecha', 'Equipo', 'Ubicación', 'Responsable', 'Resultado'];
    const columnWidths = [25, 50, 35, 40, 30];
    
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    
    // Fondo encabezados
    doc.setFillColor(41, 128, 185);
    doc.rect(14, y - 5, pageWidth - 28, 7, 'F');
    
    // Texto encabezados
    let xPos = 15;
    headers.forEach((header, i) => {
        doc.text(header, xPos, y);
        xPos += columnWidths[i];
    });
    y += 7;
    
    // Datos
    doc.setTextColor(52, 73, 94);
    let colorFila = true;
    
    verificacionesFiltradas.forEach((verif, index) => {
        // Alternar color de fondo
        if (colorFila) {
            doc.setFillColor(240, 240, 240);
            doc.rect(14, y - 5, pageWidth - 28, 7, 'F');
        }
        colorFila = !colorFila;
        
        // Formato de fecha
        const fecha = new Date(verif.fecha).toLocaleDateString();
        
        // Acortar textos largos
        const equipoNombre = acortarTextoLargo(verif.nombreEquipo, 25);
        
        // Formatear resultado
        const resultadoTexto = formatearResultadoVerificacion(verif.resultado);
        
        // Escribir fila
        xPos = 15;
        doc.text(fecha, xPos, y); xPos += columnWidths[0];
        doc.text(equipoNombre, xPos, y); xPos += columnWidths[1];
        doc.text(verif.ubicacionEquipo, xPos, y); xPos += columnWidths[2];
        doc.text(verif.responsable, xPos, y); xPos += columnWidths[3];
        doc.text(resultadoTexto, xPos, y);
        
        y += 7;
        
        // Nueva página si es necesario
        if (y > 280) {
            doc.addPage();
            y = 20;
            
            // Título en nueva página
            doc.setFontSize(14);
            doc.setTextColor(44, 62, 80);
            doc.text('Detalle de verificaciones (continuación)', 14, y);
            y += 8;
            
            // Repetir encabezados
            doc.setFontSize(10);
            doc.setTextColor(255, 255, 255);
            doc.setFillColor(41, 128, 185);
            doc.rect(14, y - 5, pageWidth - 28, 7, 'F');
            
            xPos = 15;
            headers.forEach((header, i) => {
                doc.text(header, xPos, y);
                xPos += columnWidths[i];
            });
            y += 7;
            doc.setTextColor(52, 73, 94);
            colorFila = true;
        }
    });
    
    // Pie de página
    const yFooter = doc.internal.pageSize.getHeight() - 10;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Sistema de Gestión de Equipamiento Médico - Reporte generado el ' + new Date().toLocaleString(), 
              pageWidth/2, yFooter, {align: 'center'});
    
    // Mostrar PDF en modal
    mostrarPDFEnModal(doc, 'Reporte de Verificaciones de Equipos');
}


// ================================================================
// 8. UTILIDADES Y HELPERS
// ================================================================

/**
 * Acorta un texto para mostrarlo en espacios limitados
 * @param {string} texto - El texto a acortar
 * @param {number} longitud - Longitud máxima deseada
 * @returns {string} Texto acortado con elipsis si es necesario
 */
function acortarTextoLargo(texto, longitud = 20) {
    if (!texto || typeof texto !== 'string') return '';
    return texto.length > longitud ? texto.substring(0, longitud) + '...' : texto;
}

/**
 * Formatea la categoría de un equipo para mostrarla al usuario
 * @param {string} categoria - Categoría del equipo (código)
 * @returns {string} Nombre legible de la categoría
 */
function formatearCategoria(categoria) {
    const categorias = {
        'alta-tecnologia': 'Alta Tecnología',
        'soporte-vida': 'Soporte Vital',
        'critico': 'Crítico',
        'general': 'General',
        'diagnostico': 'Diagnóstico',
        'laboratorio': 'Laboratorio',
        'terapia': 'Terapéutico'
    };
    
    return categorias[categoria] || categoria || 'No especificada';
}

/**
 * Formatea el estado de un equipo para mostrarla al usuario
 * @param {string} estado - Estado del equipo (código)
 * @returns {string} Nombre legible del estado
 */
function formatearEstado(estado) {
    const estados = {
        'operativo': 'Operativo',
        'mantenimiento': 'En Mantenimiento',
        'reparacion': 'En Reparación',
        'baja': 'Dado de Baja',
        'reservado': 'Reservado'
    };
    
    return estados[estado] || estado || 'No especificado';
}

/**
 * Formatea el resultado de verificación para mostrarla al usuario
 * @param {string} resultado - Resultado de verificación (código)
 * @returns {string} Nombre legible del resultado
 */
function formatearResultadoVerificacion(resultado) {
    const resultados = {
        'conforme': 'Conforme',
        'observaciones': 'Con observaciones',
        'no-conforme': 'No conforme'
    };
    
    return resultados[resultado] || resultado || 'No especificado';
}

/**
 * Convierte una fecha a formato local
 * @param {string|Date} fecha - Fecha a formatear
 * @returns {string} Fecha formateada
 */
function formatearFecha(fecha) {
    if (!fecha) return 'N/A';
    try {
        return new Date(fecha).toLocaleDateString();
    } catch (error) {
        console.error('Error al formatear fecha:', error);
        return 'Fecha inválida';
    }
}

/**
 * Genera un ID único para elementos del sistema
 * @param {string} prefijo - Prefijo para el ID (opcional)
 * @returns {string} ID único generado
 */
function generarIdUnico(prefijo = 'id') {
    return `${prefijo}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

/**
 * Comprueba si una cadena es un JSON válido
 * @param {string} str - Cadena a comprobar
 * @returns {boolean} true si es un JSON válido, false en caso contrario
 */
function esJsonValido(str) {
    if (typeof str !== 'string') return false;
    try {
        JSON.parse(str);
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * Verifica si jsPDF está disponible
 * @returns {boolean} true si la biblioteca está disponible
 */
function esPDFDisponible() {
    return typeof window.jspdf !== 'undefined' && 
           typeof window.jspdf.jsPDF === 'function';
}

/**
 * Obtiene la clase jsPDF desde la biblioteca cargada
 * @returns {function} Constructor de jsPDF
 */
function obtenerJsPDF() {
    if (esPDFDisponible()) {
        return window.jspdf.jsPDF;
    }
    return null;
}

/**
 * Crea un elemento DOM con atributos y contenido
 * @param {string} tag - Tipo de elemento a crear
 * @param {Object} atributos - Atributos para el elemento
 * @param {string|Node} contenido - Contenido del elemento (opcional)
 * @returns {HTMLElement} Elemento creado
 */
function crearElemento(tag, atributos = {}, contenido = null) {
    const elemento = document.createElement(tag);
    
    // Añadir atributos
    Object.entries(atributos).forEach(([key, value]) => {
        if (key === 'class') {
            elemento.className = value;
        } else if (key === 'dataset') {
            Object.entries(value).forEach(([dataKey, dataValue]) => {
                elemento.dataset[dataKey] = dataValue;
            });
        } else {
            elemento.setAttribute(key, value);
        }
    });
    
    // Añadir contenido
    if (contenido) {
        if (typeof contenido === 'string') {
            elemento.innerHTML = contenido;
        } else if (contenido instanceof Node) {
            elemento.appendChild(contenido);
        }
    }
    
    return elemento;
}

/**
 * Limpia el contenido de un elemento DOM
 * @param {HTMLElement} elemento - Elemento a limpiar
 */
function limpiarElemento(elemento) {
    if (!elemento) return;
    while (elemento.firstChild) {
        elemento.removeChild(elemento.firstChild);
    }
}

/**
 * Detecta el tipo de navegador del usuario
 * @returns {string} Nombre del navegador
 */
function detectarNavegador() {
    const userAgent = navigator.userAgent;
    let navegador = "Desconocido";
    
    if (userAgent.indexOf("Firefox") > -1) {
        navegador = "Firefox";
    } else if (userAgent.indexOf("SamsungBrowser") > -1) {
        navegador = "Samsung Browser";
    } else if (userAgent.indexOf("Opera") > -1 || userAgent.indexOf("OPR") > -1) {
        navegador = "Opera";
    } else if (userAgent.indexOf("Trident") > -1) {
        navegador = "Internet Explorer";
    } else if (userAgent.indexOf("Edge") > -1) {
        navegador = "Microsoft Edge (Legacy)";
    } else if (userAgent.indexOf("Edg") > -1) {
        navegador = "Microsoft Edge (Chromium)";
    } else if (userAgent.indexOf("Chrome") > -1) {
        navegador = "Chrome";
    } else if (userAgent.indexOf("Safari") > -1) {
        navegador = "Safari";
    }
    
    return navegador;
}

/**
 * Guarda una copia de seguridad de los datos en localStorage
 */
function realizarBackupDatos() {
    try {
        const fechaBackup = new Date().toISOString();
        const datos = {
            verificaciones: verificaciones,
            timestamp: fechaBackup,
            version: '1.0'
        };
        
        localStorage.setItem('backupVerificaciones', JSON.stringify(datos));
        console.log(`Backup realizado: ${fechaBackup}`);
        return true;
    } catch (error) {
        console.error('Error al realizar backup:', error);
        return false;
    }
}

/**
 * Restaura datos desde una copia de seguridad
 * @returns {boolean} true si se restauró correctamente, false en caso contrario
 */
function restaurarBackupDatos() {
    try {
        const backup = localStorage.getItem('backupVerificaciones');
        if (!backup) {
            console.warn('No se encontró copia de seguridad para restaurar');
            return false;
        }
        
        const datos = JSON.parse(backup);
        if (!datos.verificaciones || !Array.isArray(datos.verificaciones)) {
            console.error('El formato de la copia de seguridad es inválido');
            return false;
        }
        
        // Restaurar datos
        verificaciones = datos.verificaciones;
        
        // Guardar en localStorage principal
        localStorage.setItem('verificacionesEquipos', JSON.stringify(verificaciones));
        
        console.log(`Backup restaurado. Fecha: ${datos.timestamp}, ${verificaciones.length} verificaciones recuperadas`);
        return true;
    } catch (error) {
        console.error('Error al restaurar backup:', error);
        return false;
    }
}

// Inicializar el módulo cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM cargado en módulo de verificación, iniciando...');
    
    // Verificar que la variable equipos esté disponible
    if (typeof equipos === 'undefined' || !Array.isArray(equipos)) {
        console.error('Error: La variable "equipos" no está disponible o no es un array');
        mostrarMensaje('Error al cargar los equipos. Recargue la página.', 'error');
        return;
    }
    
    console.log(`Total de equipos cargados: ${equipos.length}`);
    
    // Inicializar el módulo
    setTimeout(() => {
        inicializarModuloVerificacion();
    }, 100); // Pequeño retraso para asegurar que todo esté listo
});

// Alternativa: Si el evento DOMContentLoaded ya fue disparado
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    console.log('Documento ya cargado, iniciando módulo de verificación...');
    setTimeout(() => {
        if (typeof equipos !== 'undefined' && Array.isArray(equipos)) {
            inicializarModuloVerificacion();
        } else {
            console.error('Error: La variable "equipos" no está disponible o no es un array');
            mostrarMensaje('Error al cargar los equipos. Recargue la página.', 'error');
        }
    }, 200);
}