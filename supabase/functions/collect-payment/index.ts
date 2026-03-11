import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

const JULYPAY_BASE = 'https://app.julypay.net/api/v1'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })
    }

    const userId = user.id
    const { phone, amount, network } = await req.json()

    if (!phone || !amount || amount < 1000) {
      return new Response(JSON.stringify({ error: 'Invalid phone or amount' }), { status: 400, headers: corsHeaders })
    }

    // Format phone to 256 format
    let formattedPhone = phone.replace(/\s+/g, '').replace(/^0/, '256').replace(/^\+/, '')
    if (!formattedPhone.startsWith('256')) {
      formattedPhone = '256' + formattedPhone
    }

    const apiKey = Deno.env.get('JULYPAY_API_KEY')
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Payment service not configured' }), { status: 500, headers: corsHeaders })
    }

    // Send collect payment request to JulyPay
    const collectRes = await fetch(`${JULYPAY_BASE}/wallet/collect-payment`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        customer_phone: formattedPhone,
        amount: amount,
        description: `Capital Gain Investment deposit`,
        customer_name: userId,
      }),
    })

    const collectData = await collectRes.json()

    if (!collectRes.ok || !collectData.success) {
      return new Response(JSON.stringify({ 
        error: collectData.message || 'Payment request failed',
        success: false 
      }), { status: 400, headers: corsHeaders })
    }

    const transactionId = collectData.data?.transaction_id

    // Create a pending transaction
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    await adminClient.from('transactions').insert({
      user_id: userId,
      type: 'recharge',
      amount: amount,
      status: 'pending',
      description: `Deposit via ${network?.toUpperCase() || 'Mobile Money'} - ${phone} (Ref: ${transactionId})`,
    })

    return new Response(JSON.stringify({
      success: true,
      transaction_id: transactionId,
      message: 'STK push sent to your phone. Please enter your PIN to confirm.',
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return new Response(JSON.stringify({ error: message }), { status: 500, headers: corsHeaders })
  }
})
