# Mejoras SEO y Optimización de Imágenes - DIICSACV2

**Rama:** `dev`  
**Fecha:** 27 febrero 2026

## 📋 Cambios Implementados

### 1. ✅ Configuración SEO para Astro
- **Archivo:** `astro.config.mjs`
- Agregado `site` URL base: `https://diicsacv.com`
- Configurado Sitemap automático con `astro-sitemap`
- Optimizaciones Vite para SSR

### 2. ✅ Componentes SEO Reutilizables

#### `src/components/SEO.astro`
Componente para gestionar:
- Meta tags básicos (charset, viewport, robots)
- Canonical links
- Open Graph (og:title, og:description, og:image, og:url, og:locale)
- Twitter Card
- Preload de recursos críticos
- DNS prefetch

```astro
<SEO
  title="Página de Servicios"
  description="Nuestros servicios de construcción..."
  image="/og-image.jpg"
  canonicalUrl="/servicios/"
/>
```

#### `src/components/StructuredData.astro`
Genera Schema.org JSON-LD para:
- LocalBusiness
- Organization
- Contacto y ubicación
- Redes sociales

```astro
<StructuredData
  schema={{
    name: "DIICSA",
    email: "info@diicsacv.com",
    phone: "+52-XXXXXXXXXX",
    address: {
      streetAddress: "...",
      addressLocality: "Ciudad de México",
      addressRegion: "CDMX",
      postalCode: "XXXXX",
      addressCountry: "MX"
    }
  }}
/>
```

### 3. ✅ Componentes de Imágenes Optimizadas

#### `src/components/Image.astro` (Básico con lazy loading)
```astro
<Image
  src="/images/photo.webp"
  alt="Descripción accesible de la imagen"
  loading="lazy"
  decoding="async"
/>
```

#### `src/components/ImageOptimized.astro` (Avanzado con srcset)
```astro
<ImageOptimized
  src="/images/photo.webp"
  alt="Descripción de la imagen"
  width={800}
  height={600}
  quality="high"
/>
```

**Características:**
- Lazy loading automático
- Srcset para resoluciones múltiples (1x, 2x)
- Tamaños responsivos
- Fallback para navegadores antiguos
- Validación de atributos alt

### 4. ✅ Layout Principal

**Archivo:** `src/layouts/MainLayout.astro`
- Integración de componentes SEO
- Estilos globales optimizados
- Estructura HTML semántica

### 5. ✅ Archivo robots.txt

**Archivo:** `public/robots.txt`
- Reglas de crawling para Googlebot, Bingbot
- Bloqueo de bots maliciosos (AhrefsBot, SemrushBot)
- Referencia al sitemap

### 6. ✅ Scripts de Utilidad

#### `scripts/convert-to-webp.mjs`
Convierte todas las imágenes JPG/PNG/GIF a WebP

```bash
npm run images:convert
```

**Características:**
- Busca recursiva en `public/wp-content/uploads/`
- Mantiene estructura de directorios
- Calidad 85% para balance optimalidad/tamaño
- Reporte de ahorro de espacio

#### `scripts/check-alt-text.mjs`
Verifica que todas las imágenes tengan atributo `alt`

```bash
npm run images:check-alt
```

## 🚀 Scripts Disponibles

```bash
# SEO y Sitemap
npm run build        # Genera sitemap.xml automáticamente

# Imágenes
npm run images:convert     # Convierte JPG/PNG/GIF a WebP
npm run images:check-alt   # Audita atributos alt faltantes

# Desarrollo
npm run dev          # Servidor de desarrollo
npm run preview      # Previsualización del build

# Original
npm run wp:migrate   # Migración desde WordPress
```

## 📊 Productos Generados

Cuando ejecutes `npm run build`, se generarán:

```
dist/
├── sitemap-index.xml       # Índice de sitemaps
├── sitemap-0.xml           # Páginas (actualizado automáticamente)
├── robots.txt              # Reglas de crawling
└── ...
```

## 📋 Próximos Pasos (TODO)

- [ ] Usar componentes SEO y Image en las páginas existentes
- [ ] Ejecutar `npm run images:convert` para convertir imágenes no-WebP
- [ ] Ejecutar `npm run images:check-alt` y añadir alt text faltante
- [ ] Personalizar StructuredData con datos reales de DIICSA
- [ ] Probar con Google Search Console
- [ ] Auditar con Lighthouse y PageSpeed Insights
- [ ] Configurar image CDN (Cloudinary, ImageKit) si es necesario

## 🔍 Verificación SEO

### Open Graph
Visita: https://www.opengraph.xyz/
Pega la URL de tu sitio para verificar OG tags

### Rich Snippets
Usa Google's Rich Results Test: https://search.google.com/test/rich-results

### Sitemap
Descarga: https://diicsacv.com/sitemap-index.xml (después de build)

### Mobile Friendly
Google Mobile-Friendly Test: https://search.google.com/test/mobile-friendly

## 📚 Documentación Astro

- [Astro SEO](https://docs.astro.build/en/guides/seo/)
- [Astro Integrations](https://astro.build/integrations/)
- [Image Optimization](https://docs.astro.build/en/guides/images/)

## 💾 Commit

```bash
git add .
git commit -m "chore: SEO improvements - sitemap, structured data, optimized images"
git push origin dev
```

---

**Status:** ✅ Implementado en rama `dev`  
**Listo para:** Merge a `main` tras testing
