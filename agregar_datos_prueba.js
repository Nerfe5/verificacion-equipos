console.log('Agregando datos de prueba...'); 

// Función para cargar datos de prueba
function cargarDatosPrueba() {
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
      nombre: 'Resonador Magnético',
      marca: 'Siemens',
      modelo: 'Magnetom Vida',
      serie: 'RM001',
      categoria: 'alta-tecnologia',
      estado: 'operativo',
      ubicacion: 'Sala de Resonancia 1',
      responsable: 'Dr. Martínez',
      departamento: 'Radiología',
      proveedor: 'Siemens Healthcare',
      contrato: 'CT-2022-005',
      fechaCompra: '2022-03-15',
      fechaGarantia: '2025-03-15',
      costo: '1500000',
      imagen: '',
      manual: '',
      observaciones: 'Equipo de alto rendimiento para diagnóstico por imágenes',
      fechaRegistro: new Date().toISOString(),
      ultimaActualizacion: new Date().toISOString()
    },
    {
      nombre: 'Desfibrilador',
      marca: 'Philips',
      modelo: 'HeartStart MRx',
      serie: 'DEF"123\'456',
      categoria: 'critico',
      estado: 'operativo',
      ubicacion: 'Emergencias',
      responsable: 'Dr. López',
      departamento: 'Urgencias',
      proveedor: 'Philips Healthcare',
      contrato: 'CT-2023-008',
      fechaCompra: '2023-08-10',
      fechaGarantia: '2026-08-10',
      costo: '25000',
      imagen: '',
      manual: '',
      observaciones: 'Desfibrilador con serie problemática para probar limpieza',
      fechaRegistro: new Date().toISOString(),
      ultimaActualizacion: new Date().toISOString()
    },
    {
      nombre: 'Monitor de Signos Vitales',
      marca: 'Mindray',
      modelo: 'BeneView T5',
      serie: 'MON003',
      categoria: 'general',
      estado: 'mantenimiento',
      ubicacion: 'UCI Pediátrica',
      responsable: 'Enfermera Rodríguez',
      departamento: 'UCI Pediátrica',
      proveedor: 'Mindray Medical',
      contrato: 'CT-2023-002',
      fechaCompra: '2023-02-14',
      fechaGarantia: '2026-02-14',
      costo: '8500',
      imagen: '',
      manual: '',
      observaciones: 'Monitor especializado para pacientes pediátricos - En mantenimiento',
      fechaRegistro: new Date().toISOString(),
      ultimaActualizacion: new Date().toISOString()
    },
    {
      nombre: 'Electrocardiografo',
      marca: 'GE Healthcare',
      modelo: 'MAC 2000',
      serie: 'ECG002',
      categoria: 'general',
      estado: 'fuera-servicio',
      ubicacion: 'Cardiología',
      responsable: 'Técnico Pérez',
      departamento: 'Cardiología',
      proveedor: 'GE Healthcare',
      contrato: 'CT-2021-011',
      fechaCompra: '2021-11-05',
      fechaGarantia: '2024-11-05',
      costo: '15000',
      imagen: '',
      manual: '',
      observaciones: 'Requiere reparación mayor - Fuera de servicio',
      fechaRegistro: new Date().toISOString(),
      ultimaActualizacion: new Date().toISOString()
    }
  ];

  localStorage.setItem('equiposMedicos', JSON.stringify(equiposPrueba));
  
  // Recargar la interfaz si las funciones están disponibles
  if (typeof cargarEquipos === 'function') {
    cargarEquipos();
  }
  if (typeof actualizarDashboard === 'function') {
    actualizarDashboard();
  }
  if (typeof cargarEquiposEnSelector === 'function') {
    cargarEquiposEnSelector();
  }
  
  alert('¡Datos de prueba cargados exitosamente!\n\nSe han agregado 5 equipos de ejemplo, incluyendo uno con número de serie problemático para probar la funcionalidad de limpieza y clonado.');
  console.log('Datos de prueba cargados:', equiposPrueba.length, 'equipos');
}

// Función para limpiar todos los datos
function limpiarTodosLosDatos() {
  if (confirm('¿Estás seguro de que deseas eliminar TODOS los datos? Esta acción no se puede deshacer.')) {
    localStorage.setItem('equiposMedicos', '[]');
    
    // Recargar la interfaz
    if (typeof cargarEquipos === 'function') {
      cargarEquipos();
    }
    if (typeof actualizarDashboard === 'function') {
      actualizarDashboard();
    }
    if (typeof cargarEquiposEnSelector === 'function') {
      cargarEquiposEnSelector();
    }
    
    alert('Todos los datos han sido eliminados.');
    console.log('Todos los datos eliminados');
  }
}

// Cargar datos automáticamente al cargar el script
cargarDatosPrueba();
