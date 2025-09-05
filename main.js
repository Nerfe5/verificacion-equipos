// ========== Variables Globales ==========
let modalOverlay = null;
let modalTitle = null;
let modalBody = null;
let btnCancelarModal = null;
let form = null;
let formOriginalContainer = null;
let tabla = null;
let keyHint = null;
let mensajesDiv = null;

// Array para almacenar los equipos
let equipos = [];

// Función para cerrar el modal
function cerrarModal() {
    console.log('Cerrando modal...');
    
    const modalOverlay = document.getElementById('modal-form');
    const keyHint = document.getElementById('key-hint');
    const form = document.getElementById('form-equipo-modal') || document.getElementById('form-equipo');
    
    // Limpiar el formulario si existe
    if (form) {
        form.reset();
        form.dataset.editando = '';
        form.dataset.modo = '';
    }
    
    // Cerrar el modal
    if (modalOverlay) modalOverlay.classList.remove('active');
    
    // Ocultar el hint de ESC
    if (keyHint) keyHint.classList.remove('show');
    
    console.log('Modal cerrado exitosamente');
    
    // Actualizar la tabla
    mostrarEquiposEnTabla();
}

// ========== Funciones de Inicialización y Configuración ==========
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM cargado, iniciando configuración...');
    
    try {
        // Inicializar elementos DOM básicos
        if (!inicializarElementosDOM()) {
            throw new Error('No se pudo inicializar la aplicación correctamente');
        }

        // MODIFICACIÓN: Usar la función mejorada en lugar de configurarEventosModal()
        configurarEventosModalMejorado();
        
        // Cargar equipos primero para tener los datos disponibles
        await cargarEquiposGuardados();
        console.log('Equipos cargados:', equipos.length);
        
        // Actualizar distribución de categorías inicial
        actualizarDistribucionCategorias();
        
        // Actualizar contador inicial
        actualizarContadores(equipos.length, equipos.length);

        // Configurar componentes de la interfaz
        configurarFormulario();
        inicializarFiltros();
        configurarBotonesExportacion();

        // Mostrar estado inicial
        actualizarInterfaz();
        console.log('Inicialización completada con éxito');
    } catch (error) {
        console.error('Error durante la inicialización:', error);
        mostrarMensaje('Error al inicializar la aplicación', 'error');
    }
    
    // Configurar el botón para mostrar/ocultar el formulario
    const btnToggleForm = document.getElementById('btn-toggle-form');
    if (btnToggleForm) {
        btnToggleForm.addEventListener('click', toggleFormularioRegistro);
    }
     setTimeout(() => {
        console.log("Forzando actualización de la tabla...");
        actualizarTablaEquipos();
    }, 500);
});

// ========== Funciones de Filtrado y Actualización de Interfaz ==========
function filtrarEquipos() {
    console.log('Iniciando filtrado de equipos...');
    
    if (!Array.isArray(equipos)) {
        console.error('Error: La variable equipos no es un array');
        return;
    }
    
    // Obtener valores de los filtros
    const textoBusqueda = document.getElementById('buscar-texto')?.value?.toLowerCase().trim() || '';
    const estadoFiltro = document.getElementById('filtro-estado')?.value || '';
    const categoriaFiltro = document.getElementById('filtro-categoria')?.value || '';
    const garantiaFiltro = document.getElementById('filtro-garantia')?.value || '';
    
    // Actualizar contador total primero
    actualizarContadores(equipos.length, equipos.length);
    
    console.log('Aplicando filtros:', {
        textoBusqueda,
        estadoFiltro,
        categoriaFiltro,
        garantiaFiltro,
        totalEquipos: equipos.length
    });
    
    const hoy = new Date();
    const seisMeses = new Date();
    seisMeses.setMonth(hoy.getMonth() + 6);

    const equiposFiltrados = equipos.filter(equipo => {
        if (!equipo) return false;

        try {
            // Filtro de garantía
            if (garantiaFiltro) {
                const fechaGarantia = equipo.fechaGarantia ? new Date(equipo.fechaGarantia) : null;
                
                switch (garantiaFiltro) {
                    case 'vigente':
                        if (!fechaGarantia || fechaGarantia <= hoy) return false;
                        break;
                    case 'por-vencer':
                        if (!fechaGarantia || fechaGarantia <= hoy || fechaGarantia > seisMeses) return false;
                        break;
                    case 'vencida':
                        if (!fechaGarantia || fechaGarantia > hoy) return false;
                        break;
                    case 'contrato-consolidado':
                        if (!equipo.elegibleContratoConsolidado) return false;
                        break;
                    case 'baja':
                        if (equipo.estado !== 'baja') return false;
                        break;
                    case 'sin-garantia':
                        if (equipo.fechaGarantia) return false;
                        break;
                }
            }

            // Búsqueda por texto (nombre, marca, serie, ubicación)
            const camposBusqueda = [
                equipo.nombre,
                equipo.marca,
                equipo.serie,
                equipo.ubicacion,
                equipo.modelo,
                equipo.responsable,
                equipo.departamento
            ];
            
            const coincideTexto = textoBusqueda === '' || 
                camposBusqueda.some(campo => 
                    campo?.toString().toLowerCase().includes(textoBusqueda)
                );

            // Filtro por estado
            const coincideEstado = !estadoFiltro || equipo.estado === estadoFiltro;

            // Filtro por categoría
            const coincideCategoria = !categoriaFiltro || equipo.categoria === categoriaFiltro;

            // Filtro por garantía
            let coincideGarantia = true;
            if (garantiaFiltro) {
                const fechaGarantia = equipo.fechaGarantia ? new Date(equipo.fechaGarantia) : null;
                
                switch (garantiaFiltro) {
                    case 'vigente':
                        coincideGarantia = fechaGarantia && fechaGarantia > hoy;
                        break;
                    case 'por-vencer':
                        coincideGarantia = fechaGarantia && fechaGarantia > hoy && fechaGarantia <= seisMeses;
                        break;
                    case 'vencida':
                        coincideGarantia = fechaGarantia && fechaGarantia <= hoy;
                        break;
                    case 'contrato-consolidado':
                        coincideGarantia = equipo.elegibleContratoConsolidado === true;
                        break;
                    case 'baja':
                        coincideGarantia = equipo.estado === 'baja';
                        break;
                    case 'sin-garantia':
                        coincideGarantia = !equipo.fechaGarantia;
                        break;
                }
            }

            return coincideTexto && coincideEstado && coincideCategoria && coincideGarantia;
        } catch (error) {
            console.error('Error al filtrar equipo:', error, equipo);
            return false;
        }
    });

    console.log(`Filtrado completado. Resultados: ${equiposFiltrados.length} de ${equipos.length}`);
    
    // Actualizar toda la interfaz con los resultados del filtrado
    actualizarContadores(equipos.length, equiposFiltrados.length);
    mostrarEquiposEnTabla(equiposFiltrados);
    actualizarDistribucionCategorias(equiposFiltrados);
}

// Función para actualizar la interfaz y las estadísticas
function actualizarInterfaz(equiposFiltrados = null) {
    console.log('Actualizando interfaz completa...');
    mostrarEquiposEnTabla(equiposFiltrados);
    actualizarEstadisticas(equiposFiltrados);
    actualizarDistribucionCategorias(equiposFiltrados);
    actualizarAlertasGarantias(); // Siempre actualizar con todos los equipos
}

// Función para actualizar estadísticas
function actualizarEstadisticas(equiposFiltrados = null) {
    console.log('Actualizando estadísticas...');
    
    const equiposAContar = equiposFiltrados || equipos;
    
    // Contadores para diferentes estados
    const stats = {
        total: equiposAContar.length,
        operativos: 0,
        mantenimiento: 0,
        fueraServicio: 0,
        calibracion: 0
    };

    // Contar equipos por estado
    equiposAContar.forEach(equipo => {
        if (!equipo) return;
        
        switch(equipo.estado) {
            case 'operativo':
                stats.operativos++;
                break;
            case 'mantenimiento':
                stats.mantenimiento++;
                break;
            case 'fuera-servicio':
                stats.fueraServicio++;
                break;
            case 'en-calibracion':
                stats.calibracion++;
                break;
        }
    });

    // Actualizar elementos en el DOM
    document.getElementById('total-equipos').textContent = stats.total;
    document.getElementById('equipos-operativos').textContent = stats.operativos;
    document.getElementById('equipos-mantenimiento').textContent = stats.mantenimiento;
    document.getElementById('equipos-fuera-servicio').textContent = stats.fueraServicio;

    console.log('Estadísticas actualizadas:', stats);
}

// Función para actualizar los contadores en el panel de filtros
function actualizarContadores(totalEquipos, equiposFiltrados) {
    // Actualizar contador total
    const contadorTotal = document.getElementById('contador-equipos');
    if (contadorTotal) {
        contadorTotal.textContent = `Total: ${totalEquipos} equipos`;
    }

    // Actualizar contador de filtrados
    const contadorFiltrados = document.getElementById('contador-filtrados');
    if (contadorFiltrados) {
        if (equiposFiltrados === totalEquipos) {
            contadorFiltrados.textContent = '';
        } else {
            contadorFiltrados.textContent = `Filtrados: ${equiposFiltrados}`;
        }
    }
}

// Función para actualizar la distribución por categorías
function actualizarDistribucionCategorias(equiposFiltrados = null) {
    console.log('Actualizando distribución por categorías...');
    
    if (!Array.isArray(equipos)) {
        console.error('Error: No hay equipos para contar');
        return;
    }
    
    const equiposAContar = equiposFiltrados || equipos;
    const totalEquipos = equiposAContar.length;
    
    // Objeto para almacenar conteos por categoría
    const categorias = {
        'alta-tecnologia': 0,
        'soporte-vida': 0,
        'critico': 0,
        'general': 0
    };
    
    // Contar equipos por categoría
    equiposAContar.forEach(equipo => {
        if (equipo && equipo.categoria && categorias.hasOwnProperty(equipo.categoria)) {
            categorias[equipo.categoria]++;
        }
    });
    
    // Actualizar contadores y barras de progreso
    Object.keys(categorias).forEach(categoria => {
        // Actualizar contador
        const countElement = document.getElementById(`count-${categoria}`);
        if (countElement) {
            countElement.textContent = categorias[categoria];
        }
        
        // Actualizar barra de progreso
        const barElement = document.getElementById(`bar-${categoria}`);
        if (barElement) {
            const porcentaje = totalEquipos > 0 ? (categorias[categoria] / totalEquipos) * 100 : 0;
            barElement.style.width = `${porcentaje}%`;
            // Añadir tooltip con el porcentaje
            barElement.title = `${porcentaje.toFixed(1)}%`;
        }
    });
    
    console.log('Distribución actualizada:', categorias);
}

// Función para obtener el motivo por el que un equipo es crítico
function obtenerMotivoCritico(equipo, fechaGarantia) {
    const hoy = new Date();
    
    if (equipo.categoria === 'critico' && equipo.estado !== 'operativo') {
        return 'Equipo crítico no operativo';
    }
    if (equipo.categoria === 'soporte-vida' && ['mantenimiento', 'fuera-servicio'].includes(equipo.estado)) {
        return 'Equipo de soporte vital no disponible';
    }
    if (equipo.categoria === 'alta-tecnologia' && fechaGarantia < hoy) {
        return 'Equipo de alta tecnología con garantía vencida';
    }
    if (equipo.estado === 'fuera-servicio' && equipo.ultimaActualizacion) {
        const diasFueraServicio = Math.floor((hoy - new Date(equipo.ultimaActualizacion)) / (1000 * 60 * 60 * 24));
        return `Fuera de servicio por ${diasFueraServicio} días`;
    }
    return 'Requiere atención';
}

// Función para actualizar las alertas de garantías y contratos
function actualizarAlertasGarantias() {
    console.log('Actualizando alertas de garantías y contratos...');
    
    const hoy = new Date();
    const seisMeses = new Date();
    seisMeses.setMonth(seisMeses.getMonth() + 6);
    
    // Contadores
    let garantiasVigentes = 0;
    let garantiasVencidas = 0;
    let garantiasPorVencer = 0;
    let equiposBaja = 0;
    let gestionContratoConsolidado = 0;
    
    console.log('=== INICIO DE VERIFICACIÓN DE GARANTÍAS ===');
    console.log(`Fecha actual: ${hoy.toLocaleDateString()}`);
    console.log(`Fecha límite 6 meses: ${seisMeses.toLocaleDateString()}\n`);
    
    equipos.forEach(equipo => {
        if (!equipo.fechaGarantia) {
            console.log(`⚠️ Equipo sin fecha de garantía: ${equipo.serie || 'Sin serie'}`);
            return;
        }
        
        const fechaGarantia = new Date(equipo.fechaGarantia);
        console.log(`\n📋 EQUIPO: ${equipo.serie}`);
        console.log(`   Nombre: ${equipo.nombre}`);
        console.log(`   Fecha de garantía: ${fechaGarantia.toLocaleDateString()}`);
        console.log(`   Estado: ${equipo.estado}`);
        console.log(`   Elegible para contrato: ${equipo.elegibleContratoConsolidado ? 'Sí' : 'No'}`);
        
        const diasHastaVencimiento = Math.floor((fechaGarantia - hoy) / (1000 * 60 * 60 * 24));
        console.log(`   Días hasta/desde vencimiento: ${diasHastaVencimiento}`);
        
        // Verificar garantías vencidas y gestión de contrato consolidado
        if (fechaGarantia < hoy) {
            console.log('   ⛔ GARANTÍA VENCIDA');
            // Contar todas las garantías vencidas
            garantiasVencidas++;
            console.log('   ➡️ Contado como: Garantía Vencida');
            
            // Adicionalmente, si es elegible para contrato consolidado
            if (equipo.elegibleContratoConsolidado) {
                gestionContratoConsolidado++;
                console.log('   ➡️ También contado como: Gestión de Contrato Consolidado');
            }
        }
        // Verificar garantías por vencer en los próximos 6 meses
        else if (fechaGarantia <= seisMeses) {
            console.log('   ⚠️ GARANTÍA POR VENCER');
            if (equipo.elegibleContratoConsolidado) {
                gestionContratoConsolidado++;
                console.log('   ➡️ Contado como: Gestión de Contrato Consolidado');
            }
            garantiasPorVencer++;
            garantiasVigentes; // Todavía tiene garantía vigente
            console.log('   ➡️ Contado como: Por Vencer y Vigente');
        } else {
            // Si la fecha de garantía es posterior a 6 meses, está vigente
            garantiasVigentes++;
            console.log('   ✅ GARANTÍA VIGENTE');
            console.log('   ➡️ Contado como: Vigente');
        }
        
        // Contar equipos dados de baja
        if (equipo.estado === 'baja') {
            equiposBaja++;
        }
    });
    
    // Actualizar números en las tarjetas de alerta
    document.getElementById('garantias-vigentes').textContent = garantiasVigentes;
    document.getElementById('garantias-vencidas').textContent = garantiasVencidas;
    document.getElementById('garantias-por-vencer').textContent = garantiasPorVencer;
    document.getElementById('gestion-contrato-consolidado').textContent = gestionContratoConsolidado;
    document.getElementById('equipos-baja').textContent = equiposBaja;
    
    // Actualizar etiqueta para mostrar "6 meses" en lugar de "30 días"
    const alertLabel = document.querySelector('.alert-card.garantia-por-vencer .alert-label');
    if (alertLabel) {
        alertLabel.textContent = 'Por Vencer (6 meses)';
    }
    
    console.log('\n=== RESUMEN FINAL ===');
    console.log(`✅ Garantías Vigentes: ${garantiasVigentes}`);
    console.log(`⛔ Garantías Vencidas: ${garantiasVencidas}`);
    console.log(`⚠️ Garantías por Vencer: ${garantiasPorVencer}`);
    console.log(`📋 Gestión Contrato Consolidado: ${gestionContratoConsolidado}`);
    console.log(`📤 Equipos dados de Baja: ${equiposBaja}`);
}


// ========== Función para Mostrar Equipos en Tabla ==========
function mostrarEquiposEnTabla(equiposMostrar = null) {
    console.log('Intentando mostrar equipos en tabla...');
    
    try {
        // Verificar si la tabla existe
        if (!tabla) {
            throw new Error('No se encontró la tabla');
        }

        // Verificar que equipos sea un array válido
        if (!Array.isArray(equipos)) {
            console.error('Error: equipos no es un array');
            equipos = [];
        }

        console.log('Total de equipos disponibles:', equipos.length);
        
        // Limpiar la tabla
        tabla.innerHTML = '';

        // Mostrar mensaje si no hay equipos
        if (equipos.length === 0) {
            console.log('No hay equipos para mostrar');
            tabla.innerHTML = `
                <tr>
                    <td colspan="11" class="text-center">No hay equipos registrados</td>
                </tr>
            `;
            return;
        }

        // Usar los equipos filtrados si se proporcionan, de lo contrario usar todos los equipos
        const equiposAMostrar = equiposMostrar || equipos;
        console.log(`Mostrando ${equiposAMostrar.length} equipos en la tabla`);
        
        // Mostrar los equipos
        equiposAMostrar.forEach((equipo, index) => {
            if (!equipo) {
                console.warn(`Equipo ${index} es inválido:`, equipo);
                return;
            }

            console.log(`Procesando equipo ${index + 1}/${equiposAMostrar.length}:`, equipo.serie);
            const tr = document.createElement('tr');
            
            // Formatear la categoría para mostrar el texto amigable
            const categoriaTexto = {
                'alta-tecnologia': 'Alta Tecnología',
                'soporte-vida': 'Soporte de Vida',
                'critico': 'Crítico',
                'general': 'General'
            }[equipo.categoria] || equipo.categoria;
            
            // Formatear el estado para mostrar el texto amigable
            const estadoTexto = {
                'operativo': 'Operativo',
                'mantenimiento': 'En Mantenimiento',
                'fuera-servicio': 'Fuera de Servicio',
                'en-calibracion': 'En Calibración'
            }[equipo.estado] || equipo.estado;

            tr.innerHTML = `
                <td>${equipo.serie || '-'}</td>
                <td>${equipo.nombre || '-'}</td>
                <td>${equipo.marca || '-'} ${equipo.modelo || '-'}</td>
                <td>${equipo.ubicacion || '-'}</td>
                <td><span class="estado ${(equipo.estado || '').toLowerCase()}">${estadoTexto}</span></td>
                <td>${categoriaTexto || '-'}</td>
                <td>${equipo.responsable || '-'}</td>
                <td>${equipo.proveedor || '-'}</td>
                <td>${equipo.fechaGarantia ? new Date(equipo.fechaGarantia).toLocaleDateString('es-MX') : 'No especificada'}</td>
                <td>${equipo.imagen ? '✓' : '-'}</td>
                <td>
                    <div class="acciones-container">
                        <button onclick="editarEquipo('${equipo.serie}')" class="btn-accion editar" title="Editar">✏️</button>
                        <button onclick="clonarEquipo('${equipo.serie}')" class="btn-accion clonar" title="Clonar">📋</button>
                        <button onclick="eliminarEquipo('${equipo.serie}')" class="btn-accion eliminar" title="Eliminar">🗑️</button>
                    </div>
                </td>
            `;
            tabla.appendChild(tr);
        });

        console.log('Tabla actualizada exitosamente');
    } catch (error) {
        console.error('Error al mostrar equipos en tabla:', error);
        mostrarMensaje('Error al mostrar los equipos', 'error');
    }
}

// ========== Funciones de Manejo de Mensajes y Elementos DOM ==========
function mostrarMensaje(mensaje, tipo = 'info') {
    console.log(`${tipo.toUpperCase()}: ${mensaje}`);
    
    try {
        // Si no existe el div de mensajes, lo creamos
        if (!mensajesDiv) {
            mensajesDiv = document.createElement('div');
            mensajesDiv.id = 'mensajes';
            mensajesDiv.className = 'mensajes';
            const container = document.querySelector('.container');
            if (container) {
                container.insertBefore(mensajesDiv, container.firstChild);
            } else {
                document.body.insertBefore(mensajesDiv, document.body.firstChild);
            }
        }

        const mensajeElement = document.createElement('div');
        mensajeElement.className = `mensaje ${tipo}`;
        mensajeElement.textContent = mensaje;

        mensajesDiv.appendChild(mensajeElement);

        // Eliminar el mensaje después de 5 segundos
        setTimeout(() => {
            if (mensajeElement.parentNode === mensajesDiv) {
                mensajeElement.remove();
            }
        }, 5000);
    } catch (error) {
        console.error('Error al mostrar mensaje:', error);
        alert(mensaje);
    }
}

// Función para inicializar elementos DOM
function inicializarElementosDOM() {
    try {
        console.log('Inicializando elementos DOM...');
        
        // Verificar primero la existencia de cada elemento
        modalOverlay = document.getElementById('modal-form');
        modalTitle = modalOverlay?.querySelector('.modal-title');
        modalBody = modalOverlay?.querySelector('.modal-body');
        btnCancelarModal = document.getElementById('btn-cancelar-modal');
        form = document.getElementById('form-equipo');
        tabla = document.getElementById('tabla-equipos')?.querySelector('tbody');
        formOriginalContainer = form?.parentElement;
        keyHint = document.getElementById('key-hint');
        
        // Lista de elementos críticos que realmente necesitamos
        const elementosCriticos = [
            { nombre: 'form', elemento: form },
            { nombre: 'tabla', elemento: tabla }
        ];
        
        // Verificar solo elementos críticos
        const faltantes = elementosCriticos
            .filter(e => !e.elemento)
            .map(e => e.nombre);
            
        if (faltantes.length > 0) {
            console.warn(`Elementos críticos faltantes: ${faltantes.join(', ')}`);
            // No fallar por elementos no críticos
            if (faltantes.includes('form') || faltantes.includes('tabla')) {
                throw new Error(`No se encontraron elementos críticos: ${faltantes.join(', ')}`);
            }
        }

        console.log('Elementos DOM críticos inicializados correctamente');
        return true;
    } catch (error) {
        console.error('Error al inicializar elementos DOM:', error);
        mostrarMensaje('Error: No se pudieron inicializar todos los elementos necesarios', 'error');
        return false;
    }
}

// Función mejorada para configurar eventos del modal
function configurarEventosModalMejorado() {
    console.log('Inicializando eventos del modal mejorado...');
    
    const modalOverlay = document.getElementById('modal-form');
    const btnCancelarModal = document.getElementById('btn-cancelar-modal');
    const keyHint = document.getElementById('key-hint');
    
    if (!modalOverlay) {
        console.warn('No se encontró el modal overlay');
        return;
    }
    
    // Configurar botón de cerrar
    if (btnCancelarModal) {
        console.log('Configurando botón cerrar modal');
        btnCancelarModal.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            cerrarModal();
        });
    }
    
    // Cerrar modal al hacer clic fuera de él
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            cerrarModal();
        }
    });
    
    // Cerrar con tecla ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
            cerrarModal();
        }
    });
    
    console.log('Eventos del modal configurados correctamente');
}

// Función para manejar el envío del formulario modal
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('modal-form');
    
    // Configurar botón de cerrar modal
    const btnCancelarModal = document.getElementById('btn-cancelar-modal');
    if (btnCancelarModal) {
        btnCancelarModal.addEventListener('click', cerrarModal);
    }
    
    // Evento para cerrar con tecla ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            cerrarModal();
        }
    });
    
    // Cerrar al hacer clic fuera del modal
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            cerrarModal();
        }
    });
});

// Configurar eventos del modal
function configurarEventosModal() {
    if (!btnCancelarModal) return;
    
    console.log('Configurando evento del botón cancelar');
    btnCancelarModal.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Botón cancelar clickeado');
        cerrarModal();
    });

    // Agregar evento para cerrar con Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalOverlay?.classList.contains('active')) {
            cerrarModal();
        }
    });
}

// Función para configurar el formulario principal
function configurarFormulario() {
    console.log('Configurando formulario principal...');
    
    if (!form) {
        console.error('No se encontró el formulario');
        return;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('Formulario enviado. Modo:', form.dataset.modo);
        
        try {
            const serieEdicion = form.dataset.editando;
            
            if (serieEdicion) {
                console.log('Modo edición detectado para serie:', serieEdicion);
                await actualizarEquipo(serieEdicion);
            } else {
                console.log('Modo registro nuevo detectado');
                await registrarEquipo(form);
            }
        } catch (error) {
            console.error('Error al procesar el formulario:', error);
            mostrarMensaje('Error al procesar el formulario', 'error');
        }
    });

    console.log('Formulario principal configurado exitosamente');
}

// Función para registrar un nuevo equipo
async function registrarEquipo(formElement = null) {
    console.log('Iniciando registro de equipo...');
    
    try {
        // Obtener los valores del formulario
        const equipo = obtenerDatosFormulario(formElement);
        
        if (!equipo) {
            throw new Error('Error al obtener datos del formulario');
        }

        // Validar datos básicos
        if (!validarDatosBasicos(equipo)) {
            return;
        }

        // Verificar si ya existe un equipo con el mismo número de serie
        if (equipos.some(e => e.serie === equipo.serie)) {
            mostrarMensaje('Ya existe un equipo con ese número de serie', 'error');
            return;
        }

        // Guardar el equipo
        equipos.push(equipo);
        const guardadoExitoso = await guardarEnLocalStorage();
        
        if (!guardadoExitoso) {
            throw new Error('Error al guardar en localStorage');
        }
        
        // Limpiar formulario y mostrar mensaje de éxito
        if (formElement) {
            formElement.reset();
        }
        
        mostrarMensaje('Equipo registrado exitosamente', 'success');
        
        // Cerrar el modal si estamos en uno
        if (modalOverlay?.classList.contains('active')) {
            cerrarModal();
        }
        
        // Actualizar la interfaz y distribución por categorías
        actualizarInterfaz();
        
        console.log('Equipo registrado con éxito:', equipo);
    } catch (error) {
        console.error('Error al registrar equipo:', error);
        mostrarMensaje('Error al registrar el equipo', 'error');
    }
}

// Función para actualizar un equipo existente
async function actualizarEquipo(serie) {
    console.log('Actualizando equipo con serie:', serie);
    
    try {
        // Obtener los valores del formulario
        const formModal = document.getElementById('form-equipo-modal') || form;
        const datosActualizados = obtenerDatosFormulario(formModal);
        
        if (!datosActualizados) {
            throw new Error('Error al obtener datos del formulario');
        }
        
        // Validar datos básicos
        if (!validarDatosBasicos(datosActualizados)) {
            return;
        }
        
        // Si se cambió la serie, verificar que no exista otra igual
        if (serie !== datosActualizados.serie) {
            const existeOtroConMismaSerie = equipos.some(e => e.serie === datosActualizados.serie);
            if (existeOtroConMismaSerie) {
                mostrarMensaje('Ya existe otro equipo con ese número de serie', 'error');
                return;
            }
        }
        
        // Buscar el equipo por serie y actualizarlo
        const indice = equipos.findIndex(e => e.serie === serie);
        if (indice === -1) {
            throw new Error('Equipo no encontrado');
        }
        
        // Registrar fecha de actualización
        datosActualizados.ultimaActualizacion = new Date().toISOString();
        
        // Actualizar equipo
        equipos[indice] = datosActualizados;
        
        // Guardar cambios
        const guardadoExitoso = await guardarEnLocalStorage();
        if (!guardadoExitoso) {
            throw new Error('Error al guardar en localStorage');
        }
        
        // Mensaje de éxito y actualizar interfaz
        mostrarMensaje('Equipo actualizado exitosamente', 'success');
        
        // Cerrar el modal si estamos en uno
        if (modalOverlay?.classList.contains('active')) {
            cerrarModal();
        }
        
        // Actualizar interfaz
        actualizarInterfaz();
        
        console.log('Equipo actualizado con éxito:', datosActualizados);
        return true;
    } catch (error) {
        console.error('Error al actualizar equipo:', error);
        mostrarMensaje('Error al actualizar el equipo', 'error');
        return false;
    }
}

// Función para configurar los filtros y sus event listeners
function inicializarFiltros() {
    console.log('Inicializando filtros y búsqueda...');
    
    // Búsqueda con debounce para mejor rendimiento
    let timeoutId;
    const inputBusqueda = document.getElementById('buscar-texto');
    if (inputBusqueda) {
        console.log('Configurando evento de búsqueda...');
        inputBusqueda.addEventListener('input', () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(filtrarEquipos, 300);
        });
    } else {
        console.warn('No se encontró el campo de búsqueda');
    }

    // Filtros de selección
    ['filtro-estado', 'filtro-categoria', 'filtro-garantia'].forEach(id => {
        const filtro = document.getElementById(id);
        if (filtro) {
            console.log(`Configurando filtro: ${id}`);
            filtro.addEventListener('change', filtrarEquipos);
        } else {
            console.warn(`No se encontró el filtro: ${id}`);
        }
    });

    // Botón limpiar filtros
    const btnLimpiar = document.querySelector('.btn-limpiar'); // Usar selector de clase en lugar de ID
    if (btnLimpiar) {
        console.log('Configurando botón limpiar filtros...');
        btnLimpiar.addEventListener('click', () => {
            console.log('Limpiando filtros...');
            if (inputBusqueda) inputBusqueda.value = '';
            ['filtro-estado', 'filtro-categoria', 'filtro-garantia'].forEach(id => {
                const elemento = document.getElementById(id);
                if (elemento) elemento.value = '';
            });
            filtrarEquipos();
            mostrarMensaje('Filtros limpiados correctamente', 'success');
        });
    } else {
        console.warn('No se encontró el botón de limpiar filtros');
    }
    
    console.log('Inicialización de filtros completada');
}

// ========== Funciones de Exportación e Importación ==========
function exportarCSV() {
    const equiposFiltrados = equipos.filter(equipo => {
        // Aplicar los mismos filtros actuales para exportar solo los equipos filtrados
        const textoBusqueda = document.getElementById('buscar-texto').value.toLowerCase();
        const estadoFiltro = document.getElementById('filtro-estado').value;
        const categoriaFiltro = document.getElementById('filtro-categoria').value;
        const garantiaFiltro = document.getElementById('filtro-garantia').value;

        // Aplicar la misma lógica de filtrado que en filtrarEquipos()
        // ... (mismo código de filtrado)
        return true; // Temporalmente retornamos todos hasta implementar los filtros
    });

    // Crear contenido CSV
    const headers = ['Serie', 'Nombre', 'Marca', 'Modelo', 'Categoría', 'Estado', 'Ubicación', 'Garantía'];
    let csvContent = headers.join(',') + '\n';

    equiposFiltrados.forEach(equipo => {
        const row = [
            equipo.serie,
            equipo.nombre,
            equipo.marca,
            equipo.modelo,
            equipo.categoria,
            equipo.estado,
            equipo.ubicacion,
            equipo.garantia
        ].map(cell => `"${cell || ''}"`).join(',');
        csvContent += row + '\n';
    });

    // Crear y descargar el archivo CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'equipos_medicos.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Función mejorada para exportar a CSV
function exportarCSVMejorado() {
    console.log('🚀 Iniciando exportación a CSV...');
    
    try {
        // Obtener equipos a exportar (todos o filtrados según el estado actual)
        const hayFiltrosActivos = document.querySelector('#filtro-estado, #filtro-categoria, #filtro-garantia, #buscar-texto[value]');
        const equiposAExportar = hayFiltrosActivos ? obtenerEquiposFiltrados() : equipos;
        
        if (!equiposAExportar || equiposAExportar.length === 0) {
            mostrarMensaje('No hay equipos para exportar', 'warning');
            return;
        }
        
        console.log(`📊 Exportando ${equiposAExportar.length} equipos...`);
        
        // Crear contenido CSV básico para pruebas
        let csvContent = "Serie,Nombre,Marca,Modelo,Categoria,Estado,Ubicacion,FechaGarantia\n";
        
        equiposAExportar.forEach(equipo => {
            if (!equipo) return;
            
            const row = [
                `"${(equipo.serie || '').replace(/"/g, '""')}"`,
                `"${(equipo.nombre || '').replace(/"/g, '""')}"`,
                `"${(equipo.marca || '').replace(/"/g, '""')}"`,
                `"${(equipo.modelo || '').replace(/"/g, '""')}"`,
                `"${(equipo.categoria || '').replace(/"/g, '""')}"`,
                `"${(equipo.estado || '').replace(/"/g, '""')}"`,
                `"${(equipo.ubicacion || '').replace(/"/g, '""')}"`,
                `"${(equipo.fechaGarantia || '').replace(/"/g, '""')}"`
            ].join(',');
            
            csvContent += row + "\n";
        });
        
        console.log('📝 Contenido CSV generado, creando archivo...');
        
        // Crear y descargar el archivo
        const blob = new Blob([csvContent], {type: 'text/csv;charset=utf-8;'});
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "equipos_medicos.csv");
        document.body.appendChild(link);
        
        console.log('🔽 Iniciando descarga...');
        link.click();
        
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        console.log('✅ Exportación completada con éxito');
        mostrarMensaje(`Exportados ${equiposAExportar.length} equipos a CSV`, 'success');
    } catch (error) {
        console.error('❌ Error durante la exportación:', error);
        mostrarMensaje('Error al exportar: ' + error.message, 'error');
    }
}

// Función para configurar los botones de exportación CSV
function configurarBotonesExportacion() {
    console.log('🔄 Configurando botones de exportación CSV...');
    
    // Identificar todos los posibles botones de exportación
    const botones = [
        document.getElementById('exportar-verificaciones'),
        document.querySelector('.filtros-botones-container .btn-exportar'),
        ...Array.from(document.querySelectorAll('button.btn-exportar')),
        ...Array.from(document.querySelectorAll('button')).filter(btn => 
            btn.textContent.toLowerCase().includes('exportar') || 
            btn.textContent.includes('CSV'))
    ].filter((btn, index, self) => 
        // Eliminar duplicados y valores nulos
        btn && self.indexOf(btn) === index
    );
    
    if (botones.length === 0) {
        console.error('❌ No se encontraron botones de exportación');
        return;
    }
    
    console.log(`✅ Encontrados ${botones.length} botones de exportación:`);
    
    // Asignar evento a cada botón encontrado
    botones.forEach((btn, index) => {
        console.log(`   Botón ${index + 1}: ${btn.id || btn.className || 'sin identificador'}`);
        
        // Eliminar listeners previos clonando el botón
        const nuevoBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(nuevoBtn, btn);
        
        // Agregar listener con feedback visual
        nuevoBtn.addEventListener('click', function() {
            console.log(`🔔 CLICK en botón exportar ${index + 1}: ${this.id || this.className || 'sin identificador'}`);
            
            // Cambio visual para confirmar que se detectó el clic
            const colorOriginal = this.style.backgroundColor;
            const borderOriginal = this.style.border;
            this.style.backgroundColor = '#ff9900';
            this.style.border = '2px solid red';
            
            // Restaurar estilo original después de un momento
            setTimeout(() => {
                this.style.backgroundColor = colorOriginal;
                this.style.border = borderOriginal;
            }, 300);
            
            // Ejecutar la función de exportación
            try {
                exportarCSVMejorado();
            } catch (error) {
                console.error('❌ Error al exportar:', error);
                mostrarMensaje('Error al exportar: ' + error.message, 'error');
            }
        });
    });
    
    console.log('✅ Botones de exportación configurados correctamente');
}

// Función auxiliar para obtener equipos filtrados
function obtenerEquiposFiltrados() {
    // Aprovechar la función de filtrado existente
    const filtrados = equipos.filter(equipo => {
        if (!equipo) return false;
        
        const textoBusqueda = document.getElementById('buscar-texto')?.value?.toLowerCase().trim() || '';
        const estadoFiltro = document.getElementById('filtro-estado')?.value || '';
        const categoriaFiltro = document.getElementById('filtro-categoria')?.value || '';
        const garantiaFiltro = document.getElementById('filtro-garantia')?.value || '';
        
        // Filtro básico para pruebas
        const coincideTexto = !textoBusqueda || 
            Object.values(equipo).some(valor => 
                valor && String(valor).toLowerCase().includes(textoBusqueda)
            );
        
        const coincideEstado = !estadoFiltro || equipo.estado === estadoFiltro;
        const coincideCategoria = !categoriaFiltro || equipo.categoria === categoriaFiltro;
        
        // Simplificación de garantía para pruebas
        const coincideGarantia = !garantiaFiltro || 
            (garantiaFiltro === 'sin-garantia' && !equipo.fechaGarantia) ||
            (garantiaFiltro !== 'sin-garantia' && equipo.fechaGarantia);
        
        return coincideTexto && coincideEstado && coincideCategoria && coincideGarantia;
    });
    
    return filtrados;
}

// Función para cargar equipos guardados
async function cargarEquiposGuardados() {
    console.log('Cargando equipos guardados...');
    
    try {
        // Intentar cargar desde localStorage
        const equiposGuardados = localStorage.getItem('equiposMedicos');
        
        if (equiposGuardados) {
            equipos = JSON.parse(equiposGuardados);
            console.log(`Se cargaron ${equipos.length} equipos del localStorage`);
        } else {
            console.log('No se encontraron equipos guardados, generando datos de ejemplo...');
            // Generar datos de ejemplo
            equipos = generarDatosEjemplo();
            // Guardar en localStorage
            localStorage.setItem('equiposMedicos', JSON.stringify(equipos));
            console.log(`Se generaron ${equipos.length} equipos de ejemplo`);
        }
        
        return equipos;
    } catch (error) {
        console.error('Error al cargar equipos:', error);
        mostrarMensaje('Error al cargar los equipos', 'error');
        // En caso de error, inicializar como array vacío
        equipos = [];
        return [];
    }
}

// Función para guardar equipos en localStorage
async function guardarEnLocalStorage() {
    try {
        console.log('Intentando guardar equipos en localStorage. Total equipos:', equipos.length);
        
        // Verificar que equipos sea un array
        if (!Array.isArray(equipos)) {
            throw new Error('equipos no es un array');
        }
        
        // Convertir a JSON y verificar
        const equiposJSON = JSON.stringify(equipos);
        if (!equiposJSON) {
            throw new Error('Error al convertir equipos a JSON');
        }
        
        // Guardar en localStorage
        localStorage.setItem('equiposMedicos', equiposJSON);
        
        // Verificar que se guardó correctamente
        const savedData = localStorage.getItem('equiposMedicos');
        if (!savedData || savedData !== equiposJSON) {
            throw new Error('Verificación de guardado falló');
        }
        
        console.log('Equipos guardados exitosamente en localStorage:', equipos.length);
        return true;
    } catch (error) {
        console.error('Error al guardar en localStorage:', error);
        mostrarMensaje('Error al guardar los datos', 'error');
        return false;
    }
}

// Función para generar datos de ejemplo
function generarDatosEjemplo() {
    console.log('Generando datos de ejemplo...');
    
    const hoy = new Date();
    
    // Función para crear una fecha aleatoria
    const fechaAleatoria = (mesesAtras, mesesAdelante) => {
        const fecha = new Date(hoy);
        const meses = Math.floor(Math.random() * (mesesAtras + mesesAdelante)) - mesesAtras;
        fecha.setMonth(fecha.getMonth() + meses);
        return fecha.toISOString().split('T')[0]; // Formato YYYY-MM-DD
    };
    
    return [
        {
            serie: 'VM001',
            nombre: 'Ventilador Mecánico',
            marca: 'Phillips',
            modelo: 'V680',
            estado: 'operativo',
            categoria: 'soporte-vida',
            ubicacion: 'UCI Adultos',
            responsable: 'Dr. García',
            departamento: 'Cuidados Intensivos',
            proveedor: 'Medical Supplies Inc.',
            fechaGarantia: fechaAleatoria(-6, 24),
            elegibleContratoConsolidado: true
        },
        {
            serie: 'DEF456',
            nombre: 'Desfibrilador',
            marca: 'Zoll',
            modelo: 'R Series',
            estado: 'mantenimiento',
            categoria: 'soporte-vida',
            ubicacion: 'Emergencias',
            responsable: 'Dra. Martínez',
            departamento: 'Emergencias',
            proveedor: 'MedEquip',
            fechaGarantia: fechaAleatoria(-12, 6),
            elegibleContratoConsolidado: true
        },
        {
            serie: 'MON003',
            nombre: 'Monitor de Signos Vitales',
            marca: 'Mindray',
            modelo: 'BeneView T8',
            estado: 'operativo',
            categoria: 'critico',
            ubicacion: 'Quirófano 3',
            responsable: 'Dr. Rodríguez',
            departamento: 'Cirugía',
            proveedor: 'Global Medical',
            fechaGarantia: fechaAleatoria(3, 12),
            elegibleContratoConsolidado: false
        },
        {
            serie: '654321',
            nombre: 'Autoclave',
            marca: 'Tuttnauer',
            modelo: '3870M',
            estado: 'operativo',
            categoria: 'general',
            ubicacion: 'Central de esterilización',
            responsable: 'Tec. Sánchez',
            departamento: 'Esterilización',
            proveedor: 'SterilTech',
            fechaGarantia: fechaAleatoria(-24, 0),
            elegibleContratoConsolidado: true
        }
    ];
}

// Función para mostrar/ocultar el formulario de registro
function toggleFormularioRegistro() {
    console.log('Alternando visibilidad del formulario de registro...');
    
    const formularioContainer = document.getElementById('form-equipo-container');
    const btnToggle = document.getElementById('btn-toggle-form');
    
    if (!formularioContainer || !btnToggle) {
        console.error('No se encontraron los elementos necesarios para toggle');
        return;
    }
    
    if (formularioContainer.style.display === 'none' || formularioContainer.style.display === '') {
        // Mostrar el formulario
        formularioContainer.style.display = 'block';
        formularioContainer.classList.add('visible');
        btnToggle.innerHTML = '<span class="btn-icon">➖</span> Ocultar Formulario';
        
        // Desplazarse suavemente hasta el formulario
        setTimeout(() => {
            formularioContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    } else {
        // Ocultar el formulario
        formularioContainer.classList.remove('visible');
        btnToggle.innerHTML = '<span class="btn-icon">➕</span> Registrar Nuevo Equipo';
        
        // Usar setTimeout para dar tiempo a la animación
        setTimeout(() => {
            formularioContainer.style.display = 'none';
        }, 500);
    }
}

// Función para actualizar la tabla de equipos (alias de mostrarEquiposEnTabla)
function actualizarTablaEquipos() {
    console.log("Actualizando tabla de equipos...");
    
    // Verificar que tenemos la tabla
    if (!tabla) {
        console.error("No se encontró la tabla de equipos");
        return;
    }
    
    // Llamar a la función existente
    mostrarEquiposEnTabla();
}

// Función para obtener datos del formulario
function obtenerDatosFormulario(formElement = null) {
    try {
        // Si no se proporciona un formulario, usar el formulario activo (modal o principal)
        const formulario = formElement || document.getElementById('form-equipo-modal') || form;
        
        if (!formulario) {
            throw new Error('No se encontró el formulario');
        }

        // Función auxiliar para obtener el valor de un campo
        const getFieldValue = (id) => {
            const elemento = formulario.querySelector(`#${id}, [id="${id}"]`);
            if (!elemento) {
                console.warn(`Campo no encontrado: ${id}`);
                return '';
            }
            return elemento.value.trim();
        };

        const datos = {
            serie: getFieldValue('serie'),
            nombre: getFieldValue('nombre'),
            marca: getFieldValue('marca'),
            modelo: getFieldValue('modelo'),
            estado: getFieldValue('estado'),
            categoria: getFieldValue('categoria'),
            ubicacion: getFieldValue('ubicacion'),
            responsable: getFieldValue('responsable'),
            departamento: getFieldValue('departamento'),
            proveedor: getFieldValue('proveedor'),
            numeroContrato: getFieldValue('numero-contrato'),
            fechaCompra: getFieldValue('fecha-compra'),
            fechaGarantia: getFieldValue('fecha-garantia'),
            costo: getFieldValue('costo'),
            imagen: getFieldValue('imagen'),
            manual: getFieldValue('manual'),
            observaciones: getFieldValue('observaciones'),
            elegibleContratoConsolidado: formulario.querySelector('#elegibleContratoConsolidado')?.checked || false,
            fechaRegistro: new Date().toISOString()
        };

        console.log('Datos obtenidos del formulario:', datos);
        return datos;
    } catch (error) {
        console.error('Error al obtener datos del formulario:', error);
        return null;
    }
}

// Función para validar datos básicos del equipo
function validarDatosBasicos(equipo) {
    try {
        const camposRequeridos = ['serie', 'nombre', 'marca', 'modelo', 'estado', 'categoria', 'ubicacion'];
        const camposFaltantes = camposRequeridos.filter(campo => !equipo[campo]);

        if (camposFaltantes.length > 0) {
            mostrarMensaje('Por favor complete todos los campos requeridos: ' + 
                camposFaltantes.join(', '), 'error');
            return false;
        }
        return true;
    } catch (error) {
        console.error('Error en la validación de datos:', error);
        return false;
    }
}

// Función para editar un equipo existente - versión corregida
function editarEquipo(serie) {
    console.log('Iniciando edición del equipo:', serie);
    
    try {
        // Buscar el equipo por su número de serie
        const equipo = equipos.find(e => e.serie === serie);
        
        if (!equipo) {
            console.error('Equipo no encontrado:', serie);
            mostrarMensaje('Equipo no encontrado', 'error');
            return;
        }
        
        console.log('Datos del equipo a editar:', equipo);
        
        // Obtener referencia al modal
        const modal = document.getElementById('modal-form');
        
        if (!modal) {
            console.error('Modal no encontrado');
            mostrarMensaje('Error al abrir el formulario', 'error');
            return;
        }
        
        // Obtener el formulario principal para clonarlo
        const formPrincipal = document.getElementById('form-equipo');
        if (!formPrincipal) {
            console.error('Formulario principal no encontrado');
            mostrarMensaje('Error al preparar el formulario', 'error');
            return;
        }
        
        // Limpiar contenido anterior del modal
        const modalBody = modal.querySelector('.modal-body');
        if (modalBody) {
            modalBody.innerHTML = '';
        } else {
            const newModalBody = document.createElement('div');
            newModalBody.className = 'modal-body';
            modal.appendChild(newModalBody);
            modalBody = newModalBody;
        }
        
        // Clonar el formulario principal
        const formClonado = formPrincipal.cloneNode(true);
        formClonado.id = 'form-equipo-modal';
        
        // Asignar al modal
        modalBody.appendChild(formClonado);
        
        // Marcar el formulario como modo edición
        formClonado.dataset.modo = 'edicion';
        formClonado.dataset.editando = serie;
        
        // Actualizar el título del modal
        const modalTitle = modal.querySelector('.modal-title');
        if (modalTitle) modalTitle.textContent = `Editar Equipo: ${equipo.nombre}`;
        
        // Mapear propiedades del equipo a IDs de campos del formulario
        const mapaCampos = {
            'serie': 'serie',
            'nombre': 'nombre',
            'marca': 'marca',
            'modelo': 'modelo',
            'estado': 'estado',
            'categoria': 'categoria',
            'ubicacion': 'ubicacion',
            'responsable': 'responsable',
            'departamento': 'departamento',
            'proveedor': 'proveedor',
            'numeroContrato': 'numero-contrato',
            'fechaCompra': 'fecha-compra',
            'fechaGarantia': 'fecha-garantia',
            'costo': 'costo',
            'imagen': 'imagen',
            'manual': 'manual',
            'observaciones': 'observaciones',
            'elegibleContratoConsolidado': 'elegibleContratoConsolidado'
        };
        
        // Llenar todos los campos del formulario
        for (const prop in equipo) {
            const idCampo = mapaCampos[prop] || prop;
            
            // Intentar obtener el campo por ID o por name
            let campo = formClonado.querySelector(`#${idCampo}`);
            if (!campo) {
                campo = formClonado.querySelector(`[name="${idCampo}"]`);
            }
            if (!campo) {
                campo = formClonado.querySelector(`[name="${prop}"]`);
            }
            
            if (campo) {
                // Manejar según el tipo de campo
                if (campo.type === 'checkbox') {
                    campo.checked = !!equipo[prop];
                    console.log(`Campo checkbox ${prop} establecido a: ${campo.checked}`);
                } 
                else if (campo.type === 'date' && equipo[prop]) {
                    // Convertir fechas al formato YYYY-MM-DD para inputs date
                    try {
                        const fecha = new Date(equipo[prop]);
                        if (!isNaN(fecha.getTime())) {
                            // Ajustar zona horaria para evitar problemas con UTC
                            const year = fecha.getFullYear();
                            const month = String(fecha.getMonth() + 1).padStart(2, '0');
                            const day = String(fecha.getDate()).padStart(2, '0');
                            const fechaFormateada = `${year}-${month}-${day}`;
                            campo.value = fechaFormateada;
                            console.log(`Campo fecha ${prop} establecido a: ${fechaFormateada}`);
                        } else {
                            console.warn(`La fecha para ${prop} no es válida: ${equipo[prop]}`);
                            campo.value = '';
                        }
                    } catch (err) {
                        console.error(`Error al formatear fecha ${prop}:`, err);
                        campo.value = '';
                    }
                } 
                else if (campo.tagName === 'SELECT') {
                    // Para elementos select, debemos asegurarnos que el valor exista como opción
                    const opcionExiste = Array.from(campo.options).some(opt => opt.value === equipo[prop]);
                    if (opcionExiste) {
                        campo.value = equipo[prop];
                    } else if (equipo[prop]) {
                        console.warn(`El valor "${equipo[prop]}" no existe como opción para ${prop}`);
                    }
                    console.log(`Campo select ${prop} establecido a: ${campo.value}`);
                } 
                else {
                    // Para el resto de tipos de campo
                    campo.value = equipo[prop] !== undefined ? equipo[prop] : '';
                    console.log(`Campo ${prop} establecido a: ${campo.value}`);
                }
            } else {
                console.warn(`Campo para propiedad ${prop} no encontrado en el formulario`);
            }
        }
        
        // Configurar el submit del formulario
        formClonado.onsubmit = async function(e) {
            e.preventDefault();
            await actualizarEquipo(serie);
        };
        
        // Mostrar el modal
        modal.classList.add('active');
        
        // Mostrar hint de ESC
        const keyHint = document.getElementById('key-hint');
        if (keyHint) keyHint.classList.add('show');
        
        console.log('Modal de edición abierto con todos los campos correctamente rellenados');
        return true;
    } catch (error) {
        console.error('Error al editar equipo:', error);
        mostrarMensaje('Error al preparar el formulario de edición', 'error');
        return false;
    }
}

// Función para clonar un equipo existente - versión mejorada
function clonarEquipo(serie) {
    console.log('Iniciando clonación del equipo:', serie);
    
    try {
        // Buscar el equipo por su número de serie
        const equipoOriginal = equipos.find(e => e.serie === serie);
        
        if (!equipoOriginal) {
            console.error('Equipo a clonar no encontrado:', serie);
            mostrarMensaje('Equipo no encontrado', 'error');
            return;
        }
        
        console.log('Datos del equipo a clonar:', equipoOriginal);
        
        // Obtener referencia al modal
        const modal = document.getElementById('modal-form');
        
        if (!modal) {
            console.error('Modal no encontrado');
            mostrarMensaje('Error al abrir el formulario', 'error');
            return;
        }
        
        // Obtener el formulario principal para clonarlo
        const formPrincipal = document.getElementById('form-equipo');
        if (!formPrincipal) {
            console.error('Formulario principal no encontrado');
            mostrarMensaje('Error al preparar el formulario', 'error');
            return;
        }
        
        // Limpiar contenido anterior del modal
        const modalBody = modal.querySelector('.modal-body');
        if (modalBody) {
            modalBody.innerHTML = '';
        } else {
            const newModalBody = document.createElement('div');
            newModalBody.className = 'modal-body';
            modal.appendChild(newModalBody);
            modalBody = newModalBody;
        }
        
        // Clonar el formulario principal
        const formClonado = formPrincipal.cloneNode(true);
        formClonado.id = 'form-equipo-modal';
        
        // Asignar al modal
        modalBody.appendChild(formClonado);
        
        // Marcar el formulario como modo clonación
        formClonado.dataset.modo = 'clonacion';
        formClonado.dataset.editando = '';
        
        // Actualizar el título del modal
        const modalTitle = modal.querySelector('.modal-title');
        if (modalTitle) modalTitle.textContent = `Clonar Equipo: ${equipoOriginal.nombre}`;
        
        // Mapear propiedades del equipo a IDs de campos del formulario
        const mapaCampos = {
            'serie': 'serie',
            'nombre': 'nombre',
            'marca': 'marca',
            'modelo': 'modelo',
            'estado': 'estado',
            'categoria': 'categoria',
            'ubicacion': 'ubicacion',
            'responsable': 'responsable',
            'departamento': 'departamento',
            'proveedor': 'proveedor',
            'numeroContrato': 'numero-contrato',
            'fechaCompra': 'fecha-compra',
            'fechaGarantia': 'fecha-garantia',
            'costo': 'costo',
            'imagen': 'imagen',
            'manual': 'manual',
            'observaciones': 'observaciones',
            'elegibleContratoConsolidado': 'elegibleContratoConsolidado'
        };
        
        // Llenar todos los campos del formulario excepto el campo serie
        for (const prop in equipoOriginal) {
            if (prop === 'serie') continue; // Omitir el campo serie para dejarlo vacío
            
            const idCampo = mapaCampos[prop] || prop;
            
            // Intentar obtener el campo por ID o por name
            let campo = formClonado.querySelector(`#${idCampo}`);
            if (!campo) {
                campo = formClonado.querySelector(`[name="${idCampo}"]`);
            }
            if (!campo) {
                campo = formClonado.querySelector(`[name="${prop}"]`);
            }
            
            if (campo) {
                // Manejar según el tipo de campo
                if (campo.type === 'checkbox') {
                    campo.checked = !!equipoOriginal[prop];
                    console.log(`Campo checkbox ${prop} establecido a: ${campo.checked}`);
                } 
                else if (campo.type === 'date' && equipoOriginal[prop]) {
                    // Convertir fechas al formato YYYY-MM-DD para inputs date
                    try {
                        const fecha = new Date(equipoOriginal[prop]);
                        if (!isNaN(fecha.getTime())) {
                            // Ajustar zona horaria para evitar problemas con UTC
                            const year = fecha.getFullYear();
                            const month = String(fecha.getMonth() + 1).padStart(2, '0');
                            const day = String(fecha.getDate()).padStart(2, '0');
                            const fechaFormateada = `${year}-${month}-${day}`;
                            campo.value = fechaFormateada;
                            console.log(`Campo fecha ${prop} establecido a: ${fechaFormateada}`);
                        } else {
                            console.warn(`La fecha para ${prop} no es válida: ${equipoOriginal[prop]}`);
                            campo.value = '';
                        }
                    } catch (err) {
                        console.error(`Error al formatear fecha ${prop}:`, err);
                        campo.value = '';
                    }
                } 
                else if (campo.tagName === 'SELECT') {
                    // Para elementos select, debemos asegurarnos que el valor exista como opción
                    const opcionExiste = Array.from(campo.options).some(opt => opt.value === equipoOriginal[prop]);
                    if (opcionExiste) {
                        campo.value = equipoOriginal[prop];
                    } else if (equipoOriginal[prop]) {
                        console.warn(`El valor "${equipoOriginal[prop]}" no existe como opción para ${prop}`);
                    }
                    console.log(`Campo select ${prop} establecido a: ${campo.value}`);
                } 
                else {
                    // Para el resto de tipos de campo
                    campo.value = equipoOriginal[prop] !== undefined ? equipoOriginal[prop] : '';
                    console.log(`Campo ${prop} establecido a: ${campo.value}`);
                }
            } else {
                console.warn(`Campo para propiedad ${prop} no encontrado en el formulario`);
            }
        }
        
        // Configurar el submit del formulario
        formClonado.onsubmit = async function(e) {
            e.preventDefault();
            
            // Verificar que se ha ingresado un número de serie
            const nuevaSerie = this.querySelector('#serie').value.trim();
            if (!nuevaSerie) {
                mostrarMensaje('Debe ingresar un número de serie para el equipo clonado', 'warning');
                this.querySelector('#serie').focus();
                return;
            }
            
            // Verificar que el número de serie no exista ya
            if (equipos.some(e => e.serie === nuevaSerie)) {
                mostrarMensaje('Ya existe un equipo con ese número de serie', 'error');
                this.querySelector('#serie').focus();
                this.querySelector('#serie').select();
                return;
            }
            
            await registrarEquipo(this);
        };
        
        // Mostrar el modal
        modal.classList.add('active');
        
        // Mostrar hint de ESC
        const keyHint = document.getElementById('key-hint');
        if (keyHint) keyHint.classList.add('show');
        
        // Enfocar el campo de serie para que el usuario lo ingrese
        setTimeout(() => {
            const serieInput = formClonado.querySelector('#serie');
            if (serieInput) {
                serieInput.value = ''; // Asegurar que esté vacío
                serieInput.focus();
                mostrarMensaje('Ingrese un número de serie para el nuevo equipo', 'info');
            }
        }, 300);
        
        console.log('Modal de clonación abierto con todos los campos originales correctamente rellenados');
        return true;
    } catch (error) {
        console.error('Error al clonar equipo:', error);
        mostrarMensaje('Error al preparar la clonación del equipo', 'error');
        return false;
    }
}

// Función para eliminar un equipo
function eliminarEquipo(serie) {
    console.log('Iniciando eliminación del equipo:', serie);
    
    try {
        // Buscar el equipo por su número de serie
        const equipoIndex = equipos.findIndex(e => e.serie === serie);
        
        if (equipoIndex === -1) {
            console.error('Equipo a eliminar no encontrado:', serie);
            mostrarMensaje('Equipo no encontrado', 'error');
            return;
        }
        
        const equipo = equipos[equipoIndex];
        
        // Mostrar confirmación
        if (!confirm(`¿Está seguro que desea eliminar el equipo "${equipo.nombre}" (${equipo.serie})?`)) {
            console.log('Eliminación cancelada por el usuario');
            return;
        }
        
        // Eliminar el equipo del array
        equipos.splice(equipoIndex, 1);
        
        // Guardar en localStorage
        guardarEnLocalStorage().then(success => {
            if (success) {
                console.log('Equipo eliminado exitosamente:', serie);
                mostrarMensaje('Equipo eliminado exitosamente', 'success');
                
                // Actualizar la interfaz
                actualizarInterfaz();
            } else {
                throw new Error('Error al guardar en localStorage');
            }
        });
    } catch (error) {
        console.error('Error al eliminar equipo:', error);
        mostrarMensaje('Error al eliminar el equipo', 'error');
    }
}
