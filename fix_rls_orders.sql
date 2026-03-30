-- ============================================
-- COMANDOS SQL - SOLUÇÃO RLS PARA TABELA ORDERS
-- ============================================

-- ============================================
-- PASSO 1: Listar colunas da tabela orders
-- ============================================

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM 
    information_schema.columns
WHERE 
    table_schema = 'public' 
    AND table_name = 'orders'
ORDER BY 
    ordinal_position;

-- ============================================
-- PASSO 2.0: Listar políticas existentes (OPCIONAL)
-- ============================================

-- Execute este comando para ver quais políticas existem:
SELECT policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'orders';

-- ============================================
-- PASSO 2.1: Remover políticas antigas
-- ============================================

-- Remova as políticas que aparecerem no resultado acima
-- Exemplos comuns:
DROP POLICY IF EXISTS "users_insert_own_orders" ON orders;
DROP POLICY IF EXISTS "insert_orders_policy" ON orders;
DROP POLICY IF EXISTS "enable_insert_for_authenticated_users" ON orders;
DROP POLICY IF EXISTS "allow_insert" ON orders;
-- Adicione mais linhas DROP POLICY conforme necessário

-- ============================================
-- PASSO 2.2: Criar política de INSERT para autenticados
-- ============================================

CREATE POLICY "allow_authenticated_insert"
ON orders
FOR INSERT
TO authenticated
WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- PASSO 2.3 (OPCIONAL): Políticas adicionais
-- ============================================

-- SELECT (Visualizar)
CREATE POLICY "allow_authenticated_select"
ON orders
FOR SELECT
TO authenticated
USING (auth.role() = 'authenticated');

-- UPDATE (Atualizar)
CREATE POLICY "allow_authenticated_update"
ON orders
FOR UPDATE
TO authenticated
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- DELETE (Deletar)
CREATE POLICY "allow_authenticated_delete"
ON orders
FOR DELETE
TO authenticated
USING (auth.role() = 'authenticated');

-- ============================================
-- PASSO 3: Desativar RLS (APENAS PARA TESTES)
-- ⚠️  PERIGO: NÃO USE EM PRODUÇÃO! ⚠️
-- ============================================

-- ⚠️  ATENÇÃO: Este comando deixa sua tabela COMPLETAMENTE desprotegida!
-- ⚠️  Qualquer pessoa (mesmo não autenticada) poderá acessar TODOS os dados!
-- ⚠️  Use APENAS em ambiente de desenvolvimento/teste!
-- ⚠️  NUNCA execute em produção!

-- Descomente a linha abaixo APENAS se você entende os riscos:
-- ALTER TABLE orders DISABLE ROW LEVEL SECURITY;

-- Para reativar depois (OBRIGATÓRIO):
-- ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
