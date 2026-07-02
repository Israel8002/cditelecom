# PRD — Sistema de Evaluación de Cuartos de Telecomunicaciones (IMSS)

## Problema / Visión
PWA profesional 100% offline para Ingenieros de Telecom del IMSS (Coord. Delegacional de Informática, OOAD Baja California). Sustituye el proceso actual en AppSheet. Todo local en IndexedDB, sin backend, sin auth, sin APIs externas. PDF y JSON generados localmente; el usuario decide respaldar manualmente.

## Stack (decisión)
El PRD pedía Next.js 15 + TS. Por estabilidad en el entorno de desarrollo (frontend servido en :3000 vía CRACO), se implementó en **React 19 + CRACO (JavaScript)** manteniendo la arquitectura dirigida por catálogos exigida por el Anexo A. Sin backend/Mongo (FastAPI queda sin uso). Librerías: idb, zustand, zod, react-hook-form, framer-motion, pdf-lib, xlsx (exportación Excel), lucide-react, tailwind, sonner.

## Arquitectura (Configuration Driven)
- `/src/catalogs`: cities, units (74), rooms (177), sections, questions (41), pdf-layout, json-schema, constants, appConfig, devices (catálogo de 148 modelos). Catálogos generados desde CATALOGO.txt y catalogodispositivos.xlsx.
- `/src/services`: catalog (visibilidad/score/recomendaciones), storage (IndexedDB CRUD), json, pdf (pdf-lib, formato institucional), backup, log, format, excel (xlsx).
- `/src/stores`: user.store, evaluation.store, equipment.store (zustand, guardado inmediato en IndexedDB).
- `/src/db/indexeddb.js`: db `telecom-imss` v2 (usuarios, evaluaciones, fotografias, respaldos, logs, configuracion, equipos con índices por unitId y roomId).
- `/src/components` + `/src/components/wizard/QuestionView.jsx` (motor de render por tipo).
- `/src/pages`: Splash, Register, Dashboard, NewEvaluation (wizard), History, EvaluationDetail, Backups, Settings, Inventory, NewEquipment.
- PWA: manifest.json + service-worker.js (app shell offline) + icons.

## Implementado (Jul 2026)
- Splash (2s) -> Registro (una vez) / Dashboard.
- Registro con validación Zod; ciudad->unidad dependiente.
- Dashboard: header, 4 stats (incluye contador de equipos), acciones rápidas, actividad reciente, recuperación de borrador.
- Wizard: unidad (buscador) -> cuarto -> info auto -> fotos (IndexedDB blobs) -> preguntas dinámicas (visibleIf, auto-avance 400ms) -> resumen -> guardar. Folio EVA-AAAAMMDD-HHMMSS. Reglas: conmutador No oculta 7; servidores/switches=0 ocultan preguntas; recomendaciones automáticas.
- Historial + Detalle (inmutable) con generar/descargar/compartir PDF+JSON y eliminar en cascada.
- Respaldos: generar/descargar/compartir + log.
- Configuración: datos evaluador (matrícula fija), info sistema, catálogos, acerca de.
- PDF institucional (pdf-lib) tamaño Carta con secciones del formato 2025 (mapeo por pdfField) + nota legal + sello.

## Módulo de Inventario de Equipamiento — v1.1.0 (Jul 2026)
- **Registro y Edición Offline**: Formulario de captura y edición de activos. Selector de Tipo (`CORE`, `DVR`, `MODEM`, `NTU`, `PBX`, `ROUTER`, `SWITCH`, `UPS`), con carga en cascada de Marcas y Modelos del catálogo estático.
- **Entradas Personalizadas**: Opción de agregar Marcas/Modelos personalizados cuando no se encuentran en la lista; la aplicación recuerda las entradas y las agrega dinámicamente al menú desplegable para capturas posteriores.
- **Detalles y Estados**: Captura de serie física (obligatoria), botones rápidos de estado operativo (`Operativo`, `Requiere Mantenimiento`, `Dañado/Fuera de Servicio`), y campos opcionales de puertos (totales/ocupados), dirección IP, MAC y notas técnicas.
- **Listado y Filtros**: Buscador global de activos (por número de serie, marca, modelo, IP o MAC) con filtros colapsables de Ciudad, Unidad, Cuarto y Tipo de dispositivo.
- **Exportaciones Excel**:
  - Pestaña de `"Equipamiento"` integrada dentro del archivo Excel consolidado de respaldos.
  - Botón de exportación rápida en la lista de inventario (genera `inventario_filtrado.xlsx` respetando la búsqueda y filtros activos).
  - Tarjeta en la pantalla de respaldos para descargar un archivo Excel con el inventario completo.
- **Oficio Oficial**: Oculta el campo "Especificar Cargo" en la configuración del oficio a menos que se seleccione el tipo de atención "Otro", imprimiendo únicamente la especificación en el PDF (sin anteponer la palabra "Otro").

## Backlog / Próximos pasos
- P1: Ajuste fino del layout PDF vs. formato original (posiciones exactas, campos sin captura como Llaves/Tierra Física).
- P1: Reordenar/ampliar cuartos si el usuario entrega más datos.
- P2: JsonViewer y PDFPreview embebidos (hoy se descarga/comparte).
- P2: Íconos maskable definitivos / captura de pantalla para install prompt.
- P2: Migrar a TypeScript estricto si se requiere cumplir literal el PRD.
