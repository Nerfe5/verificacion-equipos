# 🔔 Sistema de Notificaciones y Alertas - Guía Completa

## 📋 Índice
1. [Descripción General](#descripción-general)
2. [Características Principales](#características-principales)
3. [Configuración](#configuración)
4. [Tipos de Alertas](#tipos-de-alertas)
5. [Panel de Notificaciones](#panel-de-notificaciones)
6. [Configuración Avanzada](#configuración-avanzada)
7. [Pruebas y Debugging](#pruebas-y-debugging)
8. [API y Funciones](#api-y-funciones)

## 🎯 Descripción General

El Sistema de Notificaciones y Alertas es un módulo profesional que proporciona monitoreo automatizado y notificaciones en tiempo real para el sistema de gestión de equipos médicos. Está diseñado para asegurar que eventos críticos y situaciones que requieren atención sean identificados y comunicados de manera oportuna.

## ✨ Características Principales

### 🔄 Monitoreo Automático
- **Verificación Continua**: El sistema verifica automáticamente el estado de los equipos cada 30 minutos (configurable)
- **Detección de Problemas**: Identifica automáticamente equipos críticos, garantías vencidas, mantenimientos prolongados
- **Alertas en Tiempo Real**: Notificaciones inmediatas cuando se detectan situaciones críticas

### 📊 Dashboard de Alertas
- **Resumen Visual**: Contadores por tipo de alerta (críticas, advertencias, informativas, mantenimiento)
- **Panel de Notificaciones**: Lista detallada de todas las alertas activas
- **Indicadores de Estado**: Badges y notificaciones visuales para alertas no leídas

### 🎛️ Configuración Flexible
- **Alertas Personalizables**: Habilitar/deshabilitar tipos específicos de alertas
- **Umbrales Configurables**: Definir días de anticipación para alertas de garantía y mantenimiento
- **Frecuencia Ajustable**: Configurar intervalos de verificación automática

## ⚙️ Configuración

### Acceso a la Configuración
1. Haga clic en el botón **"⚙️ Configurar Alertas"** en el panel de alertas
2. Se abrirá el modal de configuración con todas las opciones disponibles

### Opciones de Configuración

#### 📅 Alertas de Garantía
- **Garantías Vencidas**: ✅ Activada por defecto
  - Detecta equipos con garantías ya vencidas
- **Garantías Por Vencer**: ✅ Activada por defecto
  - Alerta cuando la garantía vence en un período específico
  - **Días de Anticipación**: 7, 15, 30 o 60 días (predeterminado: 30 días)

#### 🔧 Alertas de Mantenimiento
- **Equipos Críticos Fuera de Servicio**: ✅ Activada por defecto
  - Notifica cuando equipos críticos o de alta tecnología no están operativos
- **Verificaciones Diarias Pendientes**: ✅ Activada por defecto
  - Alerta sobre verificaciones programadas que no se han completado
- **Mantenimiento Prolongado**: ✅ Activada por defecto
  - Detecta equipos que han estado en mantenimiento por períodos extendidos
  - **Duración Máxima**: 3, 7 o 15 días (predeterminado: 7 días)

#### 🚨 Alertas Críticas
- **Equipos de Soporte de Vida**: ✅ Activada por defecto
  - Máxima prioridad para equipos de soporte de vida no operativos
- **Verificaciones No Conformes**: ✅ Activada por defecto
  - Alerta sobre verificaciones que han fallado los criterios de conformidad

#### ⏰ Frecuencia de Verificación
- **Intervalos Disponibles**: 5 min, 10 min, 30 min, 1 hora
- **Predeterminado**: 30 minutos
- **Recomendación**: 30 minutos para uso normal, 5-10 minutos para entornos críticos

## 🔔 Tipos de Alertas

### 🚨 Críticas (Prioridad Máxima)
- **Color**: Rojo
- **Icono**: 🚨
- **Ejemplos**:
  - Equipos de soporte de vida fuera de servicio
  - Equipos críticos con problemas operativos
  - Garantías vencidas en equipos esenciales

### ⚠️ Advertencias (Prioridad Alta)
- **Color**: Amarillo/Naranja
- **Icono**: ⚠️
- **Ejemplos**:
  - Garantías próximas a vencer
  - Mantenimientos prolongados
  - Equipos críticos en mantenimiento

### ℹ️ Informativas (Prioridad Normal)
- **Color**: Azul
- **Icono**: ℹ️
- **Ejemplos**:
  - Mantenimientos programados
  - Actualizaciones de estado
  - Recordatorios generales

### 🔧 Mantenimiento (Prioridad Variable)
- **Color**: Gris
- **Icono**: 🔧
- **Ejemplos**:
  - Calibraciones pendientes
  - Revisiones programadas
  - Actualizaciones de firmware

## 📱 Panel de Notificaciones

### Características del Panel
- **Lista Interactiva**: Todas las alertas con detalles completos
- **Filtrado Visual**: Alertas no leídas destacadas
- **Acciones Rápidas**: Marcar como leída, eliminar alerta individual

### Acciones Disponibles
1. **✓ Marcar como Leída**: Marca una alerta específica como leída
2. **✕ Eliminar Alerta**: Elimina una alerta específica
3. **📖 Marcar Todas Leídas**: Marca todas las alertas como leídas
4. **🗑️ Limpiar Notificaciones**: Elimina todas las alertas
5. **🧪 Probar Alertas**: Genera alertas de prueba para testing

### Información Mostrada
- **Título**: Descripción breve del problema
- **Descripción**: Detalles específicos de la alerta
- **Equipo Afectado**: Número de serie del equipo relacionado
- **Fecha y Hora**: Cuándo se generó la alerta
- **Estado**: Leída/No leída

## 🛠️ Configuración Avanzada

### Personalización de Umbrales
```javascript
// Ejemplo de configuración personalizada
configuracionAlertas = {
  garantiaVencida: true,
  garantiaPorVencer: true,
  diasGarantiaAlerta: 45,        // 45 días de anticipación
  equiposCriticos: true,
  mantenimientoProlongado: true,
  diasMantenimientoAlerta: 10,   // 10 días máximo en mantenimiento
  frecuenciaAlertas: 600000      // Verificar cada 10 minutos
};
```

### Integración con Equipos
El sistema se integra automáticamente con:
- **Categorías de Equipos**: Crítico, Soporte de Vida, Alta Tecnología, General
- **Estados de Equipos**: Operativo, Mantenimiento, Fuera de Servicio, En Calibración
- **Fechas de Garantía**: Vencimientos y períodos de vigencia
- **Historial de Mantenimiento**: Duración y frecuencia

## 🧪 Pruebas y Debugging

### Funciones de Prueba Incluidas
```javascript
// Ejecutar todas las pruebas del sistema
window.testAlertas.ejecutarPruebasAlertas();

// Generar reporte de estado actual
window.testAlertas.generarReporteAlertas();

// Resetear sistema completo
window.testAlertas.resetearSistemaAlertas();
```

### Debugging en Consola
1. Abrir **Developer Tools** (F12)
2. Ir a la pestaña **Console**
3. Ejecutar comandos de prueba disponibles
4. Revisar logs del sistema para diagnóstico

### Archivo de Pruebas
- **Ubicación**: `test_alertas.js`
- **Cargar**: Incluir en HTML para pruebas
- **Funciones**: Pruebas automatizadas completas

## 📚 API y Funciones

### Funciones Principales
```javascript
// Inicializar sistema de alertas
inicializarSistemaAlertas()

// Verificar alertas manualmente
verificarAlertas()

// Abrir configuración
abrirConfiguracionAlertas()

// Guardar configuración
guardarConfiguracionAlertas()

// Generar alertas de prueba
probarAlertas()

// Actualizar panel de notificaciones
actualizarPanelNotificaciones()

// Actualizar resumen de alertas
actualizarResumenAlertas()
```

### Variables Globales
```javascript
// Alertas activas en el sistema
alertasActivas = []

// Configuración del sistema
configuracionAlertas = { ... }

// Intervalo de verificación automática
intervalVerificacionAlertas = null
```

### Eventos del Sistema
- **Inicialización**: Al cargar la aplicación
- **Verificación Automática**: Según frecuencia configurada
- **Cambios de Equipos**: Al agregar, editar o eliminar equipos
- **Acciones del Usuario**: Al interactuar con alertas

## 🎯 Mejores Prácticas

### Para Administradores
1. **Configurar Umbrales Apropiados**: Ajustar días de anticipación según criticidad
2. **Revisar Alertas Regularmente**: Procesar alertas diariamente
3. **Mantener Configuración Actualizada**: Revisar configuración mensualmente
4. **Usar Alertas de Prueba**: Verificar funcionamiento periódicamente

### Para Usuarios
1. **Marcar Alertas como Leídas**: Mantener panel organizado
2. **Actuar sobre Alertas Críticas**: Priorizar equipos de soporte de vida
3. **Reportar Problemas**: Comunicar alertas falsas o faltantes
4. **Entender Tipos de Alertas**: Conocer prioridades y significados

## 🚀 Roadmap Futuro

### Funcionalidades Planificadas
- **Notificaciones Push**: Alertas fuera del navegador
- **Integración Email**: Envío automático de reportes
- **Alertas por Audio**: Sonidos para alertas críticas
- **Dashboard Móvil**: Aplicación móvil para notificaciones
- **Integración API**: Conexión con sistemas externos
- **Machine Learning**: Predicción de fallos basada en patrones

### Mejoras en Desarrollo
- **Filtros Avanzados**: Filtrado por categoría, fecha, equipo
- **Exportación de Reportes**: PDF y Excel de alertas
- **Escalamiento Automático**: Escalas de prioridad temporal
- **Integración SNMP**: Monitoreo de red y dispositivos

---

## 📞 Soporte y Contacto

Para soporte técnico o preguntas sobre el sistema de alertas:
- **Documentación**: Consultar este archivo
- **Pruebas**: Usar funciones en `test_alertas.js`
- **Debug**: Revisar consola del navegador
- **Logs**: Verificar localStorage del navegador

**Versión**: 1.0.0  
**Última Actualización**: Diciembre 2024  
**Estado**: ✅ Activo y Funcional
