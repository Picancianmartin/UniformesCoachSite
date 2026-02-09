import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { MercadoPagoConfig, Payment } from 'npm:mercadopago'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // 1. Libera o CORS (Para seu site conseguir chamar a função)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { transaction_amount, description, payer_first_name, payer_email } = await req.json()

    // 2. Conecta no Mercado Pago usando a chave secreta (que vamos configurar jájá)
    const client = new MercadoPagoConfig({ accessToken: Deno.env.get('MP_ACCESS_TOKEN')! })
    const payment = new Payment(client)

    // 3. Cria o PIX
    const body = {
      transaction_amount: Number(transaction_amount),
      description: description,
      payment_method_id: 'pix',
      payer: {
        email: payer_email || 'cliente@coachstore.com',
        first_name: payer_first_name
      },
      // Nota: O Webhook configuraremos num passo futuro, por enquanto vamos focar em gerar o QR
    }

    const response = await payment.create({ body })

    // 4. Devolve o QR Code pro React
    return new Response(
      JSON.stringify({
        id: response.id,
        qr_code: response.point_of_interaction.transaction_data.qr_code,
        qr_code_base64: response.point_of_interaction.transaction_data.qr_code_base64
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})