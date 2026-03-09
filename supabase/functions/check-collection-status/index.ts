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

    const token = authHeader.replace('Bearer ', '')
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token)
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })
    }

    const userId = claimsData.claims.sub as string
    const { transaction_id } = await req.json()

    if (!transaction_id) {
      return new Response(JSON.stringify({ error: 'Missing transaction_id' }), { status: 400, headers: corsHeaders })
    }

    const apiKey = Deno.env.get('JULYPAY_API_KEY')
    
    const statusRes = await fetch(`${JULYPAY_BASE}/wallet/collections/${transaction_id}/status`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
      },
    })

    const statusData = await statusRes.json()
    const status = statusData.status || statusData.data?.status || 'processing'

    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    if (status === 'completed' || status === 'successful') {
      // Update transaction to completed
      await adminClient.from('transactions')
        .update({ status: 'completed' })
        .eq('user_id', userId)
        .like('description', `%Ref: ${transaction_id}%`)
        .eq('status', 'pending')

      // Get the transaction amount
      const { data: txData } = await adminClient.from('transactions')
        .select('amount')
        .eq('user_id', userId)
        .like('description', `%Ref: ${transaction_id}%`)
        .single()

      if (txData) {
        const amount = Number(txData.amount)
        // Get current profile
        const { data: profileData } = await adminClient.from('profiles')
          .select('account_balance, recharge_balance')
          .eq('user_id', userId)
          .single()

        if (profileData) {
          await adminClient.from('profiles')
            .update({
              account_balance: Number(profileData.account_balance) + amount,
              recharge_balance: Number(profileData.recharge_balance) + amount,
            })
            .eq('user_id', userId)
        }
      }

      return new Response(JSON.stringify({ status: 'completed', success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    } else if (status === 'failed' || status === 'cancelled') {
      await adminClient.from('transactions')
        .update({ status: 'failed' })
        .eq('user_id', userId)
        .like('description', `%Ref: ${transaction_id}%`)
        .eq('status', 'pending')

      return new Response(JSON.stringify({ status: 'failed', success: false, message: statusData.failure_reason || 'Payment was cancelled or failed' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    return new Response(JSON.stringify({ status: 'processing', success: false }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders })
  }
})
