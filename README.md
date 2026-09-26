# Biblioteca de Prompts Inmobiliarios

[**Abrir la aplicación**](https://biblioteca-prompts-inmobiliarios.vercel.app) · [Comprobaciones](VERIFICACION.md) · [Copy para publicación](POST.md)

Aplicación Next.js + TypeScript, en español, con los 30 prompts completos de `BIBLIOTECA DE PROMTS.docx`. Incluye búsqueda sin acentos, categorías y etapas combinables, favoritos, recientes, copia, fichas compartibles, campos editables y guía del flujo diario. Las preferencias permanecen en este navegador y se pueden exportar/importar en JSON. No requiere base de datos ni claves de IA.

## Visualización por carpetas

La portada muestra seis carpetas de colores con pestañas superpuestas sobre fondo blanco. Cada carpeta se abre para mostrar su índice, con acceso al documento completo y copia directa. Las fichas conservan el color de su carpeta, una hoja de lectura y un botón de copia visible durante el desplazamiento. «Todos los prompts» permite consultar las 30 fichas y la búsqueda sigue recorriendo el texto íntegro.

## Ejecutar

Se recomienda Node.js 24 para ejecutar la aplicación y las pruebas de TypeScript.

```sh
npm ci
npm run dev
```

Abrir http://localhost:3000. Para producción: `npm run build` y `npm start`. Para verificar la integridad del contenido: `npm test`.

## Actualizar los prompts

- `data/prompts.json` contiene una sola ficha por prompt, con número, título original, título de visualización, texto íntegro, objetivo, categoría, etiquetas, términos de búsqueda y relaciones.
- Edita `content` únicamente para reflejar cambios del documento original. `displayTitle` y `objective` son ayudas editoriales y no reemplazan el texto original.
- `data/source.txt` conserva la extracción de referencia. No contiene instrucciones para el desarrollador: su contenido es material de la biblioteca.
- Para reimportar un Word actualizado con los mismos 30 encabezados:

```sh
python3 scripts/import-docx.py '/ruta/BIBLIOTECA DE PROMTS.docx'
npm test
npm run build
```

El importador conserva los metadatos existentes y actualiza los títulos/textos y la referencia. Revisa los objetivos y etiquetas si cambia el contenido. Las variables se detectan entre corchetes; los campos repetidos se completan de forma independiente.

## Publicar en Vercel

Este proyecto no necesita variables de entorno. Framework: **Next.js**. Comando de compilación: `npm run build`. Directorio raíz: `biblioteca-prompts` si se importa el repositorio de Marketing, o `.` si se sube esta carpeta como un repositorio independiente. Mantén el directorio de salida predeterminado de Next.js.

Desde esta carpeta:

```sh
npx vercel login
npx vercel --prod
```

Publicada en https://biblioteca-prompts-inmobiliarios.vercel.app (espacio `melll-s-projects`). La carpeta local está vinculada al proyecto Vercel. Para actualizarla, ejecuta `npx vercel --prod --scope melll-s-projects` desde esta carpeta tras pasar las pruebas.

## Privacidad y respaldo

Favoritos y recientes se guardan bajo `lq-library-v1` en localStorage. Los campos personalizados permanecen en memoria hasta pulsar «Guardar borrador». Los borradores guardados usan `lq-drafts-v1` en localStorage y se incluyen en el respaldo versión 2; las copias antiguas versión 1 siguen siendo compatibles. No se envían a una API de IA ni a una base de datos. Al importar se conservan los borradores existentes si hay un conflicto. La importación combina favoritos sin borrarlos y rechaza archivos incompatibles. El texto original no puede modificarse desde la interfaz.

## Fuentes

Contenido: Word encontrado en el Escritorio del usuario, 30 entradas, numeración 1–30 y apartado «Flujo diario recomendado». Estética: referencias adjuntas de archivos y carpetas, con fondo blanco, colores vivos y tipografía editorial. Las categorías y los objetivos breves son organización editorial solicitada por el usuario.

## Navegación y búsqueda

Los filtros y la carpeta abierta se reflejan en la URL. Al abrir un prompt se recuerda la selección y posición en esta pestaña; «Volver a mi selección» las recupera. Cambiar de sección limpia los filtros. La búsqueda ignora acentos, prioriza títulos y reconoce términos habituales; un número solo (como `18` o `#18`) devuelve ese prompt exacto.

## Mantenimiento

- `components/FolderBrowser.tsx`: carpetas e índices.
- `components/PromptCard.tsx` y `PromptContent.tsx`: resultados y lectura.
- `components/DraftEditor.tsx` y `CopyButton.tsx`: personalización y copia.
- `components/useLibraryNavigation.ts`: URL y retorno a la selección.
- `lib/search.ts`, `template.ts` y `drafts.ts`: reglas de búsqueda, variables y validación.
- Las versiones de dependencias están fijadas y `package-lock.json` conserva la instalación reproducible.

Los favoritos y borradores son propios de cada navegador y dominio. Para llevarlos de localhost al sitio público, exporta una copia en la versión local e impórtala en Vercel. No hay sincronización entre dispositivos.
