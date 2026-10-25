# Contributing to Jesus Hernandez Portfolio

Gracias por tu interés en contribuir a este proyecto. Aquí encontrarás las guías y mejores prácticas para el desarrollo.

## 🚀 Comenzando

### Setup Inicial

```bash
# Clonar repositorio
git clone https://github.com/jesus0091/my-portfolio-web.git
cd my-portfolio-web

# Instalar dependencias
npm install

# Iniciar desarrollo
npm run dev
```

## 📝 Convenciones de Código

### TypeScript

- ✅ Usar tipos explícitos siempre que sea posible
- ✅ Evitar `any`, usar `unknown` si es necesario
- ✅ Exportar tipos e interfaces cuando sean reutilizables
- ✅ Usar tipos de Next.js cuando estén disponibles

```typescript
// ✅ Correcto
interface Props {
  title: string;
  count: number;
}

export function Component({ title, count }: Props) {
  // ...
}

// ❌ Incorrecto
function Component(props: any) {
  // ...
}
```

### React Components

- ✅ Usar `function` en lugar de `const` para componentes
- ✅ Usar React Hooks correctamente (orden, dependencias)
- ✅ Memoizar solo cuando sea necesario
- ✅ Nombrar componentes con PascalCase

```typescript
// ✅ Correcto
export default function MyComponent() {
  const [state, setState] = useState(0);
  
  useEffect(() => {
    // ...
  }, [state]);
  
  return <div>{state}</div>;
}

// ❌ Incorrecto
export default () => {
  // ...
}
```

### Styling

- ✅ Preferir Tailwind CSS para estilos utilitarios
- ✅ Usar clases y variables CSS para estilos complejos
- ✅ Usar variables CSS para temas (ver `globals.css`)
- ✅ Mobile-first approach

```tsx
// ✅ Correcto
<div className="flex items-center gap-4 md:gap-6">
  {/* content */}
</div>

```

### Animaciones

- ✅ Usar GSAP para animaciones complejas
- ✅ Respetar `prefers-reduced-motion`
- ✅ Limpiar animaciones en cleanup (useEffect return)
- ✅ Usar `will-change` con moderación

```typescript
useEffect(() => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  const ctx = gsap.context(() => {
    gsap.to(elementRef.current, {
      opacity: 1,
      duration: 0.5,
    });
  }, containerRef);

  return () => ctx.revert();
}, []);
```

## 🧪 Testing

### Escribir Tests

```bash
# Ejecutar tests
npm test

# Watch mode
npm test -- --watch

# Comprobar tipos
npm run type-check
```

### Guías de Testing

- Usar Vitest (`describe`, `it`, `expect`) en archivos `*.test.ts` junto al código.
- Probar comportamiento y reglas de contenido, URLs, traducciones y SEO.
- React Testing Library y Playwright no están instalados. Las pruebas actuales no cubren interacciones en navegador.
- Verificar manualmente teclado, móvil, cambio de idioma, anclas y movimiento reducido antes de publicar cambios de interfaz.

## 📐 Estructura de Archivos

```
src/
├── app/                  # Next.js App Router
│   ├── [route]/         # Rutas dinámicas
│   ├── layout.tsx       # Layout principal
│   ├── page.tsx         # Páginas
│   ├── error.tsx        # Error boundaries
│   └── globals.css      # Estilos globales
├── components/          # Componentes React
│   ├── [Feature]/      # Componentes agrupados por feature
│   └── Shared.tsx      # Componentes compartidos
├── i18n/               # Navegación, traducciones y SEO
├── data/               # Proyectos y servicios
└── lib/                # Blog, contacto, sonido y animación
```

## 🎨 Accesibilidad

- ✅ Usar etiquetas HTML semánticas
- ✅ Incluir atributos ARIA cuando sea necesario
- ✅ Asegurar contraste de color (WCAG AA)
- ✅ Soporte de teclado para interacciones
- ✅ Textos alternativos en imágenes

```tsx
// ✅ Correcto
<button
  type="button"
  aria-label="Close menu"
  onClick={handleClose}
>
  <IconX />
</button>

// ❌ Incorrecto
<div onClick={handleClose}>
  <IconX />
</div>
```

## 🚦 Git Workflow

### Commits

Usar [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new project card component
fix: resolve navbar scroll issue
docs: update README with new instructions
style: format code with prettier
refactor: simplify theme controller logic
test: add tests for button component
chore: update dependencies
```

### Branches

- `main` - Producción
- `develop` - Desarrollo
- `feature/[name]` - Nuevas features
- `fix/[name]` - Bug fixes

## 🔍 Code Review Checklist

Antes de crear un Pull Request, verifica:

- [ ] El código compila sin errores (`npm run build`)
- [ ] Los tests pasan (`npm test`)
- [ ] No hay errores de linting (`npm run lint`)
- [ ] El código está formateado
- [ ] Se actualizó documentación relevante
- [ ] Se testeó en diferentes navegadores
- [ ] Se verificó accesibilidad
- [ ] Se testeó en mobile

## 📱 Responsive Design

Breakpoints de Tailwind:

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

```tsx
// Mobile first
<div className="text-sm md:text-base lg:text-lg">
  Content
</div>
```

## 🎯 Performance

- ✅ Usar Next/Image para imágenes
- ✅ Lazy loading de componentes pesados
- ✅ Code splitting estratégico
- ✅ Minimizar re-renders innecesarios
- ✅ Optimizar bundle size

```tsx
// Lazy loading
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Skeleton />,
  ssr: false,
});
```

## 🐛 Debugging

```bash
# Type checking
npm run type-check

# Build para ver errores
npm run build

# Ver JavaScript inicial por ruta
npm run build
```

## 📚 Recursos

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [GSAP Docs](https://greensock.com/docs/)

## ❓ Preguntas

Si tienes preguntas, contacta a:
- 📧 Email: jesushernandez120491@gmail.com
- 💼 LinkedIn: [jesushernandez91](https://www.linkedin.com/in/jesushernandez91/)

---

**¡Gracias por contribuir! 🚀**
