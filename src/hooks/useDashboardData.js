import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

export function useDashboardData() {
  const [metrics, setMetrics] = useState({ 
    sales: [], 
    topProducts: [], 
    topCollections: [], // Novo
    orderStatus: []     // Novo
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // 1. Vendas Diárias
        const { data: sales } = await supabase.from('view_vendas_diarias').select('*');
        
        // 2. Top Produtos
        const { data: products } = await supabase.from('view_performance_categorias').select('*');

        // 3. Top Coleções (NOVO)
        const { data: collections } = await supabase.from('view_performance_colecoes').select('*');

        // 4. Status Operacional (NOVO)
        const { data: status } = await supabase.from('view_status_pedidos').select('*');

        setMetrics({ 
          sales: sales || [], 
          topProducts: products || [],
          topCollections: collections || [],
          orderStatus: status || []
        });
        
      } catch (error) {
        console.error("Erro dashboard:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return { metrics, loading };
}