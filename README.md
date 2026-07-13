# Portafolio — Daniel Jimenez (Game Dev & Programmer)

Portafolio estilo **Steam** y **data-driven**: editas archivos `.txt` y el sitio se actualiza solo.
Funciona **abriendo `index.html` directamente** (doble clic) y también en **GitHub Pages**.

## 🚀 Cómo verlo ya mismo (local)
1. Con el generador crea `data/site-data.js` (solo una vez, y cada vez que edites `.txt`):
   ```bash
   python tools/generate.py
   ```
2. Abre `index.html` en tu navegador (doble clic). ¡Listo!

## ✏️ Cómo actualizar (sin programar)
- **Tu info personal** → `data/profile.txt` (nombre, rol, bio, email, skills…).
- **Cada juego** → `data/projects/<slug>/info.txt`. Campos:
  - `title_es` / `title_en`, `engine`, `language`, `status_es/en`, `year`
  - `thumbnail: images/cover.jpg` → pon tu imagen en `data/projects/<slug>/images/`
  - `video: youtube:ID_DEL_VIDEO` → el ID de YouTube (ej. de `youtu.be/abc123` → `youtube:abc123`)
  - `download:` → link de Drive/Itch/GitHub (o vacío)
  - `short_es/en`, `tools:` (coma-separado), `features_es/en:` (coma-separado)
- **Nuevo juego**: crea `data/projects/<nuevo-slug>/` con su `info.txt` + carpetas `images/` y `videos/`, y añade `<nuevo-slug>` a `data/projects/manifest.txt`.
- Después de cualquier edición: `python tools/generate.py` y recarga.

## 🌐 Publicar en GitHub Pages
1. Sube todo el repo a GitHub.
2. En el repo: *Settings → Pages → Source: main* (branch).
3. En `tools/generate.py` cambia `SITE_URL` por tu URL real (ej. `https://tuusuario.github.io/portafolio`) y regenera.
4. Sin build: `site-data.js` ya está generado y se carga como `<script>`.

## 🤖 Pensado para reclutadores e IAs
- HTML semántico + JSON-LD (`Person` + `ItemList` de proyectos).
- `llms.txt` en la raíz: resumen plano y legible para IAs de selección.
- `sitemap.xml`, `robots.txt`, Open Graph / Twitter Cards.

## 📁 Estructura
```
index.html
css/style.css
js/i18n.js        (cambio ES/EN)
js/main.js        (render desde SITE_DATA)
assets/placeholder.svg
data/
  profile.txt
  site-data.js    (generado)
  projects/
    manifest.txt
    <slug>/info.txt + images/ + videos/
tools/generate.py
llms.txt  sitemap.xml  robots.txt  (generados)
```
