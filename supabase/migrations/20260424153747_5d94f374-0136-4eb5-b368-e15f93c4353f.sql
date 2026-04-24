-- Bucket público para a VSL do hero
INSERT INTO storage.buckets (id, name, public)
VALUES ('vsl', 'vsl', true)
ON CONFLICT (id) DO NOTHING;

-- Leitura pública (necessária para o <video> tocar na landing)
CREATE POLICY "VSL é publicamente acessível"
ON storage.objects
FOR SELECT
USING (bucket_id = 'vsl');

-- Apenas admins podem subir
CREATE POLICY "Admins podem subir VSL"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'vsl'
  AND public.has_role(auth.uid(), 'admin')
);

-- Apenas admins podem atualizar
CREATE POLICY "Admins podem atualizar VSL"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'vsl'
  AND public.has_role(auth.uid(), 'admin')
);

-- Apenas admins podem deletar
CREATE POLICY "Admins podem deletar VSL"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'vsl'
  AND public.has_role(auth.uid(), 'admin')
);