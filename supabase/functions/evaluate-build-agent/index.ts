import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BuildSlot {
  slotName: string;
  item?: { id: string; name: string; stats: Record<string, number> };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { userId, gameId, buildData } = await req.json();

    if (!userId || !gameId || !buildData) {
      throw new Error('Missing required fields: userId, gameId, buildData');
    }

    // Fetch user's items for this game
    const { data: userItems, error: itemsError } = await supabase
      .from('items')
      .select('*')
      .eq('user_id', userId)
      .eq('game_id', gameId);

    if (itemsError) throw itemsError;

    // Fetch game info
    const { data: gameInfo, error: gameError } = await supabase
      .from('games_info')
      .select('*')
      .eq('id', gameId)
      .single();

    if (gameError) throw gameError;

    // Calculate current build stats
    const buildSlots: BuildSlot[] = buildData.buildSlots || [];
    const currentStats: Record<string, number> = {};
    
    buildSlots.forEach((slot: BuildSlot) => {
      if (slot.item?.stats) {
        Object.entries(slot.item.stats).forEach(([stat, value]) => {
          currentStats[stat] = (currentStats[stat] || 0) + value;
        });
      }
    });

    // AI Analysis with OpenAI or Gemini
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    const geminiKey = Deno.env.get('GEMINI_API_KEY');

    const prompt = `Analyze this game build and provide optimization suggestions.

Game: ${gameInfo.game_name}
Current Build Stats: ${JSON.stringify(currentStats)}
Equipped Items: ${buildSlots.map(s => s.item?.name || 'Empty').join(', ')}

Available User Items: ${userItems.slice(0, 20).map(i => `${i.name} (${i.slot}): ${JSON.stringify(i.stats)}`).join(', ')}

Provide:
1. Pros (3-5 strengths)
2. Cons (3-5 weaknesses)
3. Suggestions (specific item swaps with reasoning)
4. Overall score (0-100)

Return as JSON: { "pros": [], "cons": [], "suggestions": [], "overallScore": 0 }`;

    let evaluationResult;

    // Try OpenAI first
    if (openaiKey) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: 'You are a game build optimizer. Return only valid JSON.' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 1500
          }),
        });

        const data = await response.json();
        evaluationResult = JSON.parse(data.choices[0].message.content);
      } catch (openaiError) {
        console.error('OpenAI failed, trying Gemini...', openaiError);
      }
    }

    // Fallback to Gemini
    if (!evaluationResult && geminiKey) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 1500 }
          }),
        });

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
        evaluationResult = JSON.parse(text.replace(/```json\n?/g, '').replace(/```/g, ''));
      } catch (geminiError) {
        console.error('Gemini failed, using fallback...', geminiError);
      }
    }

    // Final fallback - statistical analysis
    if (!evaluationResult) {
      const totalStats = Object.values(currentStats).reduce((sum, val) => sum + val, 0);
      evaluationResult = {
        pros: ['Build has been created', 'Items are equipped'],
        cons: ['AI analysis unavailable', 'Using basic statistical evaluation'],
        suggestions: [],
        overallScore: Math.min(Math.round((totalStats / 1000) * 100), 100)
      };
    }

    // Log to agent_logs
    await supabase.from('agent_logs').insert({
      agent_name: 'evaluate-build-agent',
      input: { userId, gameId, buildData },
      output: evaluationResult,
      status: 'success',
      execution_time_ms: Date.now() - startTime
    });

    return new Response(
      JSON.stringify({ status: 'ok', result: evaluationResult }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Evaluate-build agent error:', error);
    
    await supabase.from('agent_logs').insert({
      agent_name: 'evaluate-build-agent',
      input: {},
      output: null,
      status: 'error',
      error_message: error instanceof Error ? error.message : 'Unknown error',
      execution_time_ms: Date.now() - startTime
    });

    return new Response(
      JSON.stringify({ 
        status: 'error', 
        reason: error instanceof Error ? error.message : 'Failed to evaluate build' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
