# CLAUDE.md — JP Development

> Este archivo define el contexto, stack, convenciones y reglas de trabajo para todos los proyectos de JP Development. Claude debe leerlo al inicio de cada sesión y seguir estas guías sin excepción salvo indicación explícita del desarrollador.

---

## 🏢 Empresa

**JP Development** es una empresa de desarrollo de software enfocada en productos SaaS y plataformas web. Los proyectos son aplicaciones de producción real — el código debe ser limpio, seguro, performante y mantenible.

---

## 🧱 Stack Tecnológico

### Frontend
- **Framework:** Next.js (App Router preferido sobre Pages Router en proyectos nuevos)
- **Lenguaje:** TypeScript estricto (`strict: true` en tsconfig)
- **Estilos:** Tailwind CSS — utility-first, sin CSS modules ni styled-components salvo necesidad justificada
- **Estado global:** Zustand (preferido para estado simple/mediano) o Redux Toolkit (para estado complejo con muchas acciones)
- **Data fetching:** TanStack Query (React Query) para datos del servidor; `fetch` nativo o axios para llamadas directas

### Mobile
- **Framework:** React Native (Expo cuando el proyecto lo permite)
- **Lenguaje:** TypeScript estricto
- **Navegación:** React Navigation
- **Estilos:** StyleSheet de React Native o NativeWind (Tailwind para RN)

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js (APIs REST); se puede usar Next.js API Routes o Route Handlers para backends ligados al frontend
- **Lenguaje:** TypeScript estricto
- **Validación:** Zod para validación de schemas y tipos en runtime

### Base de Datos
- **Relacional:** PostgreSQL — acceso vía Supabase (preferido por BaaS features) o Prisma ORM directamente
- **NoSQL:** MongoDB con Mongoose o Prisma (MongoDB connector)
- **BaaS alternativo:** Firebase (Firestore, Auth, Storage) — principalmente en proyectos móviles o cuando el cliente ya lo usa
- **ORM/Query Builder:** Prisma ORM es el estándar para proyectos con PostgreSQL

### Infraestructura & Deploy
- **Frontend/Full-stack:** Vercel (Next.js) — deploy principal
- **Backend/APIs:** Railway (Node.js/Express standalone)
- **Cloud general:** AWS (S3 para storage, SES para email, Lambda cuando aplica)
- **Variables de entorno:** `.env.local` (desarrollo), `.env.production` (producción) — nunca committear secrets

---

## 🏗️ Principios de Arquitectura

### Principios SOLID (todos los proyectos)

Aplicar SOLID en **todo** código generado, sin excepción:

- **S — Single Responsibility:** cada clase, función o módulo tiene una única razón para cambiar. Si una función hace más de una cosa, separarla.
- **O — Open/Closed:** el código debe estar abierto para extensión pero cerrado para modificación. Preferir composición y abstracciones sobre modificar código existente.
- **L — Liskov Substitution:** las implementaciones concretas deben poder sustituir a sus abstracciones/interfaces sin romper el comportamiento.
- **I — Interface Segregation:** interfaces pequeñas y específicas. Nunca forzar a una clase a implementar métodos que no necesita.
- **D — Dependency Inversion:** depender de abstracciones (interfaces), no de implementaciones concretas. Inyectar dependencias, no instanciarlas internamente.

### Clean Architecture — Frontend (Next.js / React Native)

Todo proyecto frontend sigue Clean Architecture con separación estricta de capas. Las dependencias apuntan **siempre hacia adentro** (domain no conoce nada externo).

```
src/
├── app/                        # Capa de entrada — rutas y layouts (App Router)
│   ├── (auth)/
│   ├── api/                    # Route Handlers
│   └── layout.tsx
│
├── domain/                     # Capa de dominio — núcleo puro, sin dependencias externas
│   ├── entities/               # Entidades del negocio (tipos/clases puras)
│   ├── interfaces/             # Interfaces de repositorios y servicios
│   └── use-cases/              # Casos de uso (lógica de aplicación)
│
├── infrastructure/             # Capa de infraestructura — implementaciones concretas
│   ├── repositories/           # Implementaciones de los repositorios del dominio
│   └── services/               # Integraciones externas (APIs, storage, etc.)
│
├── presentation/               # Capa de presentación — UI y estado
│   ├── components/
│   │   ├── ui/                 # Componentes base reutilizables (Button, Modal, Dropdown...)
│   │   └── [feature]/          # Componentes específicos por feature
│   ├── hooks/                  # Custom hooks de React
│   └── store/                  # Stores de Zustand o slices de Redux
│
├── constants/                  # Constantes globales de la aplicación
├── utils/                      # Funciones utilitarias puras
└── types/                      # Tipos e interfaces globales de TypeScript
```

**Regla clave:** `domain/` nunca importa de `infrastructure/` ni de `presentation/`. `presentation/` solo consume casos de uso del dominio, nunca accede directamente a repositorios.

### Arquitectura Hexagonal + DDD — Backend (Node.js / Express)

Todo proyecto backend sigue Arquitectura Hexagonal con Domain-Driven Design. El dominio es el núcleo; todo lo demás son adaptadores.

```
src/
├── domain/                     # Núcleo del dominio — sin dependencias externas
│   ├── entities/               # Entidades y Value Objects del dominio
│   ├── repositories/           # Interfaces (ports) de repositorios
│   ├── services/               # Domain services (lógica de dominio pura)
│   └── events/                 # Domain events
│
├── application/                # Casos de uso — orquestan el dominio
│   ├── use-cases/              # Un archivo por caso de uso
│   ├── dtos/                   # Data Transfer Objects de entrada/salida
│   └── interfaces/             # Interfaces de servicios de aplicación
│
├── infrastructure/             # Adaptadores secundarios (driven) — detalles técnicos
│   ├── repositories/           # Implementaciones concretas de los ports del dominio
│   ├── database/               # Configuración de DB, cliente Prisma, seeders
│   └── services/               # Servicios externos (email, storage, terceros)
│
├── interfaces/                 # Adaptadores primarios (driving) — entrada al sistema
│   ├── http/
│   │   ├── controllers/        # Controllers — solo orquestan, sin lógica de negocio
│   │   ├── routes/             # Definición de rutas
│   │   └── middleware/         # Auth, validación, error handling, rate limiting
│   └── validators/             # Schemas de Zod para validación de requests
│
├── constants/                  # Constantes globales
├── utils/                      # Helpers y utilidades puras
├── types/                      # Tipos e interfaces globales
└── app.ts                      # Entry point
```

**Regla clave:** `domain/` es 100% puro — no importa Express, Prisma ni ningún framework. Los controllers nunca contienen lógica de negocio; delegan siempre a casos de uso.

---

## 📁 Separación de Responsabilidades por Archivo

**Regla fundamental:** cada archivo tiene una única responsabilidad. Nunca mezclar en el mismo archivo interfaces, constantes, servicios, utilidades y componentes.

- `types/` o `interfaces/` → solo definiciones de tipos e interfaces de TypeScript
- `constants/` → solo constantes (`UPPER_SNAKE_CASE`), agrupadas por dominio
- `services/` → solo lógica de integración con servicios externos o casos de uso
- `utils/` → solo funciones puras y helpers reutilizables
- `components/` → solo componentes de React, uno por archivo
- `hooks/` → solo custom hooks, uno por archivo
- `store/` → solo stores de estado global

Si al crear un archivo se necesita definir una interfaz, una constante y una función utilitaria → son **tres archivos distintos**.

### Tamaño de archivos

- Mantener cada archivo con el **menor código posible** — si un archivo crece, es señal de que hay que dividirlo
- Un archivo no debería superar ~100 líneas salvo casos justificados (componentes complejos con mucho JSX)
- Preferir composición y archivos pequeños sobre archivos grandes y monolíticos

---

## 🔧 Convenciones de Código

### TypeScript
- **Siempre** usar TypeScript estricto. Nunca usar `any` — preferir `unknown` y narrowing
- Definir tipos e interfaces en `/types`. Exportar desde `index.ts` del directorio
- Usar `type` para unions/intersections simples, `interface` para objetos extensibles
- Los tipos de respuesta de API deben estar siempre tipados explícitamente
- No usar `!` (non-null assertion) salvo cuando sea absolutamente inevitable y con comentario justificando

### Nomenclatura
- **Archivos:** `kebab-case` para archivos y carpetas (`user-profile.tsx`, `auth-middleware.ts`)
- **Componentes React:** `PascalCase` (`UserProfile`, `AuthModal`)
- **Variables y funciones:** `camelCase` (`getUserById`, `isAuthenticated`)
- **Constantes:** `UPPER_SNAKE_CASE` (`MAX_RETRY_COUNT`, `API_BASE_URL`)
- **Interfaces/Types:** `PascalCase` con prefijo descriptivo cuando sea necesario (`UserResponse`, `CreatePostInput`)
- **Hooks:** prefijo `use` + `PascalCase` (`useUserData`, `useLocalStorage`)
- **Stores Zustand:** prefijo `use` + nombre del store (`useAuthStore`, `useCartStore`)

### Componentes React

- Usar **function components** siempre — nunca class components
- **Un componente por archivo**, sin excepciones
- Props tipadas con `interface` definida en el archivo de tipos correspondiente, no en el mismo archivo del componente
- Extraer lógica compleja a custom hooks en `hooks/`
- Evitar componentes de más de ~100 líneas — dividir en subcomponentes

**Creación de componentes — reglas estrictas:**

- Ante cualquier elemento de UI nuevo (sección, card, formulario, lista, ítem), crear un componente nuevo en su propio archivo
- Si se necesita un **modal, dropdown, tooltip, popover, drawer, dialog** o cualquier elemento flotante/overlay → crear siempre un componente reutilizable en `components/ui/` que acepte props genéricas, no uno ad-hoc inline
- Si se detecta que dos partes del código renderizan algo visualmente similar → extraer a un componente compartido inmediatamente
- Los componentes de `components/ui/` deben ser completamente agnósticos al dominio — solo reciben props y renderizan

```typescript
// ✅ Correcto — interfaz en types/, componente en su propio archivo
// types/user.types.ts
export interface UserCardProps {
  user: User;
  onSelect: (id: string) => void;
}

// presentation/components/user/UserCard.tsx
import type { UserCardProps } from '@/types/user.types';

export function UserCard({ user, onSelect }: UserCardProps) {
  // ...
}

// ✅ Correcto — modal reutilizable
// presentation/components/ui/ConfirmModal.tsx
export function ConfirmModal({ isOpen, title, description, onConfirm, onCancel }: ConfirmModalProps) {
  // ...
}

// ❌ Incorrecto — todo mezclado en un archivo
export default function({ user, onSelect }: any) {
  // interfaz, lógica, constantes y JSX en el mismo lugar
}
```

### Estilos con Tailwind
- Ordenar clases de Tailwind con `prettier-plugin-tailwindcss`
- Extraer clases repetidas a componentes, no a `@apply` (salvo en casos muy justificados)
- Usar variantes de Tailwind para responsive y dark mode: `sm:`, `md:`, `dark:`
- Para variantes condicionales de clases, usar la librería `clsx` o `cn` (shadcn/ui pattern)

### Manejo de Errores
- En el backend, usar un middleware global de error handling — no manejar errores en cada controller individualmente
- Usar clases de error customizadas (`AppError`, `ValidationError`, `NotFoundError`)
- En el frontend, usar Error Boundaries para errores de render y try/catch para async
- Nunca hacer `catch(e) {}` silencioso — siempre loguear o propagar

### Comentarios en Backend

Todo elemento del backend debe tener un comentario JSDoc que describa su propósito. Esto aplica a funciones, controllers, rutas, middlewares, services y casos de uso.

```typescript
// ✅ Correcto

/**
 * Obtiene el perfil de un usuario por su ID.
 * Lanza NotFoundError si el usuario no existe.
 */
async function getUserById(id: string): Promise<User> {
  // ...
}

/**
 * Controller que maneja la creación de un nuevo producto.
 * Valida el body con Zod y delega la lógica al caso de uso CreateProductUseCase.
 */
async function createProduct(req: Request, res: Response): Promise<void> {
  // ...
}

/**
 * Middleware que verifica que el request tenga un JWT válido.
 * Adjunta el usuario decodificado en req.user.
 */
function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  // ...
}

// ❌ Incorrecto — sin comentario
async function deleteUser(id: string) {
  // ...
}
```

**Regla:** el comentario debe describir el **qué y el porqué**, no el cómo. Si la función lanza errores conocidos o tiene precondiciones importantes, documentarlas también.

### Async/Await
- Siempre preferir `async/await` sobre `.then().catch()`
- Nunca hacer `await` dentro de un `forEach` — usar `Promise.all()` o `for...of`
- Las funciones async siempre deben tener manejo de error explícito

---

## 🔐 Seguridad (SIEMPRE priorizar)

- **Nunca** hardcodear secrets, API keys o credenciales en el código
- Todas las variables de entorno sensibles van en `.env*` y en `.gitignore`
- Validar y sanitizar **toda** entrada del usuario en el servidor — nunca confiar solo en validación del cliente
- Usar Zod (o equivalente) para validar request bodies, query params y datos externos
- Implementar rate limiting en endpoints públicos
- En Supabase/PostgreSQL: usar Row Level Security (RLS) y respetar el principio de mínimo privilegio
- CORS configurado explícitamente — nunca `origin: '*'` en producción
- Headers de seguridad: Content-Security-Policy, X-Frame-Options, etc. (usar `helmet` en Express)
- Autenticación: verificar JWT/sesión en el servidor, no confiar en el estado del cliente
- Al mostrar datos de usuario, siempre escapar para prevenir XSS

---

## ⚡ Performance

- Usar `React.memo`, `useMemo` y `useCallback` **solo cuando haya un problema de performance medible** — no de forma prematura
- En Next.js: aprovechar Server Components para reducir JS del cliente; usar Client Components solo cuando sea necesario (interactividad, hooks)
- Imágenes siempre con el componente `<Image>` de Next.js (optimización automática)
- Lazy loading de componentes pesados con `dynamic()` de Next.js o `React.lazy`
- En queries a DB: nunca hacer N+1 queries — usar joins o includes de Prisma
- Paginar resultados de listas — nunca traer todos los registros sin límite
- Usar índices en las columnas que se usan frecuentemente en WHERE o JOIN

---

## 🧪 Testing

- **Framework:** Jest (Node.js/backend) o Vitest (proyectos Vite/Next.js)
- **Testing Library:** React Testing Library para componentes
- Escribir tests para: lógica de negocio crítica, funciones utilitarias complejas, API endpoints principales
- Los tests deben testear **comportamiento**, no implementación interna
- Naming de tests: `describe('NombreComponente/función', () => { it('should hacer algo cuando condición', ...) })`
- No mockear la base de datos si es evitable — preferir una DB de test real o in-memory
- Los tests deben poder correr con `npm test` o `npm run test`

---

## 📝 Git & Control de Versiones

### Ramas
```
main          → producción (protegida, solo merge via PR)
develop       → rama de integración
feature/xxx   → nuevas funcionalidades (desde develop)
fix/xxx       → corrección de bugs (desde develop)
hotfix/xxx    → fixes urgentes en producción (desde main)
release/x.x.x → preparación de releases
```

### Conventional Commits
Formato: `tipo(scope): descripción en imperativo`

```
feat(auth): add Google OAuth login
fix(api): handle null user in profile endpoint
chore(deps): update Next.js to 15.1.0
refactor(store): migrate auth store to Zustand
test(user): add unit tests for user service
docs(readme): update setup instructions
perf(db): add index on users.email column
```

**Tipos válidos:** `feat`, `fix`, `chore`, `refactor`, `test`, `docs`, `style`, `perf`, `ci`

### Pull Requests
- Cada PR debe tener descripción explicando el qué y el porqué
- PRs pequeños y atómicos — una funcionalidad o fix por PR
- No mergear PRs sin al menos una revisión (cuando hay equipo)

---

## 🌿 Variables de Entorno

```bash
# Desarrollo
.env.local          # Variables locales (gitignored)
.env.example        # Template con nombres de variables sin valores (commiteado)

# Producción
# Configuradas en Vercel/Railway dashboard — nunca en archivos commiteados
```

**Regla:** Si agregas una variable de entorno nueva, **siempre** actualizar `.env.example` con el nombre y un comentario descriptivo.

---

## 🚫 Reglas Específicas para Claude

### Lo que Claude DEBE hacer
- Seguir estrictamente las convenciones de este archivo
- Aplicar principios SOLID en **todo** código generado, siempre
- Respetar Clean Architecture en frontend y Arquitectura Hexagonal + DDD en backend
- Usar TypeScript con tipos explícitos en todo código generado
- Validar inputs con Zod en cualquier endpoint o función que reciba datos externos
- Considerar implicaciones de seguridad y performance en cada cambio
- Cuando haga cambios no obvios o decisiones de arquitectura, explicar brevemente el porqué
- Respetar la estructura de carpetas existente del proyecto
- Mantener consistencia con el estilo de código ya existente en el archivo que se está editando
- Agregar comentario JSDoc a **toda** función, controller, middleware, route y service del backend
- Crear archivos con el **menor código posible** — si hay duda, dividir en más archivos
- Separar siempre interfaces, constantes, servicios y utils en sus carpetas correspondientes, nunca en el mismo archivo donde se usan
- Ante cualquier nuevo elemento de UI, crear un componente nuevo en su propio archivo
- Si se necesita un modal, dropdown, tooltip, drawer u overlay → crear un componente reutilizable en `components/ui/`

### Lo que Claude NO DEBE hacer
- ❌ Agregar comentarios obvios o redundantes en el cuerpo del código (`// incrementa el contador`, `// retorna el usuario`) — los JSDoc de funciones y controllers son obligatorios, los comentarios inline innecesarios no
- ❌ Reorganizar, renombrar o mover archivos sin que se lo pidan explícitamente
- ❌ Usar `any` en TypeScript
- ❌ Hardcodear valores que deberían ser variables de entorno o constantes
- ❌ Crear archivos de documentación (README, CHANGELOG) salvo que se pidan
- ❌ Instalar dependencias nuevas sin mencionarlo y justificarlo
- ❌ Cambiar la estructura de carpetas del proyecto sin pedirlo
- ❌ Hacer `console.log` en código de producción (usar un logger apropiado)
- ❌ Usar `var` — siempre `const` o `let`
- ❌ Funciones de más de ~50 líneas sin justificación — preferir composición
- ❌ Mezclar interfaces, constantes, servicios o utils dentro del mismo archivo de un componente o controller
- ❌ Escribir lógica de negocio en controllers (backend) ni en componentes de UI (frontend)
- ❌ Saltarse la separación de capas de Clean Architecture o Hexagonal — por ejemplo, que un componente de presentación llame directamente a un repositorio, o que el dominio importe Express/Prisma

### Cuando Claude no está seguro
- Si hay ambigüedad sobre cómo implementar algo, preguntar antes de escribir código
- Si se detecta un problema de seguridad o performance en código existente, mencionarlo aunque no sea el foco de la tarea
- Si la tarea requiere instalar dependencias nuevas, listarlas y esperar confirmación

---

## 🛠️ Comandos Comunes

```bash
# Desarrollo
npm run dev           # Servidor de desarrollo
npm run build         # Build de producción
npm run start         # Servidor de producción

# Calidad de código
npm run lint          # ESLint
npm run lint:fix      # ESLint con auto-fix
npm run format        # Prettier
npm run type-check    # TypeScript sin compilar (tsc --noEmit)

# Testing
npm test              # Correr tests
npm run test:watch    # Tests en modo watch
npm run test:coverage # Coverage report

# Base de datos (Prisma)
npx prisma migrate dev        # Crear y aplicar migración en desarrollo
npx prisma migrate deploy     # Aplicar migraciones en producción
npx prisma studio             # GUI para explorar la DB
npx prisma generate           # Regenerar cliente de Prisma
npx prisma db seed            # Correr seeders
```

---

## 📦 Dependencias Estándar

### Frontend (Next.js)
```json
{
  "dependencies": {
    "next": "latest",
    "react": "latest",
    "react-dom": "latest",
    "typescript": "latest",
    "tailwindcss": "latest",
    "zustand": "latest",
    "@tanstack/react-query": "latest",
    "zod": "latest",
    "clsx": "latest",
    "tailwind-merge": "latest"
  }
}
```

### Backend (Express)
```json
{
  "dependencies": {
    "express": "latest",
    "typescript": "latest",
    "zod": "latest",
    "prisma": "latest",
    "@prisma/client": "latest",
    "helmet": "latest",
    "cors": "latest",
    "dotenv": "latest",
    "express-rate-limit": "latest"
  }
}
```

---

*Última actualización: Mayo 2026 — JP Development (v2)*