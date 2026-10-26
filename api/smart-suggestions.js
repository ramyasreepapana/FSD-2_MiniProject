/**
 * Serverless API Route: /api/smart-suggestions
 * 
 * Secure backend endpoint for Vercel / local Vite dev server.
 * Uses LLM to generate actionable, personalized trip optimization recommendations.
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      res.statusCode = 400;
      return res.end(JSON.stringify({ error: 'Invalid JSON body' }));
    }
  }

  const {
    destination,
    budget,
    travelers,
    duration,
    travelStyle = 'moderate',
    expenses = {},
    totalCost,
    budgetDifference,
    budgetStatus,
    weather,
  } = body || {};

  const geminiKey = 
    req.headers?.['x-gemini-api-key'] ||
    body?.geminiApiKey ||
    body?.apiKey ||
    process.env.GEMINI_API_KEY ||
    process.env.VITE_GEMINI_API_KEY;

  const openaiKey = 
    req.headers?.['x-openai-api-key'] ||
    body?.openaiApiKey ||
    process.env.OPENAI_API_KEY ||
    process.env.VITE_OPENAI_API_KEY;

  if (!geminiKey && !openaiKey) {
    res.statusCode = 200;
    return res.end(JSON.stringify({
      fallback: true,
      isAiGenerated: false,
      reason: 'No LLM API key configured in server environment. Showing rule-based suggestions.',
    }));
  }

  try {
    const prompt = `You are an expert travel advisor.
Analyze this trip feasibility and generate 3 to 4 actionable, high-value suggestions to optimize the trip:
- Destination: ${destination}
- Planned Budget: INR ${budget}
- Estimated Total: INR ${totalCost}
- Budget Difference: INR ${budgetDifference} (${budgetStatus === 'within' ? 'Within Budget' : 'Exceeds Budget'})
- Travelers: ${travelers}
- Duration: ${duration} days
- Travel Style: ${travelStyle}
- Category Expenses: Travel: ${expenses.travelCost}, Accommodation: ${expenses.accommodationCost}, Food: ${expenses.foodCost}, Transport: ${expenses.transportCost}, Activities: ${expenses.activitiesCost}
- Weather Condition: ${weather ? `${weather.condition}, ${weather.temperature}°C` : 'Not available'}

Rules:
1. Answer "How can I make this trip better or more affordable?"
2. If over budget: recommend specific savings (e.g. adjust lodging, duration, or travel style).
3. If under budget: recommend safety buffer allocation and worthwhile experience upgrades.
4. Each suggestion must have an "impact": "High", "Medium", or "Low".
5. Return strictly a JSON object with this EXACT structure (no markdown, no backticks):
{
  "overallAdvice": "<1-2 sentences of personalized strategic advice>",
  "suggestions": [
    {
      "title": "<short compelling action title>",
      "description": "<clear practical explanation>",
      "category": "<e.g. Accommodation | Budget Optimization | Transport | Weather Prep | Activities>",
      "impact": "High"
    }
  ]
}`;

    if (geminiKey) {
      const callGemini = async (modelName) => {
        return fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0.3,
              },
            }),
          }
        );
      };

      // Try gemini-2.0-flash first; fallback to gemini-1.5-flash
      let response = await callGemini('gemini-2.0-flash');
      if (!response.ok) {
        response = await callGemini('gemini-1.5-flash');
      }

      if (!response.ok) {
        throw new Error(`Gemini API error ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) throw new Error('Empty response from Gemini API');

      const parsed = JSON.parse(rawText);
      res.statusCode = 200;
      return res.end(JSON.stringify(parsed));
    }

    if (openaiKey) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();
      const parsed = JSON.parse(data.choices?.[0]?.message?.content || '{}');
      res.statusCode = 200;
      return res.end(JSON.stringify(parsed));
    }
  } catch (err) {
    console.error('Error in smart-suggestions handler:', err);
    res.statusCode = 200;
    return res.end(JSON.stringify({
      fallback: true,
      isAiGenerated: false,
      reason: `AI service error (${err.message}). Falling back to rule-based suggestions.`,
    }));
  }
}
