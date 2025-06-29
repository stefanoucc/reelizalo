# 📦 Gestión de Dependencias - Reelizalo

## 🎯 Filosofía de Dependencias

### Principios Fundamentales

1. **🔒 Versiones Fijas**: Eliminamos la incertidumbre usando versiones exactas
2. **📏 Bundle Size Awareness**: Cada dependencia debe justificar su peso
3. **🔍 Audit Regular**: Revisiones mensuales de seguridad y performance
4. **🧪 Test Before Update**: Toda actualización pasa por testing exhaustivo
5. **📚 Documentation First**: Cada dependencia importante está documentada

## 🗃️ Categorización de Dependencias

### 🏗️ **Core Framework (Critical)**
```json
{
  "next": "15.3.4",           // Framework principal - NO tocar sin planning
  "react": "^19.0.0",         // React 19 - Stable
  "react-dom": "^19.0.0",     // DOM utilities
  "typescript": "^5"          // Type safety
}
```

### 🎨 **UI & Styling (Stable)**
```json
{
  "tailwindcss": "^3.4.1",                    // CSS utility framework
  "tailwindcss-animate": "^1.0.7",            // Animation utilities
  "@radix-ui/react-dialog": "^1.1.1",         // Accessible modals
  "@radix-ui/react-dropdown-menu": "^2.1.1",  // Dropdown components
  "@radix-ui/react-progress": "^1.1.0",       // Progress indicators
  "@radix-ui/react-toast": "^1.2.1",          // Toast notifications
  "class-variance-authority": "^0.7.0",       // Component variants
  "tailwind-merge": "^2.5.2",                 // Tailwind conflict resolution
  "lucide-react": "^0.441.0",                 // Icon library
  "clsx": "^2.1.1"                            // Conditional classes
}
```

### 🛠️ **Development Tools (Flexible)**
```json
{
  "eslint": "^8",                              // Code linting
  "eslint-config-next": "15.3.4",            // Next.js ESLint rules
  "prettier": "latest",                        // Code formatting
  "husky": "latest",                          // Git hooks
  "vitest": "latest",                         // Testing framework
  "playwright": "latest"                       // E2E testing
}
```

### 🗄️ **Database & Backend (Critical)**
```json
{
  "@supabase/supabase-js": "^2.45.1",        // Database client
  "@supabase/auth-helpers-nextjs": "^0.10.0", // Auth helpers
  "openai": "^4.56.0",                        // AI integration
  "@upstash/redis": "^1.25.1",                // Cache layer
  "@upstash/qstash": "^2.5.0",                // Queue system
  "zod": "^3.23.8"                            // Schema validation
}
```

### 🎬 **Video Processing (Specialized)**
```json
{
  "remotion": "^4.0.124",                     // Video generation
  "@remotion/lambda": "^4.0.124",             // Serverless rendering
  "@remotion/cloudrun": "^4.0.124"            // Cloud rendering
}
```

### 💳 **Payments & Integrations (External)**
```json
{
  "mercadopago": "^2.0.6",                    // LATAM payments
  "@highlight-run/next": "^7.9.30",           // Performance monitoring
  "@sentry/nextjs": "^8.26.0"                 // Error tracking
}
```

### 📝 **Forms & Validation (Utility)**
```json
{
  "react-hook-form": "^7.52.2",               // Form management
  "@hookform/resolvers": "^3.3.4",            // Form validators
  "react-dropzone": "^14.2.9"                 // File uploads
}
```

## 🔄 Proceso de Actualización de Dependencias

### 1. **Evaluación Pre-Actualización**
```bash
# Verificar dependencias obsoletas
npm outdated

# Auditoría de seguridad
npm audit --audit-level moderate

# Verificar el impacto del bundle
npx @next/bundle-analyzer
```

### 2. **Investigación de Impacto**
- 📖 Leer CHANGELOG de la dependencia
- 🔍 Revisar breaking changes
- 📊 Evaluar impacto en bundle size
- 🧪 Verificar compatibilidad con otras deps

### 3. **Testing Pipeline**
```bash
# Testing local
npm run test               # Unit tests
npm run test:e2e           # E2E tests
npm run lint               # Code quality
npm run type-check         # TypeScript validation

# Build verification
npm run build
npm run start
```

### 4. **Documentación de Cambios**
```markdown
## Dependency Update: [package-name] v[old] → v[new]

### Reason for Update
- [ ] Security vulnerability fix
- [ ] Performance improvement
- [ ] New feature needed
- [ ] Bug fix

### Breaking Changes
- List any breaking changes
- Migration steps required

### Testing Completed
- [ ] Unit tests pass
- [ ] E2E tests pass
- [ ] Manual testing in dev/staging
- [ ] Performance impact verified

### Rollback Plan
- Steps to revert if issues arise
```

## 🚨 Dependencias Críticas (DO NOT UPDATE without planning)

### ⚠️ **High Risk Updates**
1. **Next.js**: Siempre esperar 2-3 minor releases
2. **React**: Major versions requieren extensive testing
3. **Supabase**: Breaking changes en auth pueden afectar usuarios
4. **Remotion**: Cambios en rendering engine críticos
5. **Payment providers**: Nunca actualizar en viernes

### 🔒 **Lock File Strategy**
- `package-lock.json` SIEMPRE en version control
- Usar `npm ci` en production builds
- `npm install --save-exact` para deps críticas

## 📊 Monitoreo de Dependencias

### 🤖 **Automatización (GitHub Actions)**
```yaml
name: Dependency Monitor
on:
  schedule:
    - cron: '0 9 * * MON'  # Lunes 9 AM

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Security Audit
        run: npm audit --audit-level high
      - name: Outdated Check
        run: npm outdated
```

### 📈 **Métricas de Bundle Size**
```bash
# Bundle analyzer
npx @next/bundle-analyzer

# Size tracking
npx bundlesize

# Performance impact
npm run build && npm run start
# → Monitor Core Web Vitals en Highlight.io
```

## 🔧 Comandos Útiles para Gestión

### 📦 **Instalación Controlada**
```bash
# Instalar versión exacta
npm install --save-exact [package]@[version]

# Instalar para desarrollo
npm install --save-dev [package]

# Reinstalar todo desde package-lock
npm ci

# Limpiar cache y reinstalar
npm cache clean --force && npm ci
```

### 🔍 **Análisis de Dependencias**
```bash
# Ver árbol de dependencias
npm ls

# Buscar vulnerabilidades
npm audit

# Ver dependencias duplicadas
npx npm-check-duplicates

# Analizar bundle impact
npx @next/bundle-analyzer

# Verificar compatibilidad
npx npm-check-updates
```

### 🧹 **Limpieza y Mantenimiento**
```bash
# Remover dependencias no utilizadas
npx depcheck

# Verificar imports no utilizados
npx unimported

# Optimizar package-lock
npm ci && npm prune
```

## 🎯 Best Practices Específicas

### 📱 **shadcn/ui Components**
```bash
# Agregar componentes específicos (recomendado)
npx --legacy-peer-deps shadcn@latest add button
npx --legacy-peer-deps shadcn@latest add dialog

# Evitar: agregar todos los componentes
# npx shadcn@latest add
```

### 🤖 **OpenAI Integration**
- Pin exact version para consistency en outputs
- Monitor usage costs en dashboard
- Implement fallback para rate limits

### 🎬 **Remotion Updates**
- Test render outputs antes de deploy
- Verificar lambda compatibility
- Monitor rendering costs

### 💳 **Payment Providers**
- NUNCA actualizar en production directamente
- Test en sandbox environment
- Verificar webhook compatibility

## 🚨 Emergency Procedures

### 🔄 **Rollback de Dependencia**
```bash
# 1. Revert package.json
git checkout HEAD~1 -- package.json

# 2. Reinstalar
npm ci

# 3. Verificar funcionamiento
npm run test && npm run build

# 4. Deploy hotfix
git commit -m "hotfix: rollback [package] to [version]"
```

### 🆘 **Dependency Hell Recovery**
```bash
# Nuclear option - reset completo
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# Verificar que todo funciona
npm run test:full
```

## 📋 Checklist Mensual

### 🔍 **Review de Dependencias (Primer lunes del mes)**
- [ ] `npm audit` - Sin vulnerabilidades high/critical
- [ ] `npm outdated` - Review de updates disponibles
- [ ] Bundle size analysis - Sin incrementos > 5%
- [ ] Performance metrics - Core Web Vitals OK
- [ ] Cost review - APIs usage dentro del budget
- [ ] Security review - No leaked secrets en dependencies

### 📊 **Métricas a Trackear**
- Bundle size total y por chunk
- First Load JS size
- Dependency count
- Security vulnerabilities
- Build time
- Test execution time

---

## 📚 Recursos Adicionales

- [Next.js Dependency Guidelines](https://nextjs.org/docs)
- [npm Security Best Practices](https://docs.npmjs.com/security)
- [Bundle Size Analysis Tools](https://bundlesize.io/)
- [Dependency Security Tools](https://snyk.io/)

**Mantenido por el equipo de Reelizalo - Actualizado mensualmente** 