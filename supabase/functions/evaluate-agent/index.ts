import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BuildItem {
  slotName: string;
  item?: {
    id: string;
    name: string;
    slot: string;
    rarity: string;
    stats: Record<string, number>;
    perks?: Record<string, any>;
  };
  gems?: any[];
}

interface EvaluationResult {
  pros: string[];
  cons: string[];
  suggestions: {
    slot: string;
    currentItem?: string;
    suggestedItem: {
      id: string;
      name: string;
      rarity: string;
      stats: Record<string, number>;
    };
    reason: string;
    statImprovement: Record<string, number>;
  }[];
  overallScore: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting evaluate-agent function');
    
    const { buildData, gameId, userId } = await req.json();
    console.log('Received data:', { buildData, gameId, userId });

    if (!buildData || !gameId || !userId) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields: buildData, gameId, userId' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    const geminiKey = Deno.env.get('GOOGLE_GEMINI_VISION_KEY');

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user's items from database
    console.log('Fetching user items from database');
    const { data: userItems, error: itemsError } = await supabase
      .from('items')
      .select('*')
      .eq('user_id', userId)
      .eq('game_id', gameId);

    if (itemsError) {
      console.error('Error fetching user items:', itemsError);
      throw new Error('Failed to fetch user items');
    }

    console.log('Found user items:', userItems?.length || 0);

    // Get game metadata
    console.log('Fetching game metadata');
    const { data: gameInfo, error: gameError } = await supabase
      .from('games_info')
      .select('*')
      .eq('id', gameId)
      .single();

    if (gameError) {
      console.error('Error fetching game info:', gameError);
      throw new Error('Failed to fetch game information');
    }

    console.log('Game info loaded:', gameInfo.game_name);

    // Calculate current build stats
    const currentStats: Record<string, number> = {};
    const currentItems: BuildItem[] = buildData.buildSlots || [];
    
    currentItems.forEach((slot: BuildItem) => {
      if (slot.item?.stats) {
        Object.entries(slot.item.stats).forEach(([stat, value]) => {
          currentStats[stat] = (currentStats[stat] || 0) + (value as number);
        });
      }
    });

    console.log('Current build stats:', currentStats);

    // Prepare AI analysis prompt
    const analysisPrompt = `
    Analyze this ${gameInfo.game_name} build and provide optimization suggestions:

    CURRENT BUILD:
    ${currentItems.map(slot => `
    - ${slot.slotName}: ${slot.item ? `${slot.item.name} (${slot.item.rarity})` : 'Empty'}
      Stats: ${slot.item ? JSON.stringify(slot.item.stats) : 'N/A'}
    `).join('')}

    CURRENT TOTAL STATS: ${JSON.stringify(currentStats)}

    AVAILABLE ITEMS IN USER INVENTORY:
    ${userItems?.map(item => `
    - ${item.name} (${item.slot}, ${item.rarity})
      Stats: ${JSON.stringify(item.stats)}
      Perks: ${JSON.stringify(item.perks)}
    `).join('') || 'No items available'}

    GAME METADATA:
    - Stat priorities: ${JSON.stringify(gameInfo.stats)}
    - Available rarities: ${JSON.stringify(gameInfo.rarities)}
    - Perks system: ${JSON.stringify(gameInfo.perks)}

    Please provide:
    1. PROS: List 3-5 strengths of this build
    2. CONS: List 3-5 weaknesses or areas for improvement
    3. SUGGESTIONS: For each suggestion, provide:
       - Which slot to optimize
       - Current item name (if any)
       - Suggested replacement item from inventory
       - Detailed reason for the swap
       - Expected stat improvements

    Format your response as JSON with this structure:
    {
      "pros": ["strength 1", "strength 2", ...],
      "cons": ["weakness 1", "weakness 2", ...],
      "suggestions": [
        {
          "slot": "slot name",
          "currentItem": "current item name or null",
          "suggestedItem": {
            "id": "item_id",
            "name": "item name",
            "rarity": "rarity",
            "stats": {"stat": value}
          },
          "reason": "detailed explanation",
          "statImprovement": {"stat": change_value}
        }
      ],
      "overallScore": 85
    }

    Be specific and focus on meaningful improvements. Only suggest items that are actually available in the user's inventory.
    `;

    let evaluationResult: EvaluationResult;
    let provider = 'none';

    // Try OpenAI first
    if (openaiKey) {
      try {
        console.log('Sending request to OpenAI');
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: `You are an expert ${gameInfo.game_name} build optimizer. Provide detailed, actionable advice for improving builds based on available items and game mechanics.`
              },
              {
                role: 'user',
                content: analysisPrompt
              }
            ],
            temperature: 0.7,
            max_tokens: 2000,
          }),
        });

        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.status}`);
        }

        const aiResponse = await response.json();
        console.log('Received AI response from OpenAI');
        provider = 'openai';

        try {
          evaluationResult = JSON.parse(aiResponse.choices[0].message.content);
        } catch (parseError) {
          console.error('Failed to parse OpenAI response:', parseError);
          throw parseError;
        }
      } catch (error) {
        console.error('OpenAI failed:', error);
        if (!geminiKey) throw error;
      }
    }

    // Fallback to Google Gemini
    if (!evaluationResult! && geminiKey) {
      try {
        console.log('Falling back to Google Gemini');
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: `You are an expert ${gameInfo.game_name} build optimizer.\n\n${analysisPrompt}`
                }]
              }]
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`Gemini API error: ${response.status}`);
        }

        const geminiResponse = await response.json();
        console.log('Received AI response from Google Gemini');
        provider = 'google_gemini';

        const content = geminiResponse.candidates[0].content.parts[0].text;
        
        try {
          // Try to extract JSON from the response
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            evaluationResult = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error('No valid JSON found in Gemini response');
          }
        } catch (parseError) {
          console.error('Failed to parse Gemini response:', parseError);
          throw parseError;
        }
      } catch (error) {
        console.error('Google Gemini failed:', error);
        throw error;
      }
    }

    // Final fallback if no AI worked
    if (!evaluationResult!) {
      console.log('Using fallback evaluation (no AI available)');
      provider = 'fallback';
      evaluationResult = {
        pros: ["Build analysis completed"],
        cons: ["Unable to generate detailed analysis - no AI provider available"],
        suggestions: [],
        overallScore: 70
      };
    }

    // Log the analysis to agent_logs table
    await supabase.from('agent_logs').insert({
      agent_name: 'evaluate-agent',
      input: { buildData, gameId, userId, provider },
      output: evaluationResult,
      status: 'success',
      execution_time_ms: Date.now() - parseInt(req.headers.get('x-start-time') || '0')
    });

    console.log('Analysis completed successfully');

    return new Response(JSON.stringify({ 
      success: true, 
      result: evaluationResult 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in evaluate-agent function:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    // Log error to agent_logs
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      await supabase.from('agent_logs').insert({
        agent_name: 'evaluate-agent',
        input: { error: 'Failed to parse request' },
        output: null,
        status: 'error',
        error_message: errorMessage,
        execution_time_ms: 0
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }

    return new Response(JSON.stringify({ 
      error: errorMessage,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});