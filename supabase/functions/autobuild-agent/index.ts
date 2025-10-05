import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BuildPreferences {
  focus: 'damage' | 'defense' | 'balanced';
  mode: 'pve' | 'pvp' | 'hybrid';
  subfocus?: string[];
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
    const { userId, gameId, preferences } = await req.json();

    if (!userId || !gameId || !preferences) {
      throw new Error('Missing required fields: userId, gameId, preferences');
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

    // Group items by slot
    const itemsBySlot: Record<string, any[]> = {};
    userItems.forEach(item => {
      if (!itemsBySlot[item.slot]) {
        itemsBySlot[item.slot] = [];
      }
      itemsBySlot[item.slot].push(item);
    });

    // AI Analysis with OpenAI or Gemini
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    const geminiKey = Deno.env.get('GEMINI_API_KEY');

    const prefs: BuildPreferences = preferences;
    const prompt = `Create the optimal game build based on user preferences and available items.

Game: ${gameInfo.game_name}
Preferences: Focus=${prefs.focus}, Mode=${prefs.mode}, Subfocus=${prefs.subfocus?.join(', ') || 'none'}

Available Items by Slot:
${Object.entries(itemsBySlot).map(([slot, items]) => 
  `${slot}: ${items.slice(0, 10).map(i => `${i.name} (${i.rarity}): ${JSON.stringify(i.stats)}`).join('; ')}`
).join('\n')}

Create the best build by selecting ONE item per slot. Return as JSON:
{
  "recommendedBuild": [
    { "slot": "helm", "itemId": "uuid", "itemName": "Dark Crown" }
  ],
  "score": 94,
  "totalStats": { "attack": 1200, "defense": 800 },
  "pros": ["High damage output", "Good survivability"],
  "cons": ["Lower speed"]
}`;

    let buildResult;

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
            max_tokens: 2000
          }),
        });

        const data = await response.json();
        buildResult = JSON.parse(data.choices[0].message.content);
      } catch (openaiError) {
        console.error('OpenAI failed, trying Gemini...', openaiError);
      }
    }

    // Fallback to Gemini
    if (!buildResult && geminiKey) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 2000 }
          }),
        });

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
        buildResult = JSON.parse(text.replace(/```json\n?/g, '').replace(/```/g, ''));
      } catch (geminiError) {
        console.error('Gemini failed, using fallback...', geminiError);
      }
    }

    // Final fallback - statistical selection
    if (!buildResult) {
      const recommendedBuild = [];
      const totalStats: Record<string, number> = {};
      
      for (const [slot, items] of Object.entries(itemsBySlot)) {
        if (items.length > 0) {
          // Select highest rarity or best stats
          const bestItem = items.reduce((best, item) => {
            const itemTotal = Object.values(item.stats || {}).reduce((sum: number, val) => sum + (val as number), 0);
            const bestTotal = Object.values(best.stats || {}).reduce((sum: number, val) => sum + (val as number), 0);
            return itemTotal > bestTotal ? item : best;
          }, items[0]);

          recommendedBuild.push({
            slot: slot,
            itemId: bestItem.id,
            itemName: bestItem.name
          });

          Object.entries(bestItem.stats || {}).forEach(([stat, value]) => {
            totalStats[stat] = (totalStats[stat] || 0) + (value as number);
          });
        }
      }

      buildResult = {
        recommendedBuild,
        score: Math.min(Math.round((recommendedBuild.length / (gameInfo.slots?.length || 6)) * 100), 100),
        totalStats,
        pros: ['Optimized for highest stats', 'Uses best available items'],
        cons: ['AI analysis unavailable', 'Basic statistical optimization']
      };
    }

    // Log to agent_logs
    await supabase.from('agent_logs').insert({
      agent_name: 'autobuild-agent',
      input: { userId, gameId, preferences },
      output: buildResult,
      status: 'success',
      execution_time_ms: Date.now() - startTime
    });

    return new Response(
      JSON.stringify({ status: 'ok', result: buildResult }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Autobuild agent error:', error);
    
    await supabase.from('agent_logs').insert({
      agent_name: 'autobuild-agent',
      input: {},
      output: null,
      status: 'error',
      error_message: error instanceof Error ? error.message : 'Unknown error',
      execution_time_ms: Date.now() - startTime
    });

    return new Response(
      JSON.stringify({ 
        status: 'error', 
        reason: error instanceof Error ? error.message : 'Failed to generate build' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
