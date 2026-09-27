# 🎨 Jesus Hernandez - Portfolio

Portfolio personal de Jesus Hernandez, AI-Driven Engineer & Product Designer especializado en React, Next.js, y la creación de experiencias digitales pulidas.

![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19.1.0-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1-38B2AC?style=flat-square&logo=tailwind-css)

## ✨ Características

- ⚡️ **Next.js 15** con App Router
- ⚛️ **React 19** - Última versión
- 🎨 **Styled Components** + **Tailwind CSS 4**
- 🌈 **GSAP** - Animaciones fluidas y complejas
- 🌓 **Tema claro/oscuro** con persistencia
- 📱 **100% Responsive** - Mobile-first design
- ♿ **Accesible** - WCAG 2.1 AA compliant
- 🔍 **SEO Optimizado** - Meta tags, Open Graph, Schema.org
- 🧪 **Testing** - Jest + React Testing Library
- 📦 **TypeScript** - Type-safe code

## 🚀 Inicio Rápido

### Prerequisitos

- Node.js 18+ 
- npm, yarn, pnpm o bun

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/jesus0091/my-portfolio-web.git

# Navegar al directorio
cd my-portfolio-web

# Instalar dependencias
npm install
# o
yarn install
# o
pnpm install
```

### Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev

# El sitio estará disponible en http://localhost:3000
```

### Build para Producción

```bash
# Crear build optimizado
npm run build

# Iniciar servidor de producción
npm start
```

### Testing

```bash
# Ejecutar tests
npm test

# Tests en modo watch
npm test -- --watch
```

### Linting

```bash
# Ejecutar ESLint
npm run lint
```

## 📁 Estructura del Proyecto

```
my-portfolio-web/
├── public/
│   ├── images/          # Imágenes y assets
│   └── *.svg           # Iconos SVG
├── src/
│   ├── app/
│   │   ├── about/      # Página About
│   │   ├── projects/   # Página Projects
│   │   ├── layout.tsx  # Layout principal
│   │   ├── page.tsx    # Página home
│   │   ├── error.tsx   # Error boundary
│   │   └── not-found.tsx # 404 page
│   └── components/
│       ├── AboutMe/    # Componentes de About
│       ├── Projects/   # Componentes de Projects
│       └── ...         # Componentes compartidos
├── jest.config.js      # Configuración de Jest
├── next.config.ts      # Configuración de Next.js
├── tailwind.config.ts  # Configuración de Tailwind
└── tsconfig.json       # Configuración de TypeScript
```

## 🎨 Stack Tecnológico

### Frontend
- **Next.js 15.5.4** - React framework
- **React 19.1.0** - UI library
- **TypeScript 5** - Type safety
- **Tailwind CSS 4** - Utility-first CSS
- **Styled Components 6** - CSS-in-JS

### Animaciones
- **GSAP 3.13** - Professional animations
- **ScrollTrigger** - Scroll-based animations

### Estado & Temas
- **Context API** - Theme management
- **localStorage** - Theme persistence

### Testing
- **Jest 30** - Testing framework
- **React Testing Library 16** - Component testing
- **@testing-library/jest-dom** - Custom matchers

### Iconos
- **@tabler/icons-react** - Icon library

## 🌐 Deployment

El proyecto está optimizado para desplegar en:

- **Vercel** (recomendado) - Zero-config deployment
- **Netlify**
- **AWS Amplify**
- Cualquier plataforma que soporte Next.js

### Deploy en Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel
```

O conecta tu repositorio de GitHub directamente en [vercel.com](https://vercel.com)

## 🔧 Configuración

### Variables de Entorno

Actualmente el proyecto no requiere variables de entorno. Si necesitas añadir alguna:

1. Crea un archivo `.env.local`
2. Añade tus variables:
```env
NEXT_PUBLIC_API_URL=https://api.example.com
```

### Personalización

- **Colores**: Edita `src/app/globals.css` (variables CSS)
- **Fuentes**: Configura en `src/app/layout.tsx`
- **Animaciones**: Ajusta en componentes individuales con GSAP
- **Metadata**: Actualiza en `src/app/layout.tsx`

## 📝 Mejoras Implementadas

✅ Eliminación de tests de práctica  
✅ Corrección de archivos duplicados  
✅ Nombres de funciones en páginas corregidos  
✅ Error boundaries (error.tsx, not-found.tsx, global-error.tsx)  
✅ Referencias de iconos corregidas  
✅ Documentación completa  

## 📄 Licencia

Este proyecto es de código privado y propiedad de Jesus Hernandez.

## 👤 Autor

**Jesus Hernandez**

- 🌐 Website: [jesushernandez.vercel.app](https://jesushernandez.vercel.app)
- 💼 LinkedIn: [@jesushernandez91](https://www.linkedin.com/in/jesushernandez91/)
- 🐙 GitHub: [@jesus0091](https://github.com/jesus0091)
- 🎨 Behance: [@devjesushernandez](https://www.behance.net/devjesushernandez)
- 📧 Email: jesushernandez120491@gmail.com

## 🙏 Agradecimientos

- Next.js Team por el excelente framework
- Vercel por el hosting
- GSAP por las animaciones profesionales
- Comunidad de React y TypeScript

---

**Hecho con ❤️ por Jesus Hernandez**
