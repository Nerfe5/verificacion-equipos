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
    
    // Inicializar la tabla de verificaciones
    inicializarTablaVerificaciones();
    
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

/**
 * Genera un PDF con la información del equipo seleccionado (función actualizada)
 */
function generarPDFEquipo() {
    console.log('Generando PDF del equipo...');
    
    // Obtener el ID del equipo seleccionado
    const selectorEquipo = document.getElementById("equipo-verificar");
    if (!selectorEquipo || !selectorEquipo.value) {
        mostrarMensaje("No hay un equipo seleccionado para generar PDF", "error");
        return;
    }
    
    const equipoId = selectorEquipo.value;
    
    // Buscar el equipo en el array de equipos
    const equipo = equipos.find(eq => eq.id === equipoId || eq.serie === equipoId);
    if (!equipo) {
        mostrarMensaje("No se pudo encontrar la información del equipo", "error");
        return;
    }
    
    // Filtrar las verificaciones de este equipo
    const verificacionesEquipo = verificaciones.filter(v => v.equipoId === equipoId);
    
    try {
        // Inicializar jsPDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        // Colores para el diseño
        const colorPrimario = [41, 128, 185]; // Azul profesional
        const colorSecundario = [52, 73, 94]; // Gris oscuro
        
        // Agregar encabezado con fecha y hora
        const fechaGeneracion = new Date().toLocaleString();
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generado: ${fechaGeneracion}`, 20, 10);
        
        // Título del documento con estilo
        doc.setFillColor(colorPrimario[0], colorPrimario[1], colorPrimario[2]);
        doc.rect(0, 15, 210, 15, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text("UMAE HE Puebla - INFORME DE EQUIPO MÉDICO", 105, 24, { align: "center" });
        
        // Información del equipo en un recuadro
        doc.setDrawColor(200, 200, 200);
        doc.setFillColor(245, 245, 245);
        doc.roundedRect(20, 40, 170, 50, 3, 3, 'FD');
        
        doc.setTextColor(colorSecundario[0], colorSecundario[1], colorSecundario[2]);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text("Datos Generales del Equipo", 30, 50);
        
        // Datos del equipo en dos columnas
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 60);
        
        let y1 = 58; // Primera columna
        let y2 = 58; // Segunda columna
        
        // Primera columna de datos
        doc.text(`ID/Serie: ${equipo.id || equipo.serie}`, 30, y1); y1 += 7;
        doc.text(`Nombre: ${acortarTextoLargo(equipo.nombre, 40)}`, 30, y1); y1 += 7;
        doc.text(`Marca: ${equipo.marca}`, 30, y1); y1 += 7;
        doc.text(`Modelo: ${equipo.modelo}`, 30, y1); y1 += 7;
        
        // Segunda columna de datos
        doc.text(`Categoría: ${formatearCategoria(equipo.categoria)}`, 110, y2); y2 += 7;
        doc.text(`Ubicación: ${equipo.ubicacion || "No especificada"}`, 110, y2); y2 += 7;
        doc.text(`Estado: ${equipo.estado}`, 110, y2); y2 += 7;
        
        // Sección de verificaciones con estilo
        y1 = Math.max(y1, y2) + 10;
        
        // Título de verificaciones
        doc.setFillColor(colorPrimario[0], colorPrimario[1], colorPrimario[2]);
        doc.rect(20, y1, 170, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text("HISTORIAL DE VERIFICACIONES", 105, y1 + 5.5, { align: "center" });
        
        y1 += 15;
        
        if (verificacionesEquipo.length > 0) {
            // Crear tabla de verificaciones con estilo mejorado
            doc.autoTable({
                startY: y1,
                head: [['Fecha', 'Responsable', 'Resultado', 'Observaciones']],
                body: verificacionesEquipo.map(v => [
                    new Date(v.fecha).toLocaleDateString(),
                    v.responsable,
                    v.resultado === 'conforme' ? '✓ Conforme' : 
                    v.resultado === 'observaciones' ? '⚠ Con observaciones' : 
                    v.resultado === 'no-conforme' ? '✗ No conforme' : v.resultado,
                    v.observaciones || "Sin observaciones"
                ]),
                theme: 'grid',
                headStyles: {
                    fillColor: colorSecundario,
                    textColor: [255, 255, 255],
                    fontStyle: 'bold',
                    lineWidth: 0.1,
                    lineColor: [220, 220, 220]
                },
                bodyStyles: {
                    textColor: [50, 50, 50],
                    lineWidth: 0.1,
                    lineColor: [220, 220, 220]
                },
                alternateRowStyles: {
                    fillColor: [240, 240, 240]
                },
                margin: { left: 20, right: 20 }
            });
        } else {
            doc.setTextColor(100, 100, 100);
            doc.setFontSize(10);
            doc.text("No hay verificaciones registradas para este equipo.", 105, y1 + 10, { align: "center" });
        }
        
        // Pie de página
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        for(let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.text(`Página ${i} de ${pageCount} - Centro Médico Nacional Manuel Ávila Camacho - Sistema de Gestión de Equipamiento Médico`, 105, 290, { align: "center" });
        }
        
        // En lugar de descargar automáticamente, mostrar en un modal para previsualizarlo
        mostrarPDFEnModal(doc, `Información del equipo ${equipo.nombre}`);
        
        mostrarMensaje(`PDF del equipo ${equipo.nombre} generado correctamente`, "success");
    } catch (error) {
        console.error('Error al generar PDF:', error);
        mostrarMensaje("Error al generar el PDF", "error");
    }
}




/**
 * Genera un PDF desde el historial de verificaciones con diseño mejorado
 */
function generarPDFEquipoDesdeHistorial(equipoId) {
    console.log('Generando PDF del equipo desde historial...', equipoId);
    
    // Buscar el equipo en el array de equipos
    const equipo = equipos.find(eq => eq.id === equipoId || eq.serie === equipoId);
    if (!equipo) {
        mostrarMensaje("No se pudo encontrar la información del equipo", "error");
        return;
    }
    
    // Filtrar las verificaciones de este equipo
    const verificacionesEquipo = verificaciones.filter(v => v.equipoId === equipoId);
    
    try {
        // Inicializar jsPDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        // Colores para el diseño
        const colorPrimario = [41, 128, 185]; // Azul profesional
        const colorSecundario = [52, 73, 94]; // Gris oscuro
        
        // Agregar encabezado con fecha y hora
        const fechaGeneracion = new Date().toLocaleString();
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generado: ${fechaGeneracion}`, 20, 10);
        
        // Título del documento con estilo
        doc.setFillColor(colorPrimario[0], colorPrimario[1], colorPrimario[2]);
        doc.rect(0, 15, 210, 15, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text("UMAE HE Puebla - INFORME DE EQUIPO MÉDICO", 105, 24, { align: "center" });
        
        // Información del equipo en un recuadro
        doc.setDrawColor(200, 200, 200);
        doc.setFillColor(245, 245, 245);
        doc.roundedRect(20, 40, 170, 50, 3, 3, 'FD');
        
        doc.setTextColor(colorSecundario[0], colorSecundario[1], colorSecundario[2]);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text("Datos Generales del Equipo", 30, 50);
        
        // Datos del equipo en dos columnas
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 60);
        
        let y1 = 58; // Primera columna
        let y2 = 58; // Segunda columna
        
        // Primera columna de datos
        doc.text(`ID/Serie: ${equipo.id || equipo.serie}`, 30, y1); y1 += 7;
        doc.text(`Nombre: ${acortarTextoLargo(equipo.nombre, 40)}`, 30, y1); y1 += 7;
        doc.text(`Marca: ${equipo.marca}`, 30, y1); y1 += 7;
        doc.text(`Modelo: ${equipo.modelo}`, 30, y1); y1 += 7;
        
        // Segunda columna de datos
        doc.text(`Categoría: ${formatearCategoria(equipo.categoria)}`, 110, y2); y2 += 7;
        doc.text(`Ubicación: ${equipo.ubicacion || "No especificada"}`, 110, y2); y2 += 7;
        doc.text(`Estado: ${equipo.estado}`, 110, y2); y2 += 7;
        
        // Sección de verificaciones con estilo
        y1 = Math.max(y1, y2) + 10;
        
        // Título de verificaciones
        doc.setFillColor(colorPrimario[0], colorPrimario[1], colorPrimario[2]);
        doc.rect(20, y1, 170, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text("HISTORIAL DE VERIFICACIONES", 105, y1 + 5.5, { align: "center" });
        
        y1 += 15;
        
        if (verificacionesEquipo.length > 0) {
            // Crear tabla de verificaciones con estilo mejorado
            doc.autoTable({
                startY: y1,
                head: [['Fecha', 'Responsable', 'Resultado', 'Observaciones']],
                body: verificacionesEquipo.map(v => [
                    new Date(v.fecha).toLocaleDateString(),
                    v.responsable,
                    v.resultado === 'conforme' ? '✓ Conforme' : 
                    v.resultado === 'observaciones' ? '⚠ Con observaciones' : 
                    v.resultado === 'no-conforme' ? '✗ No conforme' : v.resultado,
                    v.observaciones || "Sin observaciones"
                ]),
                theme: 'grid',
                headStyles: {
                    fillColor: colorSecundario,
                    textColor: [255, 255, 255],
                    fontStyle: 'bold',
                    lineWidth: 0.1,
                    lineColor: [220, 220, 220]
                },
                bodyStyles: {
                    textColor: [50, 50, 50],
                    lineWidth: 0.1,
                    lineColor: [220, 220, 220]
                },
                alternateRowStyles: {
                    fillColor: [240, 240, 240]
                },
                margin: { left: 20, right: 20 }
            });
        } else {
            doc.setTextColor(100, 100, 100);
            doc.setFontSize(10);
            doc.text("No hay verificaciones registradas para este equipo.", 105, y1 + 10, { align: "center" });
        }
        
        // Pie de página
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        for(let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.text(`Página ${i} de ${pageCount} - Centro Médico Nacional Manuel Ávila Camacho - Sistema de Gestión de Equipamiento Médico`, 105, 290, { align: "center" });
        }
        
        // En lugar de descargar automáticamente, mostrar en un modal para previsualizarlo
        mostrarPDFEnModal(doc, `Información del equipo ${equipo.nombre}`);
        
        mostrarMensaje(`PDF del equipo ${equipo.nombre} generado correctamente`, "success");
    } catch (error) {
        console.error('Error al generar PDF:', error);
        mostrarMensaje("Error al generar el PDF", "error");
    }
}

/**
 * Acorta un texto si es demasiado largo, añadiendo "..." al final
 * @param {string} texto - El texto a acortar
 * @param {number} longitud - La longitud máxima del texto (por defecto 30)
 * @returns {string} - El texto acortado o el texto original si no es necesario acortarlo
 */
function acortarTextoLargo(texto, longitud = 30) {
    if (texto && texto.length > longitud) {
        return texto.substring(0, longitud) + '...';
    }
    return texto;
}

/**
 * Genera un PDF desde el historial de verificaciones con diseño mejorado
 */
function generarPDFEquipoDesdeHistorial(equipoId) {
    console.log('Generando PDF del equipo desde historial...', equipoId);
    
    // Buscar el equipo en el array de equipos
    const equipo = equipos.find(eq => eq.id === equipoId || eq.serie === equipoId);
    if (!equipo) {
        mostrarMensaje("No se pudo encontrar la información del equipo", "error");
        return;
    }
    
    // Filtrar las verificaciones de este equipo
    const verificacionesEquipo = verificaciones.filter(v => v.equipoId === equipoId);
    
    try {
        // Inicializar jsPDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        // Colores para el diseño
        const colorPrimario = [41, 128, 185]; // Azul profesional
        const colorSecundario = [52, 73, 94]; // Gris oscuro
        
        // Agregar encabezado con fecha y hora
        const fechaGeneracion = new Date().toLocaleString();
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generado: ${fechaGeneracion}`, 20, 10);
        
        // Título del documento con estilo
        doc.setFillColor(colorPrimario[0], colorPrimario[1], colorPrimario[2]);
        doc.rect(0, 15, 210, 15, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text("UMAE HE Puebla - INFORME DE EQUIPO MÉDICO", 105, 24, { align: "center" });
        
        // Información del equipo en un recuadro
        doc.setDrawColor(200, 200, 200);
        doc.setFillColor(245, 245, 245);
        doc.roundedRect(20, 40, 170, 50, 3, 3, 'FD');
        
        doc.setTextColor(colorSecundario[0], colorSecundario[1], colorSecundario[2]);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text("Datos Generales del Equipo", 30, 50);
        
        // Datos del equipo en dos columnas
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 60);
        
        let y1 = 58; // Primera columna
        let y2 = 58; // Segunda columna
        
        // Primera columna de datos
        doc.text(`ID/Serie: ${equipo.id || equipo.serie}`, 30, y1); y1 += 7;
        doc.text(`Nombre: ${acortarTextoLargo(equipo.nombre, 40)}`, 30, y1); y1 += 7;
        doc.text(`Marca: ${equipo.marca}`, 30, y1); y1 += 7;
        doc.text(`Modelo: ${equipo.modelo}`, 30, y1); y1 += 7;
        
        // Segunda columna de datos
        doc.text(`Categoría: ${formatearCategoria(equipo.categoria)}`, 110, y2); y2 += 7;
        doc.text(`Ubicación: ${equipo.ubicacion || "No especificada"}`, 110, y2); y2 += 7;
        doc.text(`Estado: ${equipo.estado}`, 110, y2); y2 += 7;
        
        // Sección de verificaciones con estilo
        y1 = Math.max(y1, y2) + 10;
        
        // Título de verificaciones
        doc.setFillColor(colorPrimario[0], colorPrimario[1], colorPrimario[2]);
        doc.rect(20, y1, 170, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text("HISTORIAL DE VERIFICACIONES", 105, y1 + 5.5, { align: "center" });
        
        y1 += 15;
        
        if (verificacionesEquipo.length > 0) {
            // Crear tabla de verificaciones con estilo mejorado
            doc.autoTable({
                startY: y1,
                head: [['Fecha', 'Responsable', 'Resultado', 'Observaciones']],
                body: verificacionesEquipo.map(v => [
                    new Date(v.fecha).toLocaleDateString(),
                    v.responsable,
                    v.resultado === 'conforme' ? '✓ Conforme' : 
                    v.resultado === 'observaciones' ? '⚠ Con observaciones' : 
                    v.resultado === 'no-conforme' ? '✗ No conforme' : v.resultado,
                    v.observaciones || "Sin observaciones"
                ]),
                theme: 'grid',
                headStyles: {
                    fillColor: colorSecundario,
                    textColor: [255, 255, 255],
                    fontStyle: 'bold',
                    lineWidth: 0.1,
                    lineColor: [220, 220, 220]
                },
                bodyStyles: {
                    textColor: [50, 50, 50],
                    lineWidth: 0.1,
                    lineColor: [220, 220, 220]
                },
                alternateRowStyles: {
                    fillColor: [240, 240, 240]
                },
                margin: { left: 20, right: 20 }
            });
        } else {
            doc.setTextColor(100, 100, 100);
            doc.setFontSize(10);
            doc.text("No hay verificaciones registradas para este equipo.", 105, y1 + 10, { align: "center" });
        }
        
        // Pie de página
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        for(let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.text(`Página ${i} de ${pageCount} - Centro Médico Nacional Manuel Ávila Camacho - Sistema de Gestión de Equipamiento Médico`, 105, 290, { align: "center" });
        }
        
        // En lugar de descargar automáticamente, mostrar en un modal para previsualizarlo
        mostrarPDFEnModal(doc, `Información del equipo ${equipo.nombre}`);
        
        mostrarMensaje(`PDF del equipo ${equipo.nombre} generado correctamente`, "success");
    } catch (error) {
        console.error('Error al generar PDF:', error);
        mostrarMensaje("Error al generar el PDF", "error");
    }
}

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
        
        // Crear fila con botón de duplicación adicional
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${fecha}</td>
            <td title="${verificacion.nombreEquipo}">${acortarTextoLargo(verificacion.nombreEquipo, 25)}</td>
            <td>${verificacion.ubicacionEquipo}</td>
            <td>${verificacion.responsable}</td>
            <td class="${resultadoClase}">${resultadoTexto}</td>
            <td class="acciones-container">
                <div class="btn-acciones">
                    <button class="btn-ver-detalle" data-id="${verificacion.id}">👁️</button>
                    <button class="btn-pdf-verificacion" data-equipo="${verificacion.equipoId}">📄</button>
                    <button class="btn-duplicar-verificacion" data-id="${verificacion.id}">🔄</button>
                    <button class="btn-eliminar-verificacion" data-id="${verificacion.id}">🗑️</button>
                </div>
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

    // Configurar botones de eliminar verificación
document.querySelectorAll(".btn-eliminar-verificacion").forEach(btn => {
    btn.addEventListener("click", function() {
        const verificacionId = this.getAttribute("data-id");
        eliminarVerificacion(verificacionId);
    });
});
    
    // Configurar botones de generar PDF
    document.querySelectorAll(".btn-pdf-verificacion").forEach(btn => {
        btn.addEventListener("click", function() {
            const equipoId = this.getAttribute("data-equipo");
            generarPDFEquipoDesdeHistorial(equipoId);
        });
    });
    
    // Configurar botones de duplicar verificación
    document.querySelectorAll(".btn-duplicar-verificacion").forEach(btn => {
        btn.addEventListener("click", function() {
            const verificacionId = this.getAttribute("data-id");
            duplicarVerificacion(verificacionId);
        });
    });
    
    
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
            option.value = equipoVerificado.serie;
            option.textContent = `${equipoVerificado.nombre} (${equipoVerificado.serie})`;
            filtroEquipo.appendChild(option);
        }
    });
    
    console.log(`Filtro de equipos actualizado con ${equiposVerificados.size} equipos`);
}

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar módulo de verificación
    const interval = setInterval(function() {
        if (typeof equipos !== 'undefined' && Array.isArray(equipos)) {
            clearInterval(interval);
            clearTimeout(timeoutSecurity); // Añadir esta línea
            console.log('Equipos detectados, inicializando módulo de verificación...');
            inicializarModuloVerificacion();
        }
    }, 500);
    
    // Timeout de seguridad después de 10 segundos
    const timeoutSecurity = setTimeout(function() { // Almacenar la referencia
        clearInterval(interval);
        console.error('Timeout al esperar los equipos. Inicializando módulo de verificación sin equipos...');
        inicializarModuloVerificacion();
    }, 10000);
});

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
    document.getElementById("form-verificacion").reset();
    
    // Eliminar referencia al equipo seleccionado
    delete window.equipoSeleccionado;
    
    mostrarMensaje("Proceso de verificación cancelado", "info");
}

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
 * Guarda la verificación actual en el historial
 */
function guardarVerificacion() {
    console.log('Guardando verificación...');
    
    const selectorEquipo = document.getElementById("equipo-verificar");
    const responsableInput = document.getElementById("responsable-verificacion");
    const observacionesInput = document.getElementById("observaciones-verificacion");
    const resultadoSelect = document.getElementById("resultado-general");
    
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
    const observaciones = observacionesInput.value.trim();
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
    
    // Mostrar mensaje de éxito
    mostrarMensaje("Verificación guardada correctamente", "success");
    
    // Ocultar formulario de verificación
    cancelarVerificacion();
}

/**
 * Filtra el historial de verificaciones según los criterios seleccionados
 */
function filtrarHistorialVerificaciones() {
    console.log('Filtrando historial de verificaciones...');
    
    const fechaDesdeInput = document.getElementById("fecha-desde");
    const fechaHastaInput = document.getElementById("fecha-hasta");
    const equipoFiltro = document.getElementById("filtro-equipo");
    const resultadoFiltro = document.getElementById("filtro-resultado");
    
    // Obtener valores de los filtros
    const fechaDesde = fechaDesdeInput ? fechaDesdeInput.value : '';
    const fechaHasta = fechaHastaInput ? fechaHastaInput.value : '';
    const equipoSeleccionado = equipoFiltro ? equipoFiltro.value : '';
    const resultadoSeleccionado = resultadoFiltro ? resultadoFiltro.value : '';
    
    // Filtrar verificaciones
    const verificacionesFiltradas = verificaciones.filter(v => {
        return (!fechaDesde || new Date(v.fecha) >= new Date(fechaDesde)) &&
               (!fechaHasta || new Date(v.fecha) <= new Date(fechaHasta)) &&
               (!equipoSeleccionado || v.equipoId === equipoSeleccionado) &&
               (!resultadoSeleccionado || v.resultado === resultadoSeleccionado);
    });
    
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
    
    // Resetear los valores de los filtros
    const fechaDesdeInput = document.getElementById("fecha-desde");
    const fechaHastaInput = document.getElementById("fecha-hasta");
    const equipoFiltro = document.getElementById("filtro-equipo");
    const resultadoFiltro = document.getElementById("filtro-resultado");
    
    // Limpiar los campos de filtro
    if (fechaDesdeInput) fechaDesdeInput.value = '';
    if (fechaHastaInput) fechaHastaInput.value = '';
    if (equipoFiltro) equipoFiltro.selectedIndex = 0;
    if (resultadoFiltro) resultadoFiltro.selectedIndex = 0;
    
    // Actualizar la tabla con todas las verificaciones
    actualizarTablaVerificaciones();
    
    mostrarMensaje("Filtros eliminados. Mostrando todas las verificaciones.", "info");
}

// ===== FUNCIONES UTILITARIAS =====

/**
 * Muestra un mensaje en la interfaz (puede ser un toast, alerta, etc.)
 * @param {string} mensaje - El mensaje a mostrar
 * @param {string} tipo - Tipo de mensaje ('success', 'error', 'info', 'warning')
 */
function mostrarMensaje(mensaje, tipo) {
    console.log(`[${tipo.toUpperCase()}] ${mensaje}`);
    
    // Aquí se puede implementar una mejor interfaz de mensajes
    alert(mensaje);
}

/**
 * Formatea el nombre de una categoría para mostrarla
 */
function formatearCategoria(categoria) {
    const categorias = {
        'alta-tecnologia': 'Alta Tecnología',
        'soporte-vida': 'Soporte de Vida',
        'critico': 'Equipo Crítico',
        'general': 'Equipamiento General'
    };
    
    return categorias[categoria] || categoria;
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