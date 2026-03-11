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
    const { phone, amount, fee_percent } = await req.json()

    if (!phone || !amount || amount < 1000) {
      return new Response(JSON.stringify({ error: 'Invalid phone or amount' }), { status: 400, headers: corsHeaders })
    }

    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Verify balance
    const { data: profileData } = await adminClient.from('profiles')
      .select('account_balance')
      .eq('user_id', userId)
      .single()

    if (!profileData || Number(profileData.account_balance) < amount) {
      return new Response(JSON.stringify({ error: 'Insufficient balance' }), { status: 400, headers: corsHeaders })
    }

    // Verify active investment
    const { data: investments } = await adminClient.from('investments')
      .select('id')
      .eq('user_id', userId)
      .eq('active', true)
      .limit(1)

    if (!investments || investments.length === 0) {
      return new Response(JSON.stringify({ error: 'Active investment required to withdraw' }), { status: 400, headers: corsHeaders })
    }

    const feeAmount = amount * (fee_percent || 15) / 100
    const amountAfterFee = amount - feeAmount

    // Format phone
    let formattedPhone = phone.replace(/\s+/g, '').replace(/^0/, '256').replace(/^\+/, '')
    if (!formattedPhone.startsWith('256')) {
      formattedPhone = '256' + formattedPhone
    }

    const apiKey = Deno.env.get('JULYPAY_API_KEY')
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Payment service not configured' }), { status: 500, headers: corsHeaders })
    }

    // Send money via JulyPay
    const sendRes = await fetch(`${JULYPAY_BASE}/wallet/send-money`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        phone: formattedPhone,
        amount: amountAfterFee,
        description: `Capital Gain Investment withdrawal`,
      }),
    })

    const sendData = await sendRes.json()

    // Deduct balance regardless (we'll handle failed separately)
    await adminClient.from('profiles')
      .update({
        account_balance: Number(profileData.account_balance) - amount,
      })
      .eq('user_id', userId)

    const txStatus = (sendRes.ok && sendData.success) ? 'completed' : 'failed'

    await adminClient.from('transactions').insert({
      user_id: userId,
      type: 'withdrawal',
      amount: amountAfterFee,
      status: txStatus,
      description: `Withdrawal to ${phone} (Fee: ${fee_percent}%) - ${sendData.data?.reference || ''}`,
    })

    if (!sendRes.ok || !sendData.success) {
      // Refund balance on failure
      await adminClient.from('profiles')
        .update({
          account_balance: Number(profileData.account_balance),
        })
        .eq('user_id', userId)

      return new Response(JSON.stringify({
        success: false,
        error: sendData.message || 'Withdrawal failed. Please try again.',
      }), { status: 400, headers: corsHeaders })
    }

    return new Response(JSON.stringify({
      success: true,
      message: `${amountAfterFee.toLocaleString()} UGX sent to ${phone} successfully!`,
      amount_sent: amountAfterFee,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return new Response(JSON.stringify({ error: message }), { status: 500, headers: corsHeaders })
  }
})
