# Prompt de Replicación del Sistema
## Sistema de Evaluación de Cuartos de Telecomunicaciones (PWA Offline)
---

```markdown
Eres un arquitecto de software y desarrollador frontend experto de nivel Senior. Tu tarea es programar desde cero un sistema web progresivo (PWA) de evaluación de cuartos de telecomunicaciones, diseñado para operar 100% offline (sin conexión a internet) utilizando almacenamiento local en el navegador.

### DIRECTIVA IMPORTANTE DE VERSIONES:
Para cualquier dependencia o librería mencionada en este prompt, si existen versiones estables más recientes a las sugeridas, debes elegir AUTOMÁTICAMENTE la versión más actualizada disponible.

---

## 1. Stack Tecnológico Sugerido
* **Framework principal:** React (con Vite para una carga y compilación rápida).
* **Estilos (CSS):** TailwindCSS para diseño responsivo moderno y estilizado.
* **Enrutamiento:** React Router DOM para navegación Single Page Application (SPA).
* **Gestor de Estado:** Zustand (para un estado global ligero e inmutable).
* **Base de Datos Local:** Dexie.js (para interactuar de forma sencilla con IndexedDB en el navegador).
* **Generación de PDFs locales:** `pdf-lib` (para ensamblar PDFs de evaluación e imágenes en el cliente).
* **Exportación de datos:** `xlsx` (SheetJS) para generar archivos Excel (.xlsx) localmente.
* **Iconos:** Lucide React para elementos visuales modernos.
* **Animaciones:** Framer Motion (para transiciones suaves en el Wizard y pantallas).

---

## 2. Modelos de Datos y Base de Datos (Dexie.js)
El sistema debe persistir los datos localmente en IndexedDB. Define los siguientes almacenes (stores):

1. **`user`**: Almacena el perfil del evaluador único.
   * Campos: `nombre`, `matricula`, `ciudadId`, `unidadId`.
2. **`evaluaciones`**: Almacena las evaluaciones realizadas y borradores.
   * Campos: `id` (Folio: `EVA-AAAAMMDD-HHMMSS`), `unidad` (ID de unidad), `cuarto` (ID de cuarto), `fecha`, `hora`, `estado` ('borrador' | 'completado'), `evaluador` (datos del perfil), `respuestas` (objeto key-value: `QId: valor`), `observaciones`, `recomendaciones` (arreglo de textos), `puntajeObtenido`, `puntajeMaximo`, `porcentaje`, `clasificacion` (Cumple / Requiere Acción / No Cumple), `firma` (Base64 string).
3. **`fotos`**: Almacena las fotos asociadas a una evaluación.
   * Campos: `id` (autoincremental), `evalId` (Folio de evaluación), `nombre` (nombre de archivo), `blob` (archivo binario / Blob), `fecha`.

---

## 3. Catálogos del Sistema y Guía de Modificación

El sistema está diseñado de forma **completamente orientada a la configuración (Configuration-driven)**. Los componentes del asistente (Wizard) no deben tener cableada ninguna pregunta, cuarto o unidad. Todo se carga de manera dinámica desde los archivos de catálogo detallados a continuación.

### A. Catálogo de Ciudades (`cities.js`)
Ubicación: `/src/catalogs/cities.js`
```javascript
export const cities = [
  { id: 'MXL', nombre: 'Mexicali' },
  { id: 'TIJ', nombre: 'Tijuana' },
  { id: 'ENS', nombre: 'Ensenada' },
  { id: 'SLRC', nombre: 'San Luis Río Colorado' },
  { id: 'TKT', nombre: 'Tecate' },
];
```
* **Cómo actualizar:** Para agregar una nueva región o ciudad, simplemente añade un nuevo objeto `{ id: 'XYZ', nombre: 'Nueva Ciudad' }` en esta lista.

### B. Catálogo de Unidades Médicas/Administrativas (`units.js`)
Ubicación: `/src/catalogs/units.js`
Contiene la lista completa de las 77 unidades de adscripción en el OOAD Baja California.
```javascript
export const units = [
  { id: 22, nombre: 'OOADBC', cityId: 'MXL', tipo: 'Oficinas', activo: true },
  { id: 23, nombre: 'SUBDELEG MXL', cityId: 'MXL', tipo: 'Subdelegación', activo: true },
  { id: 24, nombre: 'SUBDELEG ENS', cityId: 'ENS', tipo: 'Subdelegación', activo: true },
  { id: 25, nombre: 'UMF 32 ENS', cityId: 'ENS', tipo: 'UMF', activo: true },
  { id: 26, nombre: 'SUBDELEG SLRC', cityId: 'SLRC', tipo: 'Subdelegación', activo: true },
  { id: 28, nombre: 'SUBDELEG TIJ', cityId: 'TIJ', tipo: 'Subdelegación', activo: true },
  { id: 29, nombre: 'HGO-MF 7 TIJ', cityId: 'TIJ', tipo: 'Hospital', activo: true },
  { id: 32, nombre: 'CENTRO SEG SOC TIJ', cityId: 'TIJ', tipo: 'Centro de Seguridad Social', activo: true },
  { id: 33, nombre: 'CENTRO SEG SOC SLRC', cityId: 'MXL', tipo: 'Centro de Seguridad Social', activo: true },
  { id: 35, nombre: 'ALMACEN AZUCARERA', cityId: 'MXL', tipo: 'Almacén', activo: true },
  { id: 36, nombre: 'PERIFERICO CFE ROSARITO', cityId: 'TIJ', tipo: 'Oficinas', activo: true },
  { id: 37, nombre: 'UMF 2 POB BENITO JUAREZ', cityId: 'MXL', tipo: 'UMF', activo: true },
  { id: 38, nombre: 'UMF 3 CD MORELOS', cityId: 'MXL', tipo: 'UMF', activo: true },
  { id: 39, nombre: 'UMF 4 EJ DURANGO', cityId: 'MXL', tipo: 'UMF', activo: true },
  { id: 40, nombre: 'UMF 5 EJ NUEVO LEON', cityId: 'MXL', tipo: 'UMF', activo: true },
  { id: 41, nombre: 'UMF 9 LUIS B SANCHEZ', cityId: 'MXL', tipo: 'UMF', activo: true },
  { id: 43, nombre: 'UMF 10 GUADALUPE VICTORIA', cityId: 'MXL', tipo: 'UMF', activo: true },
  { id: 44, nombre: 'UMF 11 EL SAUZAL', cityId: 'ENS', tipo: 'UMF', activo: true },
  { id: 45, nombre: 'UMF 13 SAN QUINTIN', cityId: 'ENS', tipo: 'UMF', activo: true },
  { id: 47, nombre: 'UMF 14 V GUADALUPE', cityId: 'ENS', tipo: 'UMF', activo: true },
  { id: 48, nombre: 'HGS-MF 12 SLRC', cityId: 'SLRC', tipo: 'Hospital', activo: true },
  { id: 49, nombre: 'UMF 19 TIJ CENTRO', cityId: 'TIJ', tipo: 'UMF', activo: true },
  { id: 50, nombre: 'UMF 22 SAN VICENTE', cityId: 'ENS', tipo: 'UMF', activo: true },
  { id: 51, nombre: 'UMF 24 SAN FELIPE', cityId: 'MXL', tipo: 'UMF', activo: true },
  { id: 52, nombre: 'OFNA AUX SAN FELIPE', cityId: 'MXL', tipo: 'Oficinas', activo: true },
  { id: 53, nombre: 'UMF 26 MXL', cityId: 'MXL', tipo: 'UMF', activo: true },
  { id: 54, nombre: 'UMF 29 EL ROSARIO', cityId: 'ENS', tipo: 'UMF', activo: true },
  { id: 55, nombre: 'UMF 34 EL FLORIDO', cityId: 'TIJ', tipo: 'UMF', activo: true },
  { id: 56, nombre: 'UMF 35 LOBOS', cityId: 'TIJ', tipo: 'UMF', activo: true },
  { id: 57, nombre: 'UMF 36 MESA DE OTAY', cityId: 'TIJ', tipo: 'UMF', activo: true },
  { id: 58, nombre: 'SUBSEDE DELEGACIONAL', cityId: 'TIJ', tipo: 'Oficinas', activo: true },
  { id: 59, nombre: 'UMF 37 PALMAR SANTA ANITA', cityId: 'MXL', tipo: 'UMF', activo: true },
  { id: 60, nombre: 'ALMACEN DELEGACIONAL BCN', cityId: 'MXL', tipo: 'Almacén', activo: true },
  { id: 64, nombre: 'CENTRO SEGURIDAD SOCIAL MXL', cityId: 'MXL', tipo: 'Centro de Seguridad Social', activo: true },
  { id: 69, nombre: 'HGR 1 TIJ', cityId: 'TIJ', tipo: 'Hospital', activo: true },
  { id: 70, nombre: 'PERIFERICO MANEADERO', cityId: 'ENS', tipo: 'Periférico', activo: true },
  { id: 71, nombre: 'SUBDELEG TKT', cityId: 'TKT', tipo: 'Subdelegación', activo: true },
  { id: 72, nombre: 'HGZ-MF 8 ENS', cityId: 'ENS', tipo: 'Hospital', activo: true },
  { id: 73, nombre: 'UMF NO 15 EJ HERMOSILLO', cityId: 'MXL', tipo: 'UMF', activo: true },
  { id: 74, nombre: 'HGR 20 TIJ', cityId: 'TIJ', tipo: 'Hospital', activo: true },
  { id: 75, nombre: 'HGE 30 MXL', cityId: 'MXL', tipo: 'Hospital', activo: true },
  { id: 76, nombre: 'HGP-MF 31 MXL', cityId: 'MXL', tipo: 'Hospital', activo: true },
  { id: 77, nombre: 'UMF 16 MXL', cityId: 'MXL', tipo: 'UMF', activo: true },
  { id: 78, nombre: 'UMF 17 ROSARITO', cityId: 'TIJ', tipo: 'UMF', activo: true },
  { id: 79, nombre: 'UMF 25 ENS', cityId: 'ENS', tipo: 'UMF', activo: true },
  { id: 80, nombre: 'UMF 27 TIJ', cityId: 'TIJ', tipo: 'UMF', activo: true },
  { id: 81, nombre: 'UMF 28 MXL', cityId: 'MXL', tipo: 'UMF', activo: true },
  { id: 82, nombre: 'UMF 33 TIJ', cityId: 'TIJ', tipo: 'UMF', activo: true },
  { id: 2497, nombre: 'CENTRO CAPA TIJ', cityId: 'TIJ', tipo: 'Centro CAPA', activo: true },
  { id: 2714, nombre: 'HRS 69 SAN QUINTIN', cityId: 'ENS', tipo: 'Hospital', activo: true },
  { id: 2930, nombre: 'TIENDA IMSS ENS', cityId: 'ENS', tipo: 'Tienda', activo: true },
  { id: 2932, nombre: 'TIENDA IMSS TIJ', cityId: 'TIJ', tipo: 'Tienda', activo: true },
  { id: 70128, nombre: 'UMF 38 SLRC', cityId: 'SLRC', tipo: 'UMF', activo: true },
  { id: 70129, nombre: 'UMF 39 TKT', cityId: 'TKT', tipo: 'UMF', activo: true },
  { id: 70159, nombre: 'GUARDERIA MXL', cityId: 'MXL', tipo: 'Guardería', activo: true },
  { id: 70160, nombre: 'GUARDERIA ENS', cityId: 'ENS', tipo: 'Guardería', activo: true },
  { id: 70175, nombre: 'TEATRO IMSS TIJUANA', cityId: 'TIJ', tipo: 'Teatro', activo: true },
  { id: 70176, nombre: 'PERIFERICO SONY', cityId: 'TIJ', tipo: 'Periférico', activo: true },
  { id: 70177, nombre: 'BODEGA IMSS TIJUANA', cityId: 'TIJ', tipo: 'Bodega', activo: true },
  { id: 70179, nombre: 'PERIFERICO SHARP', cityId: 'TIJ', tipo: 'Periférico', activo: true },
  { id: 70302, nombre: 'GUARDERIA TIJ', cityId: 'TIJ', tipo: 'Guardería', activo: true },
  { id: 70304, nombre: 'ESC DE ENFERMERIA', cityId: 'TIJ', tipo: 'Escuela', activo: true },
  { id: 70340, nombre: 'HGS 6 TKT', cityId: 'TKT', tipo: 'Hospital', activo: true },
  { id: 70507, nombre: 'UMF 18 TIJ', cityId: 'TIJ', tipo: 'UMF', activo: true },
  { id: 70508, nombre: 'UMF 40 MXL', cityId: 'MXL', tipo: 'UMF', activo: true },
  { id: 70657, nombre: 'CENTRO CAPA MXL', cityId: 'MXL', tipo: 'Centro CAPA', activo: true },
  { id: 70700, nombre: 'PERIFERICO HIPODROMO', cityId: 'TIJ', tipo: 'Periférico', activo: true },
  { id: 70836, nombre: 'PERIFERICO TELNOR', cityId: 'TIJ', tipo: 'Periférico', activo: true },
  { id: 70921, nombre: 'UDDCM', cityId: 'TIJ', tipo: 'Unidad', activo: true },
  { id: 70923, nombre: 'UMF 21 ROSARITO', cityId: 'TIJ', tipo: 'UMF', activo: true },
  { id: 70945, nombre: 'PARQUE IMSS', cityId: 'MXL', tipo: 'Parque', activo: true },
  { id: 71070, nombre: 'HOSPITAL COVID TIJUANA', cityId: 'TIJ', tipo: 'Hospital', activo: true },
  { id: 71389, nombre: 'CENTRO DE MEZCLAS UMAA 36', cityId: 'TIJ', tipo: 'Centro de Mezclas', activo: true },
  { id: 71498, nombre: 'HOSPITAL GENERAL REGIONAL 23', cityId: 'ENS', tipo: 'Hospital', activo: true },
];
```
* **Cómo actualizar:** Para agregar una nueva unidad, inserta un objeto en el arreglo con su respectivo identificador numérico `id`, `nombre`, el `cityId` correspondiente para su filtrado, y `tipo` de establecimiento.

### C. Catálogo de Cuartos de Telecomunicaciones (`rooms.js`)
Ubicación: `/src/catalogs/rooms.js`
Cada cuarto debe estar enlazado a su unidad mediante `unitId`. A continuación, se muestra una porción representativa del catálogo (total de 178 cuartos):
```javascript
export const rooms = [
  { id: 'ID22CUARTO1', unitId: 22, nombre: 'MDF' },
  { id: 'ID22CUARTO2', unitId: 22, nombre: 'IDF - INFORMATICA' },
  { id: 'ID23CUARTO1', unitId: 23, nombre: 'MDF' },
  { id: 'ID26CUARTO1', unitId: 26, nombre: 'MDF' },
  { id: 'ID26CUARTO2', unitId: 26, nombre: 'IDF CENTRO DE SEGURIDAD SOCIAL' },
  { id: 'ID28CUARTO1', unitId: 28, nombre: 'MDF RACK Y GABINETE' },
  { id: 'ID32CUARTO1', unitId: 32, nombre: 'MDF DIRECCION' },
  { id: 'ID33CUARTO1', unitId: 33, nombre: 'MDF' }, // Cuarto crítico para unidad 33
  { id: 'ID35CUARTO1', unitId: 35, nombre: 'MDF' },
  { id: 'ID70128CUARTO1', unitId: 70128, nombre: 'MDF' },
  { id: 'ID71498CUARTO1', unitId: 71498, nombre: 'MDF' },
  { id: 'ID71498CUARTO2', unitId: 71498, nombre: 'IDF 1 GOBIERNO' },
  // ... resto de los 178 cuartos mapeados
];
```
* **Cómo actualizar:** 
  * **Agregar un cuarto:** Inserta un objeto con un `id` alfanumérico único (por ejemplo: `ID[unitId]CUARTO[número_consecutivo]`), el `unitId` al que pertenece y su `nombre` técnico.
  * **Regla Crítica:** En el formulario de Nueva Evaluación, al seleccionar una Unidad, el selector de cuartos debe filtrar de manera reactiva únicamente los elementos de `rooms` cuyo `unitId` coincida con el de la unidad seleccionada.

### D. Catálogo de Preguntas Normativas (`questions.js`)
Ubicación: `/src/catalogs/questions.js`
Este archivo contiene la configuración de las 41 preguntas (`Q001` a `Q041`), organizadas por secciones y ponderadas para la puntuación.

#### Ejemplo de Configuración en `questions.js`:
```javascript
export const questions = [
  // ---- SECCIÓN: FÍSICA ----
  {
    id: 'Q001', titulo: 'Tipo de instalación', descripcion: 'Selecciona el tipo de instalación del cuarto.',
    seccion: 'fisica', tipo: 'radio', required: true, orden: 10, peso: 0, criticidad: 'Baja',
    visible: true, visibleIf: null, opciones: ['Rack', 'Gabinete', 'Ambos'],
    jsonField: 'tipoInstalacion', pdfField: null,
  },
  {
    id: 'Q002', titulo: 'Temperatura del cuarto', descripcion: 'Temperatura recomendada 18-24°C.',
    seccion: 'fisica', tipo: 'radio', required: true, orden: 20, peso: 10, criticidad: 'Alta',
    visible: true, visibleIf: null, opciones: ['Cumple', 'No Cumple', 'No Aplica'],
    jsonField: 'temperatura', pdfField: 'Temperatura 18-24°C',
  },
  {
    id: 'Q009', titulo: 'Existe Aire acondicionado o extracción', descripcion: 'Climatización del cuarto.',
    seccion: 'fisica', tipo: 'radio', required: true, orden: 90, peso: 15, criticidad: 'Alta',
    visible: true, visibleIf: null, opciones: ['Cumple', 'No Cumple', 'No Aplica'],
    recommendations: [{ when: 'No Cumple', text: 'Instalar sistema de climatización.' }],
    jsonField: 'climatizacion', pdfField: 'Climatizado (AC o Extractor)',
  },

  // ---- SECCIÓN: SEGURIDAD ----
  {
    id: 'Q011', titulo: 'Existen objetos ajenos', descripcion: '¿El cuarto está libre de objetos ajenos?',
    seccion: 'seguridad', tipo: 'radio', required: true, orden: 110, peso: 10, criticidad: 'Alta',
    visible: true, visibleIf: null, opciones: ['Libre de objetos ajenos', 'No esta libre'],
    recommendations: [{ when: 'No esta libre', text: 'Retirar objetos ajenos en el cuarto.' }],
    jsonField: 'objetosAjenos', pdfField: 'Libre de objetos ajenos',
  },
  {
    id: 'Q015', titulo: 'Existe extintor', descripcion: 'Selecciona el estado actual.',
    seccion: 'seguridad', tipo: 'radio', required: true, orden: 150, peso: 15, criticidad: 'Alta',
    visible: true, visibleIf: null, opciones: ['Cumple', 'No Cumple'],
    recommendations: [{ when: 'No Cumple', text: 'Instalar extintor CO₂ vigente.' }],
    jsonField: 'extintor', pdfField: 'Extintor CO2',
  },
  {
    id: 'Q016', titulo: 'Tipo de extintor', descripcion: 'Selecciona el tipo de extintor.',
    seccion: 'seguridad', tipo: 'radio', required: false, orden: 160, peso: 0, criticidad: 'Baja',
    visible: true, visibleIf: { question: 'Q015', operator: 'equals', value: 'Cumple' },
    opciones: ['CO₂', 'Otro', 'No Existe'],
    jsonField: 'tipoExtintor', pdfField: null,
  },

  // ---- SECCIÓN: EQUIPOS (Ejemplo numérico con condicional) ----
  {
    id: 'Q027', titulo: 'Número de Servidores', descripcion: 'Captura la cantidad de servidores.',
    seccion: 'equipos', tipo: 'number', required: true, orden: 270, peso: 0, criticidad: 'Media',
    visible: true, visibleIf: null, placeholder: '0',
    validation: { min: 0, max: 10000 },
    jsonField: 'servidores', pdfField: null,
  },
  {
    id: 'Q029', titulo: 'Equipos (servidores) actualizados', descripcion: 'Selecciona el estado actual.',
    seccion: 'equipos', tipo: 'radio', required: false, orden: 290, peso: 5, criticidad: 'Media',
    visible: true, visibleIf: { question: 'Q027', operator: 'gt', value: 0 }, opciones: ['Cumple', 'No Cumple'],
    jsonField: 'equiposActualizados', pdfField: null,
  },

  // ---- SECCIÓN: OBSERVACIONES FINAL ----
  {
    id: 'Q041', titulo: 'Observaciones', descripcion: 'Agrega cualquier observación relevante (sin límite).',
    seccion: 'observaciones', tipo: 'textarea', required: false, orden: 410, peso: 0, criticidad: 'Baja',
    visible: true, visibleIf: null, placeholder: 'Escribe aquí las observaciones...',
    jsonField: 'observacionesTexto', pdfField: null,
  },
];

// Lógica de Cumplimiento
export const COMPLIANT_VALUES = new Set([
  'Cumple', 'Limpios', 'Sí', 'Funciona', 'Funcionando', 'Con Garantía', 'Sin Alarmas', 'CO₂', 'No', 'Libre de objetos ajenos'
]);
export const NEUTRAL_VALUES = new Set(['No Aplica']);
```

#### **Guía Completa para Modificar Preguntas:**
El motor del Wizard mapea e interpreta cada pregunta mediante este archivo JS. Para actualizar el cuestionario:
1. **Agregar una Pregunta:** Crea un objeto nuevo dentro del arreglo `questions` especificando su `id` único, `titulo`, `descripcion`, `seccion`, `tipo`, `opciones`, `peso` y reglas de condicionalidad/recomendaciones.
2. **Eliminar una Pregunta:** Borra su objeto del arreglo. El sistema omitirá de forma automatizada su renderizado y exportaciones.
3. **Modificar Criterios de Evaluación:** Ajusta los conjuntos `COMPLIANT_VALUES` y `NEUTRAL_VALUES` para redefinir el scoring.

## 2. Modelos de Datos y Base de Datos (Dexie.js)
El sistema debe persistir los datos localmente en IndexedDB. Define los siguientes almacenes (stores):

1. **`user`**: Almacena el perfil del evaluador único.
   * Campos: `nombre`, `matricula`, `ciudadId`, `unidadId`.
2. **`evaluaciones`**: Almacena las evaluaciones realizadas y borradores.
   * Campos: `id` (Folio: `EVA-AAAAMMDD-HHMMSS`), `unidad` (ID de unidad), `cuarto` (ID de cuarto), `fecha`, `hora`, `estado` ('borrador' | 'completado'), `evaluador` (datos del perfil), `respuestas` (objeto key-value: `QId: valor`), `observaciones`, `recomendaciones` (arreglo de textos), `puntajeObtenido`, `puntajeMaximo`, `porcentaje`, `clasificacion` (Cumple / Requiere Acción / No Cumple), `firma` (Base64 string).
3. **`fotos`**: Almacena las fotos asociadas a una evaluación.
   * Campos: `id` (autoincremental), `evalId` (Folio de evaluación), `nombre` (nombre de archivo), `blob` (archivo binario / Blob), `fecha`.
4. **`backups`**: Almacena los archivos y blobs generados para exportación individual y compartición.
   * Campos: `id` (Folio de evaluación), `idEvaluacion`, `estado` ('generado'), `pdf` (Blob), `pdfNombre`, `pdfFotos` (Blob), `pdfFotosNombre`, `pdfOficio` (Blob), `pdfOficioNombre`, `json` (String), `jsonNombre`, `fecha`.

---

## 4. Flujo de Navegación y Vistas

### A. Registro de Usuario (Pantalla Inicial)
* Si no hay un perfil en base de datos, redirigir a este formulario.
* Campos obligatorios: Nombre, Matrícula, Ciudad y Unidad Delegacional.

### B. Dashboard (Panel Principal)
* **Encabezado:** Muestra el nombre del evaluador.
* **Métricas:** Evaluación, borradores y espacio ocupado.
* **Actividad Reciente:** Tabla con las últimas 5 evaluaciones realizadas.

### C. Asistente de Evaluación (Wizard)
* **Lógica de Recuperación de Borrador:** Al recuperar, no pedir Unidad ni Cuarto si existen. Avanzar automáticamente al paso inconcluso.

---

## 5. Módulo de Respaldos e Integraciones

### A. Panel de Exportación a Excel (xlsx):
1. Filtrar por: **Todas**, **Año**, **Rango de Fechas**.
2. Archivo `.xlsx` con metadatos, respuestas `Q001-Q041`, observaciones y recomendaciones unificadas. **Excluye fotografías**.

### B. Descargar Respaldos Individuales por Evaluación:
Cada tarjeta de evaluación en el listado de respaldos debe mostrar un menú de 4 columnas para descargar o compartir:
1. **PDF (Auditoría):** Reporte completo del formato de evaluación.
2. **Fotos (PDF):** Reporte de imágenes independiente.
3. **Oficio (PDF):** Oficio de evaluación formal dirigido al Director.
4. **JSON:** Archivo con los datos crudos estructurados.
* Si el reporte fotográfico o el Oficio PDF no se han pregenerado, el sistema los **generará al vuelo**, los almacenará en la base de datos de respaldos y procederá a su descarga.

---

## 6. Motor de Generación de PDFs (pdf-lib)

### A. Reporte de Evaluación (PDF Principal)
* Formato Carta, diseño 2 columnas. Encabezado institucional, desglose de puntuaciones, recomendaciones y firma digital.

### B. Reporte Fotográfico PDF (Novedad Crítica)
* **Distribución (Cuadrícula 2x2):** 4 fotografías por hoja, tamaño `240x180` pt, con nombre de archivo centrado (truncado si es muy largo).
* **Tolerancia a Errores:** `try/catch` para cada imagen, mostrando caja con borde rojo si hay error.

### C. Oficio de Evaluación PDF (Novedad Crítica)
Generar un oficio formal de evaluación en formato tamaño Carta:
* **Encabezado institucional:** "OFICIO EVALUACION TELECOMUNICACIONES" seguido de "Control de Seguridad para Redes de Voz y Datos".
* **Metadata:** Folio (izquierda) y Fecha/Hora (derecha).
* **Destinatario:** Nombre y Puesto del Director.
* **Atención:** Nombre y Cargo del Ingeniero/Administrador (guardado en `localStorage`).
  * En la pantalla del modal, el usuario debe seleccionar el Tipo de Atención entre 3 opciones: *Administrador*, *Ingeniero de Conservación* u *Otro*.
  * El usuario especificará el cargo (ej. *Encargado*, *Responsable*, etc., o cargo completo personalizado si eligió *Otro*).
* **Cuerpo:** Cita norma ASI ACT 00. Los párrafos del cuerpo del oficio deben mostrar su texto **justificado** (distribuyendo proporcionalmente el espaciado entre palabras en cada renglón excepto en el último).
* **Listado de requerimientos:** Listar recomendaciones bajo la etiqueta de la Unidad Médica. Si no hay recomendaciones, no mostrar ninguna leyenda genérica ("Ninguno. El cuarto se encuentra libre de desviaciones" debe ser omitido; simplemente dejar el espacio en blanco).
* **Cierre y Firmas:** Cierre institucional, firmas del evaluador y cuadro punteado para Sello de la Unidad.
* **Numeración:** "Página X de Y" dinámica al pie de página.

---

## 7. Requerimientos de PWA (Funcionamiento Offline)
* Configura un Service Worker (*Stale-While-Revalidate* o *Cache-First*).
* Aplicación instalable y ejecutable sin conexión.
* Diseño 100% limpio (sin badges externos).
