-- Bucket público para imágenes de recetas generadas con IA
INSERT INTO storage.buckets (id, name, public)
VALUES ('recetas-imagenes', 'recetas-imagenes', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas: lectura pública, escritura solo service role (las imágenes se suben desde script con service role)
CREATE POLICY "Recetas imagenes son públicas"
ON storage.objects
FOR SELECT
USING (bucket_id = 'recetas-imagenes');
