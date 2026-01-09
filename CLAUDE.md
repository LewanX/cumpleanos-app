# Reglas del Proyecto - MarquitosCumple

## Angular MCP Server
Este proyecto usa el MCP server de Angular. Siempre utilizar las herramientas del MCP de Angular para:
- Consultar mejores prácticas (`get_best_practices`)
- Buscar documentación (`search_documentation`)
- Listar proyectos (`list_projects`)

## TypeScript Best Practices
- Usar strict type checking
- Preferir inferencia de tipos cuando sea obvio
- Evitar el tipo `any`; usar `unknown` cuando el tipo sea incierto

## Angular Best Practices
- **Siempre usar standalone components** (NO NgModules)
- **NO establecer `standalone: true`** en decoradores - es el valor por defecto
- Usar **signals** para manejo de estado
- Implementar lazy loading para rutas de features
- **NO usar** `@HostBinding` y `@HostListener` - usar el objeto `host` en el decorador
- Usar `NgOptimizedImage` para imágenes estáticas

## Components
- Mantener componentes pequeños y con responsabilidad única
- Usar funciones `input()` y `output()` en lugar de decoradores
- Usar `computed()` para estado derivado
- Establecer `changeDetection: ChangeDetectionStrategy.OnPush`
- Preferir templates inline para componentes pequeños
- Preferir Reactive forms sobre Template-driven
- **NO usar** `ngClass` - usar `class` bindings
- **NO usar** `ngStyle` - usar `style` bindings

## State Management
- Usar signals para estado local del componente
- Usar `computed()` para estado derivado
- Mantener transformaciones de estado puras y predecibles
- **NO usar** `mutate` en signals - usar `update` o `set`

## Templates
- Mantener templates simples, evitar lógica compleja
- Usar **control flow nativo** (`@if`, `@for`, `@switch`) en lugar de `*ngIf`, `*ngFor`, `*ngSwitch`
- Usar async pipe para manejar observables

## Services
- Diseñar servicios con responsabilidad única
- Usar `providedIn: 'root'` para servicios singleton
- Usar función `inject()` en lugar de inyección por constructor
