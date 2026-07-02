# Sistema de Evaluación de Cuartos de Telecomunicaciones (IMSS)
### Coordinación Delegacional de Informática — OOAD Baja California

Este proyecto es una Aplicación Web Progresiva (PWA) diseñada para que los ingenieros de telecomunicaciones del IMSS realicen auditorías y evaluaciones de cuartos de comunicaciones en sitio de forma **100% offline**.

Para consultar la guía detallada de operación, instalación y características de la aplicación, por favor revisa el **[Manual de Usuario](MANUAL_USUARIO.md)**.

---

## Estructura del Proyecto

* **`/frontend`**: Aplicación de cliente desarrollada en **React 19 + CRACO (JavaScript)**. Utiliza TailwindCSS para estilos, IndexedDB (`idb`) para almacenamiento local y `pdf-lib` para la generación local de reportes institucionales en PDF.
* **`/backend`**: API en **FastAPI + MongoDB (Motor/Pydantic)**. *Nota: Siguiendo las definiciones de arquitectura offline-first del PRD, esta carpeta se mantiene únicamente como referencia y no es requerida para el funcionamiento en producción del cliente.*

---

## Guía de Desarrollo (Frontend)

Para ejecutar o compilar el frontend localmente en tu entorno de desarrollo, sigue los siguientes pasos:

### 1. Requisitos Previos
Asegúrate de tener instalado:
* **Node.js** (versión 18 o superior recomendada)
* **npm** o **Yarn**

### 2. Instalar Dependencias
Dirígete a la carpeta del frontend e instala los paquetes necesarios:
```bash
cd frontend
# Si usas Yarn
yarn install
# Si usas npm
npm install --legacy-peer-deps
```

### 3. Ejecutar en Servidor de Desarrollo
Para levantar el servidor de desarrollo local con recarga automática:
```bash
# Si usas Yarn
yarn start
# Si usas npm
npm start
```
La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

### 4. Compilar para Producción (Build)
Para generar el paquete optimizado listo para subir a un hosting gratuito (Vercel, Netlify, Cloudflare Pages, etc.):
```bash
# Si usas Yarn
yarn build
# Si usas npm
npm run build
```
Este comando creará una carpeta llamada **`build`** dentro de `/frontend`. El contenido de esa carpeta es todo lo que necesitas desplegar.

---

## Tecnologías Utilizadas en el Frontend
* **React 19** - Librería para la interfaz de usuario.
* **CRACO** - Configuración personalizada de la compilación de React.
* **TailwindCSS** & **Shadcn/ui** - Diseño visual y componentes de interfaz premium.
* **idb (IndexedDB)** - Almacenamiento local para evaluaciones, borradores, logs y fotos.
* **Zustand** - Manejo de estados de la aplicación de forma ligera y ágil.
* **Zod** - Validación de formularios de registro y datos técnicos.
* **pdf-lib** - Motor cliente de generación de archivos PDF tamaño carta institucionales.
* **Framer Motion** - Micro-animaciones y transiciones fluidas.
