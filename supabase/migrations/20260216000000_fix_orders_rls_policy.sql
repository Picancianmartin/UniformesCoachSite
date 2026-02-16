-- ============================================================
-- PASSO 1: Listar todas as colunas da tabela "orders"
-- Execute esta query no Editor SQL do Supabase para descobrir
-- o nome exato de cada coluna (incluindo a de ID do usuário).
-- ============================================================

-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_schema = 'public'
--   AND table_name = 'orders'
-- ORDER BY ordinal_position;


-- ============================================================
-- PASSO 2: Remover políticas antigas e criar nova política
-- de INSERT para usuários autenticados.
-- ============================================================

-- 2a. Remover todas as políticas existentes da tabela "orders"
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.orders;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.orders;
DROP POLICY IF EXISTS "insert_orders_policy" ON public.orders;

-- 2b. Garantir que o RLS esteja ativado
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- NOTA DE SEGURANÇA: As políticas abaixo permitem acesso total a
-- qualquer usuário autenticado. Isso é intencional como solução
-- temporária porque a coluna de ID do usuário ainda não foi
-- identificada. Após executar o Passo 1 e descobrir o nome correto
-- da coluna (ex: cliente_id, profile_id), substitua estas políticas
-- por versões mais restritivas como:
--   USING (auth.uid() = <nome_da_coluna>)

-- 2c. Política de INSERT: qualquer usuário autenticado pode inserir
CREATE POLICY "Allow insert for authenticated users"
  ON public.orders
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.role() = 'authenticated');

-- 2d. Política de SELECT: qualquer usuário autenticado pode ler
CREATE POLICY "Allow select for authenticated users"
  ON public.orders
  FOR SELECT
  TO authenticated
  USING (true);

-- 2e. Política de UPDATE: qualquer usuário autenticado pode atualizar
CREATE POLICY "Allow update for authenticated users"
  ON public.orders
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 2f. Política de DELETE: qualquer usuário autenticado pode deletar
CREATE POLICY "Allow delete for authenticated users"
  ON public.orders
  FOR DELETE
  TO authenticated
  USING (true);


-- ============================================================
-- PASSO 3: Desativar RLS temporariamente (para testes)
-- Descomente a linha abaixo APENAS se precisar testar se o
-- problema é realmente a política ou outra coisa.
-- LEMBRE-SE de reativar depois com ENABLE ROW LEVEL SECURITY.
-- ============================================================

-- ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
