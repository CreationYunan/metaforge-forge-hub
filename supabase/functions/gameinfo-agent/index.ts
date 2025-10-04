import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GameInfoRequest {
  gameName: string;
}

interface GameMetadata {
  game_name: string;
  slots: string[];
  rarities: string[];
  stats: Record<string, any>;
  perks: Record<string, any>;
  gems: Record<string, any>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  let logData: {
    agent_name: string;
    status: 'success' | 'error';
    input: any;
    output: any;
    error_message: string | null;
    execution_time_ms: number;
  } = {
    agent_name: 'gameinfo-agent',
    status: 'error',
    input: null,
    output: null,
    error_message: null,
    execution_time_ms: 0
  };

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body = await req.json();
    
    // Input validation
    if (!body || typeof body !== 'object') {
      throw new Error('Request body must be a JSON object');
    }
    
    if (!body.gameName || typeof body.gameName !== 'string') {
      throw new Error('gameName is required and must be a string');
    }
    
    const gameName = body.gameName.trim();
    if (gameName.length === 0 || gameName.length > 100) {
      throw new Error('gameName must be between 1 and 100 characters');
    }
    
    logData.input = { gameName };

    // Check if game already exists
    const { data: existingGame } = await supabaseClient
      .from('games_info')
      .select('*')
      .eq('game_name', gameName)
      .single();

    if (existingGame) {
      logData.status = 'success';
      logData.output = { game_id: existingGame.id, provider: 'existing' };
      logData.execution_time_ms = Date.now() - startTime;
      
      await supabaseClient.from('agent_logs').insert(logData);
      
      console.log(`[GameInfo Agent] Game ${gameName} already exists`);
      return new Response(
        JSON.stringify({ 
          status: 'ok',
          data: {
            message: 'Game already exists',
            game: existingGame
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get AI API Keys (with fallback)
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    const geminiKey = Deno.env.get('GOOGLE_GEMINI_VISION_KEY');

    let gameMetadata: GameMetadata | null = null;
    let provider = 'none';

    // Create prompt for AI
    const prompt = `You are a gaming metadata expert. Generate comprehensive game metadata for "${gameName}".

Return a JSON object with this exact structure:
{
  "slots": ["head", "chest", "legs", "weapon", "offhand"],
  "rarities": ["common", "uncommon", "rare", "epic", "legendary"],
  "stats": {
    "strength": { "name": "Strength", "description": "Increases damage" },
    "dexterity": { "name": "Dexterity", "description": "Increases critical chance" }
  },
  "perks": {
    "fireDamage": { "name": "Fire Damage", "description": "Adds fire damage" }
  },
  "gems": {
    "ruby": { "name": "Ruby", "stats": { "strength": 10 } }
  }
}

For ${gameName}, provide realistic slots, rarities, stats, perks, and gems that match the game's actual systems.`;

    // Try OpenAI first, then Google Gemini
    if (openaiKey) {
      try {
        console.log('[GameInfo Agent] Using OpenAI');
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: 'You are a gaming metadata expert. Return only valid JSON.' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.7,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const content = data.choices[0].message.content;
          
          // Try to parse JSON from content
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const metadata = JSON.parse(jsonMatch[0]);
            gameMetadata = { game_name: gameName, ...metadata };
            provider = 'openai';
          } else {
            throw new Error('No valid JSON in OpenAI response');
          }
        } else {
          throw new Error(`OpenAI API error: ${response.status}`);
        }
      } catch (error) {
        console.error('[GameInfo Agent] OpenAI failed:', error);
        if (!geminiKey) throw error;
      }
    }

    // Fallback to Google Gemini
    if (!gameMetadata && geminiKey) {
      try {
        console.log('[GameInfo Agent] Using Google Gemini');
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [{ text: prompt }]
              }]
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        const content = data.candidates[0].content.parts[0].text;
        
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const metadata = JSON.parse(jsonMatch[0]);
          gameMetadata = { game_name: gameName, ...metadata };
          provider = 'google_gemini';
        } else {
          throw new Error('No valid JSON in Gemini response');
        }
      } catch (error) {
        console.error('[GameInfo Agent] Google Gemini failed:', error);
        throw error;
      }
    }

    // If no AI provider succeeded, use demo data
    if (!gameMetadata) {
      console.log('[GameInfo Agent] Using demo data (no AI keys available)');
      gameMetadata = createDemoData(gameName);
      provider = 'demo';
    }

    // Insert into database
    const { data: newGame, error: insertError } = await supabaseClient
      .from('games_info')
      .insert({
        game_name: gameMetadata.game_name,
        slots: gameMetadata.slots,
        rarities: gameMetadata.rarities,
        stats: gameMetadata.stats,
        perks: gameMetadata.perks,
        gems: gameMetadata.gems,
        active: true
      })
      .select()
      .single();

    if (insertError) throw insertError;

    logData.status = 'success';
    logData.output = { game_id: newGame.id, provider };
    logData.execution_time_ms = Date.now() - startTime;

    await supabaseClient.from('agent_logs').insert(logData);

    console.log(`[GameInfo Agent] Successfully created game: ${gameName} using ${provider}`);

    return new Response(
      JSON.stringify({ 
        status: 'ok',
        data: {
          game: newGame,
          provider
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[GameInfo Agent] Error:', error);
    
    logData.error_message = error instanceof Error ? error.message : 'Unknown error';
    logData.execution_time_ms = Date.now() - startTime;

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    await supabaseClient.from('agent_logs').insert(logData);

    return new Response(
      JSON.stringify({ 
        status: 'error',
        reason: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function createDemoData(gameName: string): GameMetadata {
  // Demo data for Diablo 4
  if (gameName.toLowerCase().includes('diablo')) {
    return {
      game_name: gameName,
      slots: ['helm', 'chest', 'gloves', 'legs', 'boots', 'weapon', 'offhand', 'amulet', 'ring1', 'ring2'],
      rarities: ['common', 'magic', 'rare', 'legendary', 'unique'],
      stats: {
        strength: { name: 'Strength', description: 'Increases damage and armor' },
        dexterity: { name: 'Dexterity', description: 'Increases critical chance and dodge' },
        intelligence: { name: 'Intelligence', description: 'Increases skill damage and resistances' },
        vitality: { name: 'Vitality', description: 'Increases maximum life' },
        criticalChance: { name: 'Critical Strike Chance', description: 'Chance to deal critical damage' },
        criticalDamage: { name: 'Critical Strike Damage', description: 'Damage multiplier on critical hits' }
      },
      perks: {
        vampiric: { name: 'Vampiric', description: 'Gain life on hit' },
        thorns: { name: 'Thorns', description: 'Reflect damage to attackers' },
        lucky: { name: 'Lucky Hit', description: 'Chance to trigger effects on hit' }
      },
      gems: {
        ruby: { name: 'Ruby', stats: { strength: 10 }, description: 'Increases strength' },
        sapphire: { name: 'Sapphire', stats: { intelligence: 10 }, description: 'Increases intelligence' },
        topaz: { name: 'Topaz', stats: { dexterity: 10 }, description: 'Increases dexterity' },
        emerald: { name: 'Emerald', stats: { criticalDamage: 15 }, description: 'Increases critical damage' }
      }
    };
  }

  // Generic demo data
  return {
    game_name: gameName,
    slots: ['head', 'chest', 'legs', 'weapon', 'offhand'],
    rarities: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
    stats: {
      attack: { name: 'Attack', description: 'Increases damage dealt' },
      defense: { name: 'Defense', description: 'Reduces damage taken' },
      health: { name: 'Health', description: 'Maximum health points' }
    },
    perks: {
      lifesteal: { name: 'Lifesteal', description: 'Gain health on hit' },
      criticalHit: { name: 'Critical Hit', description: 'Chance for critical strikes' }
    },
    gems: {
      diamond: { name: 'Diamond', stats: { defense: 10 }, description: 'Increases defense' },
      ruby: { name: 'Ruby', stats: { attack: 10 }, description: 'Increases attack' }
    }
  };
}
