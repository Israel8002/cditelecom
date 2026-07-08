# Sistema de Evaluación de Cuartos de Telecomunicaciones (IMSS)

[![React Version](https://img.shields.io/badge/react-19.0.0-blue.svg)](https://react.dev/)
[![PWA](https://img.shields.io/badge/PWA-100%25%20Offline-green.svg)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![User Manual](https://img.shields.io/badge/Documentaci%C3%B3n-Manual%20de%20Usuario-brightgreen)](MANUAL_USUARIO.md)

### 🏥 Coordinación Delegacional de Informática — OOAD Baja California

Este proyecto es una **Aplicación Web Progresiva (PWA)** diseñada para que los ingenieros de telecomunicaciones del IMSS realicen auditorías y evaluaciones de cuartos de comunicaciones en sitio de forma **100% offline-first**. 

El sistema elimina el uso de papel y la dependencia de plataformas de terceros, ejecutándose de forma segura y directa en el navegador de cualquier dispositivo (móvil, tableta o computadora) sin necesidad de conexión activa a internet ni de servidores externos durante su operación.

---

## 🚀 Características Clave

* 📶 **Operación 100% Offline:** Funcionamiento garantizado en sótanos, zonas remotas o áreas sin cobertura de red. El Service Worker cachea todos los recursos críticos.
* 💾 **Almacenamiento IndexedDB Seguro:** Persistencia local robusta a través de la librería `idb` para guardar perfiles, evaluaciones completadas, fotos (como Blobs) y borradores.
* 📝 **Recuperación Inteligente de Borradores:** Si sales o cierras el navegador accidentalmente, el Dashboard detectará tu sesión activa y te permitirá reanudarla exactamente en el paso donde te quedaste sin repetir campos de registro.
* 📦 **Inventario de Equipamiento en Sitio (v1.2.0):** Gestión offline de switches, ruteadores, UPS y más, mapeados a catálogos dinámicos (148 modelos). Permite registrar marcas/modelos personalizados y exportar hojas Excel dedicadas.
  * **Escaneo de Código de Barras (Sin Permisos):** Integración nativa delegada a la cámara del sistema operativo para capturar números de serie sin requerir permisos del navegador.
  * **Flujo Continuo de Captura:** Modal inteligente que limpia especificaciones de equipo manteniendo la ubicación intacta para cargas consecutivas rápidas.
  * **Orden por Novedad:** Listado del inventario ordenado de forma automática mostrando el último dispositivo capturado al inicio.
* 📄 **Generación Local de Reportes PDF (`pdf-lib`):**
  * **Reporte de Evaluación:** Reporte formal institucional (formato 2026 de 2 columnas) con puntuaciones, clasificaciones de cumplimiento, recomendaciones técnicas y firma digital en Base64. Cuenta con un algoritmo de **escalado dinámico inteligente para garantizar que el reporte quepa obligatoriamente en una sola página**.
  * **Reporte Fotográfico:** Cuadrícula de fotos 2x2 optimizada para impresión con protección contra fallos en renderizado.
  * **Oficio de Evaluación:** Oficio formal dirigido a la dirección médica con justificación de texto al vuelo e integración directa de recomendaciones.
* 📊 **Exportación a Excel (`xlsx`):** Módulo de filtrado avanzado (por año o rango de fechas) para descargar datos acumulados consolidados.
* 📱 **Instalable (PWA):** Interfaz inmersiva a pantalla completa y acceso directo desde el escritorio en iOS, Android y Windows/macOS.

---

## 🛠️ Stack Tecnológico

El proyecto está diseñado bajo un enfoque modular y optimizado en peso para garantizar una rápida instalación y respuesta offline:

* **Frontend Principal:** React 19, CRACO, TailwindCSS y componentes estilizados con Shadcn/ui.
* **Manejo de Estados:** Zustand (ligero y óptimo para evitar re-renders innecesarios).
* **Base de Datos Local:** IndexedDB manejado por la librería `idb`.
* **Validación de Datos:** Zod (para asegurar la integridad de campos obligatorios, matrículas y firmas).
* **Motor PDF:** `pdf-lib` para renderizar documentos binarios directamente en el cliente.
* **Diseño Dinámico:** Framer Motion para micro-animaciones fluidas.

---

## 📁 Estructura del Proyecto

* **`/frontend`**: Código fuente de la interfaz de usuario en React. Contiene las vistas del Dashboard, el Wizard de evaluaciones paso a paso, el visor de PDF y la exportación de respaldos.
* **`/backend`**: Referencia de la API en FastAPI + MongoDB. *(Nota: Siguiendo las definiciones de arquitectura offline-first, esta carpeta se mantiene únicamente como referencia histórica/futura y no es requerida para el funcionamiento offline del cliente en producción).*
* **`MANUAL_USUARIO.md`**: Manual técnico y operativo completo para usuarios e ingenieros administradores.

---

## 💻 Guía de Instalación y Desarrollo (Local)

Para levantar o compilar el frontend localmente en tu máquina de desarrollo, realiza lo siguiente:

### 1. Requisitos Previos
* **Node.js** (versión 18 o superior recomendada)
* **npm** o **Yarn**

### 2. Instalar Dependencias
Accede a la carpeta `/frontend` e instala los paquetes requeridos:
```bash
cd frontend

# Usando npm (se recomienda usar --legacy-peer-deps por compatibilidad con React 19)
npm install --legacy-peer-deps

# O usando Yarn
yarn install
```

### 3. Levantar Servidor de Desarrollo
Para correr la aplicación de forma local con recarga en caliente:
```bash
# Con npm
npm start

# Con Yarn
yarn start
```
Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### 4. Compilar para Producción (Build)
Para generar los archivos estáticos listos para subir a producción (por ejemplo, en plataformas como Vercel, Netlify, Cloudflare Pages o IIS local):
```bash
# Con npm
npm run build

# Con Yarn
yarn build
```
Esto creará el directorio `/frontend/build` optimizado para producción.

> [!IMPORTANT]
> **Nota de Seguridad HTTPS:** Las capacidades de PWA (instalabilidad y Service Worker) y la geolocalización requieren obligatoriamente un entorno bajo **HTTPS** en producción. En localhost, las PWA funcionan bajo HTTP normal para pruebas de desarrollo.

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Consulta el archivo [LICENSE](LICENSE) para obtener más detalles.
