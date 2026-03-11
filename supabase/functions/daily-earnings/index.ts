import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Get all active investments
    const { data: activeInvestments } = await adminClient
      .from('investments')
      .select('*')
      .eq('active', true)

    if (!activeInvestments || activeInvestments.length === 0) {
      return new Response(JSON.stringify({ message: 'No active investments', processed: 0 }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    let processed = 0

    for (const inv of activeInvestments) {
      const now = new Date()
      const endDate = new Date(inv.end_date)

      // Check if investment has expired
      if (now >= endDate) {
        await adminClient.from('investments').update({ active: false }).eq('id', inv.id)
        continue
      }

      const dailyEarning = Number(inv.amount) * Number(inv.daily_return) / 100

      // Update investment total_earned
      await adminClient.from('investments')
        .update({ total_earned: Number(inv.total_earned) + dailyEarning })
        .eq('id', inv.id)

      // Update profile balance and cumulative income
      const { data: profile } = await adminClient.from('profiles')
        .select('account_balance, cumulative_income')
        .eq('user_id', inv.user_id)
        .single()

      if (profile) {
        await adminClient.from('profiles')
          .update({
            account_balance: Number(profile.account_balance) + dailyEarning,
            cumulative_income: Number(profile.cumulative_income) + dailyEarning,
          })
          .eq('user_id', inv.user_id)
      }

      // Create earning transaction
      await adminClient.from('transactions').insert({
        user_id: inv.user_id,
        type: 'earning',
        amount: dailyEarning,
        status: 'completed',
        description: `Daily earning from investment of ${Number(inv.amount).toLocaleString()} UGX`,
      })

      processed++
    }

    return new Response(JSON.stringify({ message: 'Daily earnings processed', processed }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return new Response(JSON.stringify({ error: message }), { status: 500, headers: corsHeaders })
  }
})
