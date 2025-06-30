// Datos de prueba para el sistema de gestión de equipos médicos
const equiposPrueba = [
  {
    "serie": "RM001",
    "nombre": "Resonador Magnético",
    "marca": "Siemens",
    "modelo": "Magnetom Vida",
    "categoria": "alta-tecnologia",
    "estado": "operativo",
    "ubicacion": "Sala de Resonancia 1",
    "responsable": "Dr. García",
    "proveedor": "Siemens Healthcare",
    "fechaAdquisicion": "2022-03-15",
    "fechaGarantia": "2025-03-15",
    "costoAdquisicion": 1500000,
    "costoMantenimiento": 5000,
    "observaciones": "Equipo de alto rendimiento para diagnóstico por imágenes",
    "fechaRegistro": "2024-01-10T10:00:00.000Z",
    "ultimaActualizacion": "2024-01-10T10:00:00.000Z"
  },
  {
    "serie": "VEN001",
    "nombre": "Ventilador Mecánico",
    "marca": "Hamilton",
    "modelo": "Hamilton-C3",
    "categoria": "soporte-vida",
    "estado": "operativo",
    "ubicacion": "UCI Adultos",
    "responsable": "Enfermera Martínez",
    "proveedor": "Hamilton Medical",
    "fechaAdquisicion": "2023-06-20",
    "fechaGarantia": "2026-06-20",
    "costoAdquisicion": 75000,
    "costoMantenimiento": 2000,
    "observaciones": "Ventilador para cuidados intensivos con monitoreo avanzado",
    "fechaRegistro": "2024-01-10T11:00:00.000Z",
    "ultimaActualizacion": "2024-01-10T11:00:00.000Z"
  },
  {
    "serie": "DEF\"123'456",
    "nombre": "Desfibrilador",
    "marca": "Philips",
    "modelo": "HeartStart MRx",
    "categoria": "critico",
    "estado": "operativo",
    "ubicacion": "Emergencias",
    "responsable": "Dr. López",
    "proveedor": "Philips Healthcare",
    "fechaAdquisicion": "2023-08-10",
    "fechaGarantia": "2026-08-10",
    "costoAdquisicion": 25000,
    "costoMantenimiento": 800,
    "observaciones": "Desfibrilador con serie problemática para probar limpieza",
    "fechaRegistro": "2024-01-10T12:00:00.000Z",
    "ultimaActualizacion": "2024-01-10T12:00:00.000Z"
  }
];

localStorage.setItem("equiposMedicos", JSON.stringify(equiposPrueba));
