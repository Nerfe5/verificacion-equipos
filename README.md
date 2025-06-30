# 🏥 Sistema de Gestión de Equipos Médicos

Un sistema web completo para la gestión, seguimiento y clonado de equipos médicos desarrollado con HTML, CSS y JavaScript vanilla.

![Estado del Proyecto](https://img.shields.io/badge/Estado-Activo-brightgreen)
![Versión](https://img.shields.io/badge/Versión-2.0.0-blue)
![Licencia](https://img.shields.io/badge/Licencia-MIT-yellow)

## 🚀 Características Principales

### ✨ **Gestión Completa de Equipos**
- ✅ **Registrar** equipos médicos con información detallada
- ✏️ **Editar** información de equipos existentes
- 👀 **Visualizar** detalles completos en modal interactivo
- 🗑️ **Eliminar** equipos con confirmación de seguridad

### 🔄 **Funcionalidad de Clonado Avanzada**
- 🧬 **Clonar equipos** con las mismas características
- 🔢 **Números de serie únicos** con validación automática
- 📍 **Ubicación y responsable opcionales** modificables
- ⚡ **Proceso rápido** con modal intuitivo

### 📊 **Dashboard y Análisis**
- 📈 **Estadísticas en tiempo real** de equipos
- 🚨 **Alertas de garantía** vencidas y por vencer
- 📋 **Equipos críticos** que requieren atención
- 📊 **Distribución por categorías** visualizada

### 🔍 **Búsqueda y Filtrado**
- 🔎 **Búsqueda por texto** en todos los campos
- 🏷️ **Filtros por estado, categoría y garantía**
- 📄 **Exportación a CSV** de resultados filtrados
- 🧹 **Limpieza automática** de datos problemáticos

### 📁 **Importación y Exportación**
- 📥 **Importar desde CSV** con detección de duplicados
- 📤 **Exportar datos** filtrados a CSV
- 🔄 **Respaldo automático** en localStorage
- 🧪 **Datos de prueba** para testing

## 🛠️ Tecnologías Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Almacenamiento**: LocalStorage (navegador)
- **Estilos**: CSS Grid, Flexbox, Variables CSS
- **Interactividad**: Event Listeners, Modales dinámicos

## 📦 Instalación y Uso

### 1. **Clonar el repositorio**
```bash
git clone git@github.com:Nerfe5/verificacion-equipos.git
cd verificacion-equipos
```

### 2. **Ejecutar la aplicación**
```bash
# Opción 1: Servidor local con Python
python3 -m http.server 8000

# Opción 2: Servidor local con Node.js
npx http-server

# Opción 3: Abrir directamente index.html en el navegador
```

### 3. **Acceder a la aplicación**
Abre tu navegador en `http://localhost:8000`

## 🎯 Cómo Usar el Sistema

### **Registrar un Equipo**
1. Completa el formulario de registro
2. Asegúrate de que el número de serie sea único
3. Haz clic en "Registrar Equipo"

### **Clonar un Equipo**
1. Localiza el equipo en la tabla
2. Haz clic en el botón "🔄 Clonar"
3. Ingresa el nuevo número de serie
4. Opcionalmente modifica ubicación y responsable
5. Confirma el clonado

### **Filtrar y Buscar**
- Usa la barra de búsqueda para texto libre
- Aplica filtros por estado, categoría o garantía
- Exporta los resultados filtrados

## 📁 Estructura del Proyecto

```
verificacion-equipos/
├── index.html              # Página principal
├── main.js                 # Lógica principal de la aplicación
├── styles.css              # Estilos CSS
├── agregar_datos_prueba.js # Utilidades para datos de prueba
├── test_clonado.js         # Scripts de testing
├── test_data.js            # Datos de prueba
├── COMO_USAR_CLONADO.md    # Documentación del clonado
└── README.md               # Este archivo
```

## 🔧 Funcionalidades Avanzadas

### **Limpieza Automática de Datos**
- Detecta y limpia números de serie con caracteres problemáticos
- Validación automática al cargar la aplicación
- Botón manual para limpieza de series

### **Sistema de Alertas**
- Equipos críticos fuera de servicio
- Garantías vencidas o próximas a vencer
- Notificaciones en el dashboard

### **Validaciones Robustas**
- Números de serie únicos
- Formatos de fecha consistentes
- Manejo seguro de caracteres especiales

## 🧪 Datos de Prueba

El sistema incluye datos de prueba que se cargan automáticamente:
- Ventilador Mecánico Philips V60
- Monitor de Signos Vitales GE B650
- Equipos con diferentes estados y categorías

**Botones de utilidad:**
- 📋 **Cargar Datos de Prueba**: Añade equipos de ejemplo
- 🧹 **Limpiar Series**: Corrige números de serie problemáticos
- 🗑️ **Limpiar Todos los Datos**: Elimina todos los equipos

## 🎨 Características de Diseño

### **Interfaz Moderna**
- Diseño responsive para desktop y móvil
- Colores intuitivos para estados (verde=operativo, amarillo=mantenimiento)
- Iconos emoji para mejor usabilidad

### **Experiencia de Usuario**
- Modales interactivos para acciones importantes
- Confirmaciones de seguridad para eliminaciones
- Feedback visual para todas las acciones

## 🚀 Próximas Mejoras

- [ ] 👥 Sistema de usuarios y permisos
- [ ] 📱 Progressive Web App (PWA)
- [ ] 🔔 Notificaciones push
- [ ] 📊 Gráficos avanzados con Chart.js
- [ ] 🌐 Backend con base de datos
- [ ] 📧 Notificaciones por email
- [ ] 🔄 Sincronización en tiempo real

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Por favor:

1. Haz fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 👨‍💻 Autor

**Nerfe5**
- GitHub: [@Nerfe5](https://github.com/Nerfe5)
- Email: n3rfe5@gmail.com

## 🙏 Agradecimientos

- Inspirado en las necesidades reales de gestión hospitalaria
- Desarrollado con las mejores prácticas de JavaScript vanilla
- Diseñado para ser intuitivo y fácil de usar

---

⭐ **¡Si te gusta este proyecto, no olvides darle una estrella!** ⭐
