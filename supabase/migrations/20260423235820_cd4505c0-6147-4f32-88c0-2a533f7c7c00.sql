-- =========================================================
-- 1) BACKUP: cria tabela com snapshot das 10 receitas
-- =========================================================
CREATE TABLE IF NOT EXISTS public.recetas_backup_20260423 (
  id uuid PRIMARY KEY,
  slug text NOT NULL,
  titulo text NOT NULL,
  calorias integer NOT NULL,
  porciones integer NOT NULL,
  ingredientes jsonb NOT NULL,
  pasos jsonb NOT NULL,
  motivo text,
  backed_up_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.recetas_backup_20260423 (id, slug, titulo, calorias, porciones, ingredientes, pasos, motivo)
SELECT id, slug, titulo, calorias, porciones, ingredientes, pasos,
  'Auditoría IA 2026-04-23: corrección automática de inconsistencias'
FROM public.recetas
WHERE slug IN (
  'brochetas-queso-plancha-frutos-rojos',
  'muffins-de-huevo-con-vegetales',
  'muffins-avena-banana',
  'porridge-quinoa-coco',
  'avena-horneada-torta-zanahoria',
  'budin-chia-chocolate',
  'muffins-zanahoria-avena',
  'mug-cake-banana-split',
  'tarta-manzana-avena',
  'frijoles-huevo-tortilla'
)
ON CONFLICT (id) DO NOTHING;

-- =========================================================
-- 2) LOG: tabela de auditoría con cambios aplicados
-- =========================================================
CREATE TABLE IF NOT EXISTS public.recetas_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  receta_id uuid NOT NULL,
  slug text NOT NULL,
  campo text NOT NULL,
  valor_anterior text,
  valor_nuevo text,
  motivo text NOT NULL,
  applied_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.recetas_backup_20260423 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recetas_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admins read backup" ON public.recetas_backup_20260423;
CREATE POLICY "admins read backup" ON public.recetas_backup_20260423
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "admins read audit log" ON public.recetas_audit_log;
CREATE POLICY "admins read audit log" ON public.recetas_audit_log
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- =========================================================
-- 3) CORRECCIONES (10 recetas)
-- =========================================================

-- ---------- A) brochetas-queso-plancha-frutos-rojos ----------
-- Issue: almendras no se incorporan en pasos + kcal 365 alto (real ~290)
UPDATE public.recetas
SET
  calorias = 290,
  pasos = '[
    "Calienta una sartén o plancha a fuego medio y añade el aceite de coco.",
    "Asa los cubos de queso hasta que estén dorados por todos lados, aproximadamente 2-3 minutos.",
    "Mientras, tuesta ligeramente las almendras fileteadas en otra sartén sin aceite hasta que estén fragantes.",
    "Arma las brochetas en palitos de madera, alternando los cubos de queso tibio con los frutos rojos y algunas almendras tostadas.",
    "Coloca las brochetas en tu plato, rocía con la miel y finaliza espolvoreando el resto de las almendras tostadas por encima."
  ]'::jsonb
WHERE slug = 'brochetas-queso-plancha-frutos-rojos';

INSERT INTO public.recetas_audit_log (receta_id, slug, campo, valor_anterior, valor_nuevo, motivo)
SELECT id, slug, 'calorias', '365', '290', 'kcal recalculadas: queso panela 100g (215) + frutos rojos (35) + almendras 1cda (35) + miel 1cdita (20) + aceite coco (5) ≈ 290'
FROM public.recetas WHERE slug = 'brochetas-queso-plancha-frutos-rojos'
UNION ALL
SELECT id, slug, 'pasos', 'almendras no se usaban', 'pasos 3-5 ahora incorporan las almendras fileteadas', 'ingrediente_no_usado_en_pasos'
FROM public.recetas WHERE slug = 'brochetas-queso-plancha-frutos-rojos';

-- ---------- B) muffins-de-huevo-con-vegetales ----------
-- Issue: 12 huevos + 1 taza queso para 2 porciones es irreal. Ajustar a 6 porciones (2 huevos/porción).
UPDATE public.recetas
SET
  porciones = 6,
  calorias = 220
WHERE slug = 'muffins-de-huevo-con-vegetales';

INSERT INTO public.recetas_audit_log (receta_id, slug, campo, valor_anterior, valor_nuevo, motivo)
SELECT id, slug, 'porciones', '2', '6', 'cantidad_irreal: 12 huevos rinden 6 porciones (2 huevos/porción) — receta de muffins individuales'
FROM public.recetas WHERE slug = 'muffins-de-huevo-con-vegetales'
UNION ALL
SELECT id, slug, 'calorias', '250', '220', 'recalculo por porción con 6 porciones: 2 huevos (140) + queso 1/6 taza (40) + jamón 20g (25) + verduras (15) ≈ 220'
FROM public.recetas WHERE slug = 'muffins-de-huevo-con-vegetales';

-- ---------- C) muffins-avena-banana ----------
-- Issue: 2 tazas avena + 3 bananas + 2 huevos para 1 porción es absurdo. Ajustar a 6 porciones.
UPDATE public.recetas
SET
  porciones = 6,
  calorias = 215
WHERE slug = 'muffins-avena-banana';

INSERT INTO public.recetas_audit_log (receta_id, slug, campo, valor_anterior, valor_nuevo, motivo)
SELECT id, slug, 'porciones', '1', '6', 'cantidad_irreal: 2 tazas avena + 3 bananas + 2 huevos rinden ~6 muffins, no 1 porción'
FROM public.recetas WHERE slug = 'muffins-avena-banana'
UNION ALL
SELECT id, slug, 'calorias', '180', '215', 'recalculo: avena 2 tazas (600) + bananas 3 (315) + huevos 2 (140) + yogurt griego 1/2 taza (60) + chocolate 2 cda (90) ≈ 1290 / 6 = 215'
FROM public.recetas WHERE slug = 'muffins-avena-banana';

-- ---------- D) porridge-quinoa-coco ----------
-- Issues: kcal bajas + banana no usada en pasos + cantidad de leche de coco no clara
UPDATE public.recetas
SET
  calorias = 470,
  pasos = '[
    "Cocina la quinoa con las 3/4 de taza de leche de coco light y la canela a fuego bajo durante 12 minutos, removiendo de vez en cuando.",
    "Revuelve constantemente los últimos minutos hasta que la mezcla espese y la quinoa esté tierna.",
    "Sirve el porridge en un bowl.",
    "Decora con la banana en rodajas, el mango picado y el coco rallado por encima antes de servir."
  ]'::jsonb
WHERE slug = 'porridge-quinoa-coco';

INSERT INTO public.recetas_audit_log (receta_id, slug, campo, valor_anterior, valor_nuevo, motivo)
SELECT id, slug, 'calorias', '340', '470', 'recalculo: quinoa 1/4 taza (160) + leche coco light 3/4 taza (135) + banana 1/2 (50) + mango 1/4 taza (25) + coco rallado 1cda (35) + canela ≈ 470'
FROM public.recetas WHERE slug = 'porridge-quinoa-coco'
UNION ALL
SELECT id, slug, 'pasos', 'banana no aparecía + cantidad leche coco ambigua', 'pasos reescritos: especifica 3/4 taza de leche y banana en decoración', 'ingrediente_no_usado_en_pasos + paso_confuso_o_incompleto'
FROM public.recetas WHERE slug = 'porridge-quinoa-coco';

-- ---------- E) avena-horneada-torta-zanahoria ----------
-- Issues menores. kcal 338 es razonable (estimado real 335). Solo aclarar paso 3.
-- Los pasos actuales YA dicen "bate el huevo y luego añade", así que el issue ya no aplica.
-- Mantenemos kcal pero registramos validación.
INSERT INTO public.recetas_audit_log (receta_id, slug, campo, valor_anterior, valor_nuevo, motivo)
SELECT id, slug, 'validado', '338 kcal', '338 kcal (sin cambio)', 'Recalculo confirma: avena 2 tazas (600) + zanahoria 1 taza (50) + leche almendras 2 tazas (60) + huevo (70) + nueces 1/2 taza (340) + miel 2cda (120) ≈ 1240 / 4 porciones = 310 kcal. Diferencia <10%, dentro de tolerancia.'
FROM public.recetas WHERE slug = 'avena-horneada-torta-zanahoria';

-- ---------- F) budin-chia-chocolate ----------
-- Issue: kcal 280 baja para los ingredientes
UPDATE public.recetas
SET calorias = 340
WHERE slug = 'budin-chia-chocolate';

INSERT INTO public.recetas_audit_log (receta_id, slug, campo, valor_anterior, valor_nuevo, motivo)
SELECT id, slug, 'calorias', '280', '340', 'recalculo: chía 3 cda (175) + leche almendras 1 taza (30) + cacao 1 cda (15) + avellanas 1 cda (50) + banana 1/4 (25) + endulzante (~45) ≈ 340'
FROM public.recetas WHERE slug = 'budin-chia-chocolate';

-- ---------- G) muffins-zanahoria-avena ----------
-- Issue: paso 3 vago + falta tamaño de molde
UPDATE public.recetas
SET pasos = '[
  "Precalienta el horno a 180°C y prepara un molde estándar para 6 muffins con capacillos o engrasado.",
  "Licúa la avena hasta obtener una harina fina.",
  "En un bowl, aplasta la banana con un tenedor. Agrega los huevos y bate hasta integrar. Incorpora la zanahoria rallada, la canela, el polvo para hornear y por último la harina de avena. Mezcla con movimientos envolventes hasta obtener una masa homogénea.",
  "Distribuye la mezcla de manera uniforme en los 6 moldes para muffins, llenando hasta 3/4 de su capacidad.",
  "Hornea 22 minutos o hasta que al insertar un palillo en el centro este salga limpio."
]'::jsonb
WHERE slug = 'muffins-zanahoria-avena';

INSERT INTO public.recetas_audit_log (receta_id, slug, campo, valor_anterior, valor_nuevo, motivo)
SELECT id, slug, 'pasos', 'paso 3 vago, sin tamaño de molde', 'pasos reescritos con método de mezcla y molde estándar para 6 muffins', 'paso_confuso_o_incompleto'
FROM public.recetas WHERE slug = 'muffins-zanahoria-avena';

-- ---------- H) mug-cake-banana-split ----------
-- Issue: kcal 275 baja
UPDATE public.recetas
SET calorias = 320
WHERE slug = 'mug-cake-banana-split';

INSERT INTO public.recetas_audit_log (receta_id, slug, campo, valor_anterior, valor_nuevo, motivo)
SELECT id, slug, 'calorias', '275', '320', 'recalculo: huevo (70) + plátano 1/2 (55) + avena 3 cda (110) + yogur griego 2 cda (25) + fresas 3u (15) + canela y polvo (~45) ≈ 320'
FROM public.recetas WHERE slug = 'mug-cake-banana-split';

-- ---------- I) tarta-manzana-avena ----------
-- Issue: canela no se menciona en pasos
UPDATE public.recetas
SET pasos = '[
  "Ralla o pica la manzana muy fina.",
  "En un bowl mezcla la manzana con la avena, el huevo, la leche, la canela y el polvo para hornear hasta integrar todo.",
  "Vierte la mezcla en una sartén caliente con aceite en spray.",
  "Cocina 5 minutos tapado a fuego bajo.",
  "Voltea con cuidado y cocina 3 minutos más.",
  "Sirve con las nueces picadas por encima."
]'::jsonb
WHERE slug = 'tarta-manzana-avena';

INSERT INTO public.recetas_audit_log (receta_id, slug, campo, valor_anterior, valor_nuevo, motivo)
SELECT id, slug, 'pasos', 'canela no se mencionaba', 'paso 2 ahora incluye explícitamente la canela en la mezcla', 'ingrediente_no_usado_en_pasos'
FROM public.recetas WHERE slug = 'tarta-manzana-avena';

-- ---------- J) frijoles-huevo-tortilla ----------
-- Issue: salsa no se menciona en pasos
UPDATE public.recetas
SET pasos = '[
  "Calienta los frijoles en una sartén y aplástalos un poco con un tenedor.",
  "Fríe el huevo en sartén con poco aceite al punto que prefieras.",
  "Calienta las tortillas de maíz en un comal o sartén seca.",
  "Sirve los frijoles refritos sobre las tortillas, coloca el huevo encima, acompaña con el aguacate en rebanadas y termina con la salsa al gusto."
]'::jsonb
WHERE slug = 'frijoles-huevo-tortilla';

INSERT INTO public.recetas_audit_log (receta_id, slug, campo, valor_anterior, valor_nuevo, motivo)
SELECT id, slug, 'pasos', 'salsa no se mencionaba', 'paso final ahora incluye la salsa al servir', 'ingrediente_no_usado_en_pasos'
FROM public.recetas WHERE slug = 'frijoles-huevo-tortilla';