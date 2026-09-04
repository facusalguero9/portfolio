# facundo-salguero — portfolio

Mi portfolio/CV personal, con estética de editor de código (estilo Claude Code).
Construido como proyecto de aprendizaje: HTML, CSS y JavaScript puros, sin
frameworks ni build tools.

**Sitio en vivo:** https://facusalguero9.github.io/portfolio/

## Estructura del proyecto

```
portfolio-site/
├── index.html      → todo el contenido y la estructura de la página
├── css/
│   └── style.css   → todos los estilos (colores, layout, responsive)
├── js/
│   └── script.js   → toda la interactividad (tabs, sidebar, terminal)
└── README.md        → este archivo
```

Es la separación clásica de un sitio web simple: **HTML = contenido**,
**CSS = presentación**, **JS = comportamiento**. Cada archivo tiene un solo
trabajo — eso hace que sea mucho más fácil encontrar y cambiar algo después.

## Cómo lo edito

No hace falta instalar nada para ver cambios: abrí `index.html` directamente
en el navegador (doble clic, o "Open with" → Chrome). Para desarrollo más
cómodo (recarga automática), corré un servidor local:

```bash
# Desde la carpeta portfolio-site/
python3 -m http.server 8000
# Abrí http://localhost:8000 en el navegador
```

### Para actualizar contenido (lo más común)

Todo el texto vive en `index.html`, dentro de bloques `<section class="pane" id="pane-...">`.
Cada uno representa un "archivo" del explorador de la izquierda. Para sumar
un proyecto nuevo al historial:

1. Copiá un bloque `<section class="pane" id="pane-exp-...">` existente.
2. Cambiale el `id` (tiene que ser único) y el contenido.
3. Agregá un botón nuevo en el sidebar (`<ul class="file-tree">`) con el
   mismo valor en `data-target` que el `id` de la sección (sin el prefijo `pane-`).

El JavaScript conecta todo automáticamente por esos `data-target` — no hay
que tocar `script.js` para agregar contenido.

## Qué aprendí / conceptos clave de este proyecto

- **HTML semántico**: `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`
  en vez de `<div>` para todo. Ayuda a la accesibilidad y al SEO — un
  screen reader o Google entienden la estructura de la página, no solo el
  texto.
- **CSS Custom Properties** (`--variable`): todos los colores están
  definidos una vez en `:root` (arriba de `style.css`) y reusados con
  `var(--nombre)`. Cambiar el color de acento en un solo lugar cambia todo
  el sitio.
- **Flexbox**: el layout completo (barra superior, sidebar + editor,
  barra de estado) usa `display: flex`. Es la herramienta correcta para
  layouts en una dimensión (filas o columnas).
- **CSS counters**: los números de línea del "editor" (`1, 2, 3...`) no son
  texto escrito a mano — los genera el navegador con `counter-increment` /
  `counter()`. Un truco de CSS puro, sin JavaScript.
- **Progressive enhancement**: el contenido real vive en el HTML (visible
  para buscadores aunque falle el JS); JavaScript solo agrega
  interactividad (tabs, sidebar, terminal) encima.
- **Delegación de eventos**: en vez de un listener por botón, hay un solo
  `addEventListener('click', ...)` en el contenedor (`.sidebar`, `.tabbar`)
  que revisa qué se clickeó. Más eficiente, y funciona automáticamente con
  elementos creados dinámicamente después.
- **Mobile-first responsive**: el sidebar se convierte en un drawer que
  se abre/cierra en pantallas chicas (`@media (max-width: 860px)`).
- **`prefers-reduced-motion`**: la animación de la terminal se desactiva
  si el usuario configuró su sistema para reducir movimiento — un detalle
  de accesibilidad real.

## Próximos pasos de aprendizaje (sugeridos)

1. **Git & GitHub** — versionar este proyecto y publicarlo (ver abajo).
2. **Migrar a React** — reconstruir esto mismo como ejercicio, componente
   por componente (`<Sidebar />`, `<Tab />`, `<Pane />`), para entender qué
   resuelve un framework que HTML/CSS/JS plano no resuelve fácil (estado,
   re-render, reusabilidad).
3. **Formulario de contacto real** — hoy `contact.txt` linkea a `mailto:`.
   Un paso más: un formulario con un backend simple (podría ser hasta una
   función serverless en Vercel/Netlify).

## Deploy a GitHub Pages

Ver instrucciones detalladas en el chat con Claude — resumen rápido:

```bash
git init
git add .
git commit -m "Primer commit: portfolio inicial"
git branch -M main
git remote add origin https://github.com/<tu-usuario>/portfolio-site.git
git push -u origin main
```

Después, en GitHub: **Settings → Pages → Source: branch `main`, carpeta `/ (root)`**.
El sitio queda publicado en `https://<tu-usuario>.github.io/portfolio-site/`.
