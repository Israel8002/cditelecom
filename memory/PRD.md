# PRD — Sistema de Evaluación de Cuartos de Telecomunicaciones (IMSS)

## Problema / Visión
PWA profesional 100% offline para Ingenieros de Telecom del IMSS (Coord. Delegacional de Informática, OOAD Baja California). Sustituye el proceso actual en AppSheet. Todo local en IndexedDB, sin backend, sin auth, sin APIs externas. PDF y JSON generados localmente; el usuario decide respaldar manualmente.

## Stack (decisión)
El PRD pedía Next.js 15 + TS. Por estabilidad en el entorno de desarrollo (frontend servido en :3000 vía CRACO), se implementó en **React 19 + CRACO (JavaScript)** manteniendo la arquitectura dirigida por catálogos exigida por el Anexo A. Sin backend/Mongo (FastAPI queda sin uso). Librerías: idb, zustand, zod, react-hook-form, framer-motion, pdf-lib, lucide-react, tailwind, sonner.

## Arquitectura (Configuration Driven)
- `/src/catalogs`: cities, units (74), rooms (177), sections, questions (41), pdf-layout, json-schema, constants, appConfig. Catálogos generados desde CATALOGO.txt del usuario (5 ciudades BC).
- `/src/services`: catalog (visibilidad/score/recomendaciones), storage (IndexedDB CRUD), json, pdf (pdf-lib, formato institucional), backup, log, format.
- `/src/stores`: user.store, evaluation.store (zustand, guardado inmediato en IndexedDB).
- `/src/db/indexeddb.js`: db `telecom-imss` v1 (usuarios, evaluaciones, fotografias, respaldos, logs, configuracion).
- `/src/components` + `/src/components/wizard/QuestionView.jsx` (motor de render por tipo).
- `/src/pages`: Splash, Register, Dashboard, NewEvaluation (wizard), History, EvaluationDetail, Backups, Settings.
- PWA: manifest.json + service-worker.js (app shell offline) + icons.

## Implementado (Jul 2026)
- Splash (2s) -> Registro (una vez) / Dashboard.
- Registro con validación Zod; ciudad->unidad dependiente.
- Dashboard: header, 4 stats, acciones rápidas, actividad reciente, recuperación de borrador.
- Wizard: unidad (buscador) -> cuarto -> info auto -> fotos (IndexedDB blobs) -> preguntas dinámicas (visibleIf, auto-avance 400ms) -> resumen -> guardar. Folio EVA-AAAAMMDD-HHMMSS. Reglas: conmutador No oculta 7; servidores/switches=0 ocultan preguntas; recomendaciones automáticas.
- Historial + Detalle (inmutable) con generar/descargar/compartir PDF+JSON y eliminar en cascada.
- Respaldos: generar/descargar/compartir + log.
- Configuración: datos evaluador (matrícula fija), info sistema, catálogos, acerca de.
- PDF institucional (pdf-lib) tamaño Carta con secciones del formato 2025 (mapeo por pdfField) + nota legal + sello.

## Cambios recientes (Jul 2026)
- Fix PDF: `safeText()` normaliza subíndices (CO₂→CO2) — resolvía "WinAnsi cannot encode ₂".
- Q011 objetos ajenos: opciones ahora Sí/No (Sí=conforme); recomendación "Retirar objetos ajenos en el cuarto." al responder No.
- Nuevas preguntas mapeadas al PDF: Cuarto delimitado (Control), Corriente regulada / Tierra física Rack/Gab / Tierra física equipos (Energía-UPS), Nodos de voz y Nodos de voz funcionando (Infraestructura). Q021/Q022 renombradas a "nodos de datos instalados/funcionando".
- PDF: bloque de identificación reordenado en 2 columnas sin marcos ni líneas.

## Backlog / Próximos pasos- P1: Ajuste fino del layout PDF vs. formato original (posiciones exactas, campos sin captura como Llaves/Tierra Física).
- P1: Reordenar/ampliar cuartos si el usuario entrega más datos.
- P2: JsonViewer y PDFPreview embebidos (hoy se descarga/comparte).
- P2: Íconos maskable definitivos / captura de pantalla para install prompt.
- P2: Migrar a TypeScript estricto si se requiere cumplir literal el PRD.
