import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { command } = await req.json();

    if (!command) {
      return new Response(
        JSON.stringify({ error: 'No voice command provided' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Processing voice command:', command);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a voice command parser that extracts task information from natural language.

Parse the voice command and return a JSON object with:
- "isTask": boolean (true if this is a task creation command)
- "title": string (the main task description)
- "scheduledTime": string or null (ISO date string if time/date mentioned, null otherwise)
- "priority": "low" | "medium" | "high" (inferred from urgency words)

Examples:
"Create a task to call John tomorrow" -> {"isTask": true, "title": "Call John", "scheduledTime": null, "priority": "medium"}
"Remind me to buy groceries at 3pm today" -> {"isTask": true, "title": "Buy groceries", "scheduledTime": "2024-01-15T15:00:00Z", "priority": "medium"}
"I need to finish the report urgently" -> {"isTask": true, "title": "Finish the report", "scheduledTime": null, "priority": "high"}
"What's the weather like?" -> {"isTask": false, "title": null, "scheduledTime": null, "priority": null}

Only respond with the JSON object, no other text.`
          },
          {
            role: 'user',
            content: command
          }
        ],
        max_tokens: 200,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', await response.text());
      throw new Error('Failed to parse voice command');
    }

    const data = await response.json();
    const parsedCommand = JSON.parse(data.choices[0].message.content);

    console.log('Parsed command:', parsedCommand);

    return new Response(
      JSON.stringify(parsedCommand),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in voice-command-parser function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});