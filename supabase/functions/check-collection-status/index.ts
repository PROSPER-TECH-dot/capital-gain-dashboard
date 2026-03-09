import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

const jsonHeaders = {
  ...corsHeaders,
  'Content-Type': 'application/json',
}

const JULYPAY_BASE = 'https://app.julypay.net/api/v1'
const SUCCESS_STATUSES = new Set(['completed', 'successful', 'success'])
const FAILED_STATUSES = new Set(['failed', 'cancelled', 'canceled', 'rejected', 'declined', 'expired', 'timeout', 'failed_api_error', 'failed_api_unreachable', 'failed_unknown'])
const PROCESSING_STATUSES = new Set(['processing', 'pending', 'queued', 'initiated'])
const MAX_PENDING_MS = 5000

const normalizeStatus = (value: unknown) =>
  String(value ?? '')
    .trim()
    .toLowerCase()

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const reply = (payload: Record<string, unknown>, status = 200) =>
    new Response(JSON.stringify(payload), { status, headers: jsonHeaders })

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return reply({ error: 'Unauthorized' }, 401)
    }

    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: userError } = await userClient.auth.getUser()
    if (userError || !user) {
      return reply({ error: 'Unauthorized' }, 401)
    }

    const { transaction_id } = await req.json()
    if (!transaction_id) {
      return reply({ error: 'Missing transaction_id' }, 400)
    }

    const apiKey = Deno.env.get('JULYPAY_API_KEY')
    if (!apiKey) {
      return reply({ error: 'Payment service not configured' }, 500)
    }

    const userId = user.id
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { data: txRows, error: txError } = await adminClient
      .from('transactions')
      .select('id, amount, status, description, created_at')
      .eq('user_id', userId)
      .eq('type', 'recharge')
      .like('description', `%Ref: ${transaction_id}%`)
      .order('created_at', { ascending: false })
      .limit(1)

    if (txError) throw txError

    const pendingTx = txRows?.[0]
    if (!pendingTx) {
      return reply({ error: 'Transaction not found' }, 404)
    }

    if (pendingTx.status === 'completed') {
      return reply({ status: 'completed', success: true })
    }

    if (pendingTx.status === 'failed') {
      return reply({ status: 'failed', success: false, message: 'Payment was not confirmed.' })
    }

    const failPendingTransaction = async (message: string, reason = 'Auto-rejected: payment not confirmed by provider') => {
      const nextDescription = pendingTx.description?.includes(reason)
        ? pendingTx.description
        : `${pendingTx.description} (${reason})`

      await adminClient
        .from('transactions')
        .update({ status: 'failed', description: nextDescription })
        .eq('id', pendingTx.id)
        .eq('status', 'pending')

      return reply({ status: 'failed', success: false, message })
    }

    const txAgeMs = Date.now() - new Date(pendingTx.created_at).getTime()
    if (txAgeMs > MAX_PENDING_MS) {
      return await failPendingTransaction('Payment was not confirmed in time and was automatically rejected.')
    }

    let providerStatus = 'processing'
    let providerMessage = ''

    try {
      const statusRes = await fetch(`${JULYPAY_BASE}/wallet/collections/${transaction_id}/status`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json',
        },
      })

      if (!statusRes.ok) {
        providerStatus = 'failed_api_unreachable'
      } else {
        const statusData = await statusRes.json().catch(() => ({}))
        providerStatus = normalizeStatus(
          statusData?.status ??
          statusData?.data?.status ??
          statusData?.data?.transaction_status
        )

        providerMessage = statusData?.failure_reason || statusData?.message || ''

        if (!providerStatus) {
          providerStatus = 'failed_unknown'
        }
      }
    } catch {
      providerStatus = 'failed_api_error'
    }

    if (SUCCESS_STATUSES.has(providerStatus)) {
      const { data: updatedTx } = await adminClient
        .from('transactions')
        .update({ status: 'completed' })
        .eq('id', pendingTx.id)
        .eq('status', 'pending')
        .select('id')
        .maybeSingle()

      if (updatedTx) {
        const amount = Number(pendingTx.amount)
        const { data: profileData } = await adminClient
          .from('profiles')
          .select('account_balance, recharge_balance')
          .eq('user_id', userId)
          .single()

        if (profileData) {
          await adminClient
            .from('profiles')
            .update({
              account_balance: Number(profileData.account_balance) + amount,
              recharge_balance: Number(profileData.recharge_balance) + amount,
            })
            .eq('user_id', userId)
        }

        // NOTE: Referral commissions are NOT given on deposit.
        // They are given when the user INVESTS (handled in the Invest page).
      }

      return reply({ status: 'completed', success: true })
    }

    if (FAILED_STATUSES.has(providerStatus)) {
      return await failPendingTransaction(providerMessage || 'Payment request failed or was cancelled.', 'Auto-rejected: payment cancelled or failed')
    }

    if (PROCESSING_STATUSES.has(providerStatus)) {
      if (txAgeMs > MAX_PENDING_MS) {
        return await failPendingTransaction('Payment was not confirmed in time and was automatically rejected.')
      }

      return reply({ status: 'processing', success: false })
    }

    return await failPendingTransaction('Payment status was not recognized and the transaction was rejected.')
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return new Response(JSON.stringify({ error: message }), { status: 500, headers: jsonHeaders })
  }
})
