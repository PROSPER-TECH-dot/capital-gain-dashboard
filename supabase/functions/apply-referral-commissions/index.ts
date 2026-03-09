import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

const jsonHeaders = {
  ...corsHeaders,
  'Content-Type': 'application/json',
}

type CommissionTarget = {
  userId: string
  level: 1 | 2 | 3
  percent: number
}

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

    const body = await req.json().catch(() => ({}))
    const investorUserId = String(body?.investor_user_id ?? '')
    const investmentAmount = Number(body?.investment_amount ?? 0)

    if (!investorUserId || !Number.isFinite(investmentAmount) || investmentAmount <= 0) {
      return reply({ error: 'Invalid request payload' }, 400)
    }

    if (investorUserId !== user.id) {
      return reply({ error: 'Forbidden' }, 403)
    }

    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { data: investorProfile, error: investorError } = await adminClient
      .from('profiles')
      .select('upline_user_id')
      .eq('user_id', investorUserId)
      .maybeSingle()

    if (investorError) {
      return reply({ error: investorError.message }, 500)
    }

    if (!investorProfile?.upline_user_id) {
      return reply({ success: true, credited: [] })
    }

    const targets: CommissionTarget[] = []

    const level1UserId = investorProfile.upline_user_id
    targets.push({ userId: level1UserId, level: 1, percent: 25 })

    const { data: level1Profile } = await adminClient
      .from('profiles')
      .select('upline_user_id')
      .eq('user_id', level1UserId)
      .maybeSingle()

    if (level1Profile?.upline_user_id) {
      const level2UserId = level1Profile.upline_user_id
      targets.push({ userId: level2UserId, level: 2, percent: 3 })

      const { data: level2Profile } = await adminClient
        .from('profiles')
        .select('upline_user_id')
        .eq('user_id', level2UserId)
        .maybeSingle()

      if (level2Profile?.upline_user_id) {
        targets.push({ userId: level2Profile.upline_user_id, level: 3, percent: 1 })
      }
    }

    const credited: Array<{ user_id: string; level: number; amount: number }> = []

    for (const target of targets) {
      const amount = Math.floor((investmentAmount * target.percent) / 100)
      if (amount <= 0) continue

      const { data: targetProfile, error: targetProfileError } = await adminClient
        .from('profiles')
        .select('account_balance, cumulative_income')
        .eq('user_id', target.userId)
        .maybeSingle()

      if (targetProfileError || !targetProfile) continue

      const { error: updateError } = await adminClient
        .from('profiles')
        .update({
          account_balance: Number(targetProfile.account_balance) + amount,
          cumulative_income: Number(targetProfile.cumulative_income) + amount,
        })
        .eq('user_id', target.userId)

      if (updateError) {
        return reply({ error: updateError.message }, 500)
      }

      const { error: txError } = await adminClient
        .from('transactions')
        .insert({
          user_id: target.userId,
          type: 'referral',
          amount,
          status: 'completed',
          description: `L${target.level} referral commission from user ${investorUserId} investment of ${investmentAmount} UGX`,
        })

      if (txError) {
        return reply({ error: txError.message }, 500)
      }

      credited.push({ user_id: target.userId, level: target.level, amount })
    }

    return reply({ success: true, credited })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return reply({ error: message }, 500)
  }
})
