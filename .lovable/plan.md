
# Etapa 1: Banco + Auth + Seed + Onboarding

Vou executar a primeira fase do Desayuno Fit. Ao final, mostro o schema SQL, 3-5 receitas seed para revisar o tom em espanhol neutro, e o fluxo login + onboarding funcionando.

## 1. Configuração base
- Conectar **Lovable Cloud** (Supabase) ao projeto
- Configurar paleta de cores (coral/oliva/creme/mostarda) em `src/styles.css` via tokens semânticos Tailwind v4
- Adicionar fontes **Playfair Display** (títulos) + **Inter** (corpo) no `__root.tsx`

## 2. Schema do banco (migration)

**Enum:**
- `app_role` ('admin', 'user')
- `plan_type` ('mensual', 'semestral', 'anual', 'inactivo')

**Tabelas:**
- `profiles` — id (FK auth.users), email, nombre, plan_type, plan_start_date, plan_end_date, hotmart_transaction_id, preferencias (jsonb), onboarding_completado (bool), created_at
- `recetas` — id, slug, titulo, descripcion, tiempo_minutos, calorias, porciones, dificultad, categoria, badges (text[]), imagen_url, ingredientes (jsonb), pasos (jsonb), tip_nutricionista, info_nutricional (jsonb), categoria_ingrediente_principal, created_at
- `favoritos` — user_id, receta_id, UNIQUE(user_id, receta_id)
- `recetas_hechas` — user_id, receta_id, fecha, rating
- `lista_compras` — user_id, items (jsonb), semana, updated_at
- `semana_planificada` — user_id, semana, dias (jsonb com 7 receta_ids)
- `user_roles` — user_id, role + função `has_role()` SECURITY DEFINER

**RLS:** ativo em todas. Receitas legíveis apenas por usuários com plano ativo (`plan_end_date > now()`). Resto: cada usuário só acessa seus dados.

**Trigger:** `handle_new_user()` cria perfil automaticamente após signup com `plan_type = 'inactivo'` (signups manuais — Hotmart sobrescreverá depois via webhook).

## 3. Auth (email/senha)
- Cliente Supabase já existente em `src/integrations/supabase/client.ts`
- Hook `useAuth` com `onAuthStateChange` (configurado ANTES de `getSession`)
- Rotas:
  - `/login` — email + senha + link "¿Olvidaste tu contraseña?" + link "Empieza aquí" → Hotmart
  - `/forgot-password` — envia email com `redirectTo: /reset-password`
  - `/reset-password` — define nova senha (rota pública, fora de `_authenticated`)
- Layout protegido `_authenticated.tsx` com `beforeLoad` redirecionando para `/login` se não autenticado

## 4. Onboarding `/onboarding`
- Tela de boas-vindas após primeiro login
- **Botão "Saltar por ahora"** bem visível no canto superior direito
- Campos: nombre + checkboxes de preferências (sin gluten, alta proteína, sin azúcar, vegetariano)
- Salva em `profiles.preferencias` e marca `onboarding_completado = true`
- Pular também marca `onboarding_completado = true` (não força de novo)
- Após concluir → redireciona para `/app` (placeholder por enquanto, conteúdo real na Etapa 3)

## 5. Seed das 20 receitas
- Migration de seed inserindo 20 receitas em **espanhol neutro LATAM**
- Termos: "aguacate", "jugo", "fresa", "frijoles" (não "judías"/"zumo"/"frutilla")
- Tom caloroso e direto: "Listo en 5 minutos, perfecto para empezar el día con energía"
- Imagens via Unsplash (`https://images.unsplash.com/photo-...?auto=format&fit=crop&w=800&q=80`)
- Variedade: 8 doces, 6 salgados, 3 bebidas, 2 panes, 1 snack
- Cada receita: 3-8 ingredientes, 4-7 passos, 1-3 badges, tip da nutricionista em 1-2 frases

## 6. Placeholder `/app` mínimo
- Rota `/app` em `_authenticated/app.tsx` apenas com mensagem "Bienvenida [nombre] — el catálogo llega en la próxima etapa"
- Permite testar o fluxo completo de login + onboarding + redirect

## Detalhes técnicos
- **Tela "plan inactivo"** ainda NÃO nesta etapa (vai junto com guarda de plano na Etapa 5) — por enquanto, qualquer usuário autenticado entra em `/app` mesmo com plano inativo
- Rota `_authenticated.tsx` verifica apenas autenticação nesta fase
- Após login, lógica decide: se `onboarding_completado = false` → `/onboarding`; senão → `/app`

## O que entrego para revisão
1. **SQL completo** da migration (tabelas, RLS, função `has_role`, trigger)
2. **5 receitas seed em destaque** com título/descrição/passos/tip para você validar tom e espanhol
3. **Fluxo navegável**: criar conta → login → onboarding (com botão Saltar visível) → `/app`

Após sua aprovação, sigo para a Etapa 2 (landing pública com 3 planos + login estilizado).
