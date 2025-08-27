# 🚀 Configuración Google Analytics y Search Console

## 📊 Google Analytics 4 (GA4)

### 1. Crear cuenta de Google Analytics
1. Ve a https://analytics.google.com/
2. Crea una cuenta nueva llamada "IAWebPro"
3. Configura una propiedad web para tu sitio
4. URL del sitio: `https://iawebpro.github.io/`

### 2. Agregar código de seguimiento
Copia el código de Google Analytics y pégalo en `index.html` después de la línea `<head>`:

```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

**Reemplaza G-XXXXXXXXXX con tu ID real de Analytics**

## 🔍 Google Search Console

### 1. Verificar propiedad
1. Ve a https://search.google.com/search-console/
2. Agrega la propiedad: `https://iawebpro.github.io/`
3. Verifica usando "Prefijo de URL"

### 2. Métodos de verificación disponibles:
- **Archivo HTML:** Descargar archivo y subirlo a la raíz
- **Etiqueta HTML:** Agregar meta tag al `<head>`
- **Google Analytics:** Si ya tienes GA4 configurado

### 3. Enviar sitemap
Una vez verificado:
1. Ve a "Sitemaps" en el menú izquierdo  
2. Agrega la URL: `https://iawebpro.github.io/sitemap.xml`
3. Enviar

## 📈 Métricas importantes a monitorear

### Google Analytics:
- **Usuarios únicos** (visitantes totales)
- **Páginas vistas** 
- **Duración de sesión**
- **Tasa de rebote** (debe ser < 70%)
- **Conversiones** (formularios enviados)
- **Fuentes de tráfico** (directo, redes sociales, búsqueda)

### Google Search Console:
- **Impresiones** (cuántas veces apareces en resultados)
- **Clics** (cuántos hacen clic en tu resultado)  
- **CTR** (Click Through Rate - debe ser > 2%)
- **Posición promedio** (posición en resultados de Google)
- **Consultas principales** (qué buscan para encontrarte)

## 🎯 Palabras clave objetivo
Enfócate en posicionar para estas búsquedas:
- "páginas web profesionales"
- "chatbots WhatsApp"
- "landing pages México"
- "automatización multicanal"
- "servicios digitales"
- "desarrollo web + tu ciudad"

## ⚡ Tips para mejorar SEO
1. **Velocidad del sitio:** Tu página ya está optimizada con Tailwind CSS
2. **Contenido regular:** Actualiza la página con nuevos proyectos/testimonios
3. **Backlinks:** Comparte en directorios de negocios online
4. **Redes sociales:** Comparte contenido regularmente desde tu Instagram