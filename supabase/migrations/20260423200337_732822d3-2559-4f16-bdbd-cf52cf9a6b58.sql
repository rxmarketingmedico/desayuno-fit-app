-- 1. Promover csr.soriano@gmail.com a admin
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'csr.soriano@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- 2. Permitir que admins INSERT em user_roles (promover outros admins)
CREATE POLICY "admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 3. Permitir que admins DELETE em user_roles (remover outros admins)
-- Proteção: impede que um admin remova a si mesmo (evita ficar sem admins).
CREATE POLICY "admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
  AND user_id <> auth.uid()
);

-- 4. Garante constraint única (caso a tabela não tenha) pra evitar duplicação
-- de roles. Idempotente: só cria se não existir.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'user_roles_user_id_role_key'
  ) THEN
    ALTER TABLE public.user_roles
      ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);
  END IF;
END$$;