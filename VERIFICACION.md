# Verificación de entrega

26 de septiembre de 2026. Versión publicada: https://biblioteca-prompts-inmobiliarios.vercel.app

## Contenido y compilación

- 30 fichas únicas, numeradas del 1 al 30, comparadas íntegramente con la extracción del Word.
- Cinco pruebas automatizadas correctas: integridad, relaciones, búsqueda, personalización y validación de borradores.
- Compilación de producción y TypeScript correctos tanto localmente como en Vercel.
- Vercel confirmó estado READY para el despliegue de producción.

## Recorridos comprobados en navegador

- Carpeta → índice → documento íntegro → copia al portapapeles.
- Búsqueda por número exacto, sinónimos y relevancia; calendario primero para «plan semanal».
- Filtros combinados y recuperación de la selección al regresar desde un prompt.
- Cambio de sección sin filtros anteriores ocultos.
- Alternar texto original/personalización conserva la edición; el original no se modifica.
- Borrador guardado y recuperado al recargar, con campos repetidos independientes.
- Copia personalizada real y confirmación visible en el botón.
- Exportación/importación de respaldo con borradores.
- Favoritos y vista conservados al recargar; salida del filtro favoritos coherente con la sección.
- Carpetas operables con teclado y recuperación desde un estado sin resultados.

## Sitio público

- Inicio accesible sin sesión de Vercel y respuesta HTTP 200.
- Rutas individuales 1, 15 y 30 con respuesta HTTP 200.
- Copia al portapapeles comprobada en el dominio público.
- Posición restaurada exactamente a 900 px en el recorrido probado.
- Sin desbordamiento horizontal a 320 px y 390 px.
- Sin errores de ejecución detectados durante el recorrido público.
- Capturas en `output/playwright/publico-escritorio.png` y `publico-movil.png`.

Favoritos y borradores se guardan por navegador y dominio; no hay sincronización entre dispositivos. Exportar/importar permite trasladarlos desde localhost a la URL pública. Estas comprobaciones cubren los recorridos descritos, no todos los navegadores y situaciones posibles.
