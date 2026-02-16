# Solução para o Erro de RLS na Tabela `orders`

Este documento contém os comandos SQL que você precisa executar no Editor SQL do Supabase para resolver o problema de Row-Level Security (RLS) na tabela `orders`.

---

## Passo 1: Listar Todas as Colunas da Tabela `orders`

Execute este comando para descobrir o nome exato de todas as colunas da tabela `orders`:

```sql
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
```

**O que este comando faz:**
- Lista todas as colunas da tabela `orders`
- Mostra o tipo de dado de cada coluna
- Indica quais colunas aceitam NULL
- Exibe o valor padrão (se houver)

Com isso, você saberá se existe uma coluna como `user_id`, `cliente_id`, `profile_id`, `owner_id`, ou qualquer outra que referencie o usuário.

---

## Passo 2: Remover Políticas Antigas e Criar Nova Política para Usuários Autenticados

### 2.1 - Remover TODAS as Políticas Existentes da Tabela `orders`

```sql
DROP POLICY IF EXISTS "users_insert_own_orders" ON orders;
DROP POLICY IF EXISTS "insert_orders_policy" ON orders;
DROP POLICY IF EXISTS "enable_insert_for_authenticated_users" ON orders;
DROP POLICY IF EXISTS "allow_insert" ON orders;
```

**O que este comando faz:**
- Remove todas as políticas de RLS que podem estar causando conflito
- Use quantos `DROP POLICY` você achar necessário caso tenha outras políticas com nomes diferentes

---

### 2.2 - Criar Nova Política de Insert para Usuários Autenticados

Esta política permite que **qualquer usuário autenticado** possa inserir dados na tabela `orders`, **sem verificar nenhuma coluna de ID**:

```sql
CREATE POLICY "allow_authenticated_insert"
ON orders
FOR INSERT
TO authenticated
WITH CHECK (auth.role() = 'authenticated');
```

**O que esta política faz:**
- Permite INSERT na tabela `orders`
- Aplica-se apenas a usuários com o role `authenticated` (qualquer usuário logado no Supabase)
- NÃO verifica nenhuma coluna de user_id (não depende de relacionamento com perfil)
- É a solução mais simples quando você quer que usuários autenticados possam criar pedidos

---

### 2.3 - (OPCIONAL) Criar Políticas de SELECT/UPDATE/DELETE

Se você também precisa que os usuários possam visualizar, atualizar ou deletar pedidos, aqui estão comandos adicionais:

#### Permitir SELECT (Visualizar) para Usuários Autenticados:
```sql
CREATE POLICY "allow_authenticated_select"
ON orders
FOR SELECT
TO authenticated
USING (auth.role() = 'authenticated');
```

#### Permitir UPDATE (Atualizar) para Usuários Autenticados:
```sql
CREATE POLICY "allow_authenticated_update"
ON orders
FOR UPDATE
TO authenticated
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');
```

#### Permitir DELETE (Deletar) para Usuários Autenticados:
```sql
CREATE POLICY "allow_authenticated_delete"
ON orders
FOR DELETE
TO authenticated
USING (auth.role() = 'authenticated');
```

---

## Passo 3: Desativar RLS Temporariamente (Para Testes)

Se você quiser testar se o problema é realmente a política de RLS ou se há outro erro, pode desativar temporariamente o RLS:

```sql
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
```

**⚠️ ATENÇÃO:** Com o RLS desabilitado, **qualquer usuário (mesmo não autenticado)** poderá acessar TODOS os dados da tabela `orders`. Só use este comando para testes e depois reative o RLS!

---

### Para Reativar o RLS:

```sql
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
```

Depois de reativar, não esqueça de aplicar as políticas do Passo 2.

---

## Resumo da Solução

1. **Execute o Passo 1** para ver as colunas da tabela
2. **Execute os comandos do Passo 2.1 e 2.2** para remover políticas antigas e criar uma nova política simples
3. **Se o erro persistir**, execute o Passo 3 para desativar o RLS e testar
4. **Se funcionar sem RLS**, o problema era a política. Reative o RLS e garanta que a política do Passo 2.2 foi criada corretamente.

---

## Notas Importantes

- A política criada no **Passo 2.2** permite que **qualquer usuário autenticado** insira pedidos
- Se você quiser uma política mais restritiva no futuro (ex: cada usuário só vê seus próprios pedidos), você precisará:
  1. Adicionar uma coluna na tabela `orders` que referencie o usuário (ex: `user_id UUID REFERENCES auth.users(id)`)
  2. Atualizar a aplicação para preencher essa coluna ao criar pedidos
  3. Criar políticas que usem `auth.uid() = user_id`

- Por enquanto, a solução mais simples é a do Passo 2.2, que permite inserts para todos os usuários autenticados.

---

## Como Testar

Após executar os comandos acima:

1. Faça login na sua aplicação
2. Tente adicionar um pedido ao carrinho e finalizar o pagamento
3. Verifique se o pedido é criado sem erros de RLS
4. Verifique no banco de dados se o pedido foi inserido corretamente

Se ainda houver erros, revise:
- Se o RLS está ativado (`SELECT * FROM pg_tables WHERE tablename = 'orders';` e verifique a coluna `rowsecurity`)
- Se a política foi criada (`SELECT * FROM pg_policies WHERE tablename = 'orders';`)
- Se há logs de erro no Supabase que indiquem outros problemas
