-- Seed de 40 recetas adicionales para Desayuno Fit (espanhol neutro LATAM)
-- Categorías: dulce (14), salado (16), bebida (7), snack (3)
-- Idempotente: ON CONFLICT (slug) DO NOTHING

INSERT INTO public.recetas (
  slug, titulo, descripcion, tiempo_minutos, calorias, porciones,
  dificultad, categoria, badges, imagen_url,
  ingredientes, pasos, tip_nutricionista, info_nutricional,
  categoria_ingrediente_principal
)
SELECT * FROM (VALUES
  -- placeholder, será substituído
  (NULL::text, NULL::text, NULL::text, NULL::int, NULL::int, NULL::int, NULL::text, NULL::text, NULL::text[], NULL::text, NULL::jsonb, NULL::jsonb, NULL::text, NULL::jsonb, NULL::text)
) AS t WHERE false;
-- ABORT: usar arquivo completo abaixo