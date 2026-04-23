

# Completar el catálogo a 200 recetas

## Estado actual
Tienes **75 recetas**. Faltan **125** para llegar a 200.

Distribución actual:
- Salado: 29 · Dulce: 27 · Bebida: 14 · Snack: 5

## Distribución objetivo (200 recetas)
Equilibrio pensado para variedad diaria sin saturar una sola categoría:

| Categoría | Actual | Meta | A crear |
|---|---|---|---|
| Salado | 29 | 70 | **+41** |
| Dulce | 27 | 60 | **+33** |
| Bebida | 14 | 35 | **+21** |
| Snack | 5 | 35 | **+30** |
| **Total** | **75** | **200** | **+125** |

Dentro de cada categoría diversificamos por ingrediente principal (huevo, avena, pan, pollo, salmón, atún, tortilla, lentejas, fruta, yogur, café, queso, tofu, aguacate, etc.) para que el filtro de la app tenga densidad real.

## Cómo lo voy a ejecutar (3 pasos)

### 1. Generar las 125 recetas con IA (Lovable AI Gateway)
Script Python (`/tmp/generate_recetas.py`) que llama a `google/gemini-2.5-pro` en lotes:
- Prompt con: categoría, ingrediente principal, badges deseados, restricciones (≤350 cal, ≤15 min cuando aplique, español LATAM, tono Sofía).
- Salida JSON estructurada validando los campos de la tabla `recetas`: `slug, titulo, descripcion, tiempo_minutos, calorias, porciones, dificultad, categoria, badges, ingredientes, pasos, tip_nutricionista, info_nutricional, categoria_ingrediente_principal`.
- Deduplicación contra `slug` ya existentes en BD.

### 2. Generar las 125 imágenes
Mismo script, segunda fase, con `google/gemini-3.1-flash-image-preview` (rápido + alta calidad):
- Prompt visual consistente: plato cenital, fondo claro madera, luz natural, estética minimal igual a las recetas existentes.
- Subida al bucket `recetas-imagenes` (público) → guarda la URL en `imagen_url`.

### 3. Insertar en la base de datos
Migración SQL con los 125 `INSERT` (en lotes de 25 para no exceder timeout). Validación post-insert: `SELECT COUNT(*) FROM recetas` debe dar 200.

## Tiempo estimado
- Generación de texto: ~8–12 min
- Generación de imágenes: ~20–30 min (es la parte más lenta)
- Inserción + verificación: ~2 min

Puedes seguir usando la app mientras corre; al terminar, las 200 recetas aparecen en `/app/recetas` con sus filtros funcionando.

## Detalles técnicos
- Modelos: `google/gemini-2.5-pro` (texto JSON), `google/gemini-3.1-flash-image-preview` (imágenes).
- Bucket: `recetas-imagenes` (ya existe, público).
- Slugs: kebab-case, validados únicos antes de insertar.
- Badges: usados los mismos del filtro actual (`alto en proteina, vegano, vegetariano, sin gluten, sin azucar, keto, rapido, meal prep`) + variantes contextuales.
- Coste IA: cubierto por créditos de Lovable AI (sin API keys extra).

¿Apruebo y arranco?

