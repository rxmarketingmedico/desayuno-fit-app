-- 1) Padroniza a chave: item -> nombre em todos os ingredientes
UPDATE recetas
SET ingredientes = (
  SELECT jsonb_agg(
    CASE
      WHEN ing ? 'item' AND NOT (ing ? 'nombre')
        THEN (ing - 'item') || jsonb_build_object('nombre', ing->>'item')
      ELSE ing
    END
    ORDER BY ord
  )
  FROM jsonb_array_elements(ingredientes) WITH ORDINALITY AS t(ing, ord)
)
WHERE EXISTS (
  SELECT 1 FROM jsonb_array_elements(ingredientes) AS ing
  WHERE ing ? 'item' AND NOT (ing ? 'nombre')
);

-- 2) Remove receitas duplicadas: mantém a com mais ingredientes; em empate,
--    a com slug em ordem alfabética (determinístico).
WITH ranked AS (
  SELECT id, titulo,
    ROW_NUMBER() OVER (
      PARTITION BY titulo
      ORDER BY jsonb_array_length(ingredientes) DESC, slug ASC
    ) as rn
  FROM recetas
  WHERE titulo IN (
    'Bark de Yogur Griego con Frutos Rojos',
    'Bark de Chocolate Amargo y Frutos Secos',
    'Canastas de Tortilla con Huevo y Espinaca',
    'Muffins de Huevo y Vegetales',
    'Tortitas de Salmón y Papa Dulce'
  )
)
DELETE FROM recetas
WHERE id IN (SELECT id FROM ranked WHERE rn > 1);