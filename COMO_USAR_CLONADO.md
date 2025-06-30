# Funcionalidad de Clonado de Equipos

## ¿Qué hace la funcionalidad de clonado?

La funcionalidad de clonado permite crear equipos con las mismas características que un equipo existente, pero con un número de serie diferente. Esto es útil cuando tienes varios equipos idénticos que solo se diferencian por su número de serie y ubicación.

## ¿Cómo usar la funcionalidad de clonado?

### Paso 1: Localizar el equipo a clonar
1. Ve a la tabla de equipos registrados
2. Encuentra el equipo que deseas clonar
3. En la columna "Acciones", verás un botón **"Clonar"** 🔄

### Paso 2: Hacer clic en "Clonar"
1. Haz clic en el botón **"Clonar"**
2. Se abrirá un modal con la información del equipo original

### Paso 3: Ingresar el nuevo número de serie
1. En el modal, verás los datos del equipo original
2. **Campo obligatorio**: Ingresa el nuevo número de serie (debe ser único)
3. **Campos opcionales**: 
   - Nueva ubicación (si quieres cambiarla)
   - Nuevo responsable (si quieres cambiarlo)
   - Si dejas estos campos vacíos, se mantendrán los valores originales

### Paso 4: Confirmar el clonado
1. Haz clic en **"✅ Clonar Equipo"**
2. El sistema verificará que el número de serie no exista
3. Si todo está correcto, se creará el nuevo equipo
4. Recibirás una confirmación y la tabla se actualizará automáticamente

## ¿Qué datos se copian exactamente?

**Se copian todos los datos excepto:**
- Número de serie (lo ingresas tú)
- Ubicación (opcional, puedes cambiarla)
- Responsable (opcional, puedes cambiarlo)
- Fecha de registro (se pone la fecha actual)
- Última actualización (se pone la fecha actual)

**Se mantienen exactamente iguales:**
- Nombre del equipo
- Marca y modelo
- Categoría
- Estado
- Departamento
- Proveedor
- Número de contrato
- Fecha de compra
- Fecha de garantía
- Costo
- Imagen
- Manual
- Observaciones

## Ejemplo de uso

Si tienes un "Ventilador Mecánico Philips V60" con serie "VM001" en "UCI - Cama 01" y quieres agregar otro idéntico:

1. Haz clic en "Clonar" en la fila del VM001
2. Ingresa el nuevo número de serie: "VM002"
3. Cambia la ubicación a: "UCI - Cama 02"
4. Haz clic en "Clonar Equipo"

Resultado: Tendrás dos ventiladores idénticos con diferentes números de serie y ubicaciones.

## Validaciones incluidas

- **Número de serie único**: No permite duplicar números de serie existentes
- **Campo obligatorio**: El número de serie no puede estar vacío
- **Limpieza automática**: Los números de serie problemáticos se limpian automáticamente

## Botones de utilidad adicionales

- **🧹 Limpiar Series**: Limpia números de serie con comillas problemáticas
- **📋 Cargar Datos de Prueba**: Carga equipos de ejemplo para probar
- **🗑️ Limpiar Todos los Datos**: Elimina todos los equipos (con confirmación)

## ¿Problemas?

Si encuentras algún problema:
1. Prueba el botón "🧹 Limpiar Series" para corregir datos problemáticos
2. Usa "📋 Cargar Datos de Prueba" para probar con datos limpios
3. Verifica que el número de serie que intentas usar no exista ya
