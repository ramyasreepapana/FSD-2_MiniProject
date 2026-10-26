/**
 * Serverless API Route: /api/estimate-expenses
 * 
 * Secure backend endpoint for Vercel / local Vite dev server.
 * Interacts with LLM providers (Gemini / OpenAI) without exposing secret keys to the browser.
 */

export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
  }

  // Parse request body
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
    origin,
    destination,
    budget,
    travelers,
    duration,
    travelStyle = 'moderate',
    destinationBenchmarkData,
    isTestPing = false,
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

  // Handle connection test ping
  if (isTestPing) {
    if (!geminiKey && !openaiKey) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ success: false, error: 'No API key provided.' }));
    }

    try {
      if (geminiKey) {
        const testRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: 'Respond with: {"status":"ok"}' }] }],
              generationConfig: { responseMimeType: 'application/json' },
            }),
          }
        );
        if (!testRes.ok) {
          const errText = await testRes.text();
          return res.end(JSON.stringify({ success: false, error: `Gemini API returned status ${testRes.status}: ${errText}` }));
        }
        return res.end(JSON.stringify({ success: true, provider: 'Google Gemini 2.0 Flash' }));
      }
    } catch (e) {
      return res.end(JSON.stringify({ success: false, error: e.message }));
    }
  }

  if (!geminiKey && !openaiKey) {
    // Return signal for client to use transparent benchmark fallback
    res.statusCode = 200;
    return res.end(JSON.stringify({
      fallback: true,
      isAiGenerated: false,
      reason: 'No LLM API key configured in server environment. Showing calibrated benchmark estimate.',
    }));
  }

  try {
    const prompt = `You are an expert travel budget estimator.
Calculate realistic expense estimates in Indian Rupees (INR) for this trip:
- Origin: ${origin}
- Destination: ${destination}
- Total Budget: INR ${budget}
- Number of Travelers: ${travelers}
- Duration: ${duration} days
- Travel Style: ${travelStyle} (Options: budget, moderate, premium)
- Baseline Destination Rates (per person/day averages): ${JSON.stringify(destinationBenchmarkData || {})}

Rules:
1. Adjust the 5 categories (travel, accommodation, food, localTransport, activities) specifically for the "${travelStyle}" travel style and duration.
   - budget: economical stays, public transit, street/local food, free/cheap activities.
   - moderate: comfortable 3-star stays, standard dining, mixed transit, standard sightseeing.
   - premium: 4/5-star boutique stays, fine dining, private cabs, premium/curated experiences.
2. Return strictly a JSON object with this EXACT structure (no markdown, no backticks):
{
  "travel": <number in INR for ALL travelers total commute to and from destination>,
  "accommodation": <number in INR for ALL travelers for the entire stay>,
  "food": <number in INR for ALL travelers for the entire stay>,
  "localTransport": <number in INR for local commuting during the trip>,
  "activities": <number in INR for entry tickets and sightseeing>,
  "currency": "INR",
  "summary": "<1-2 sentence explanation of this estimate for the ${travelStyle} style>",
  "assumptions": [
    "<short assumption 1>",
    "<short assumption 2>",
    "<short assumption 3>"
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
                temperature: 0.2,
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
          temperature: 0.2,
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
    console.error('Error in estimate-expenses handler:', err);
    res.statusCode = 200;
    return res.end(JSON.stringify({
      fallback: true,
      isAiGenerated: false,
      reason: `AI service error (${err.message}). Falling back to calibrated benchmark estimate.`,
    }));
  }
}
