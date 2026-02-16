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
-- PASSO 2: Remover políticas antigas
-- ============================================

DROP POLICY IF EXISTS "users_insert_own_orders" ON orders;
DROP POLICY IF EXISTS "insert_orders_policy" ON orders;
DROP POLICY IF EXISTS "enable_insert_for_authenticated_users" ON orders;
DROP POLICY IF EXISTS "allow_insert" ON orders;

-- ============================================
-- PASSO 2: Criar política de INSERT para autenticados
-- ============================================

CREATE POLICY "allow_authenticated_insert"
ON orders
FOR INSERT
TO authenticated
WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- PASSO 2 (OPCIONAL): Políticas adicionais
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
-- ============================================

ALTER TABLE orders DISABLE ROW LEVEL SECURITY;

-- Para reativar depois:
-- ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
