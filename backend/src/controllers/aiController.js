/**
 * Express Controller for AI Expense Estimation & Smart Suggestions
 * Ported from existing serverless functions to run inside Express backend.
 * Reads GEMINI_API_KEY / OPENAI_API_KEY securely from environment variables.
 */

export const estimateExpenses = async (req, res, next) => {
  try {
    const {
      origin,
      destination,
      budget,
      travelers,
      duration,
      travelStyle = 'moderate',
      destinationBenchmarkData,
      isTestPing = false,
    } = req.body || {};

    const geminiKey =
      req.headers?.['x-gemini-api-key'] ||
      req.body?.geminiApiKey ||
      req.body?.apiKey ||
      process.env.GEMINI_API_KEY;

    const openaiKey =
      req.headers?.['x-openai-api-key'] ||
      req.body?.openaiApiKey ||
      process.env.OPENAI_API_KEY;

    // Handle connection test ping
    if (isTestPing) {
      if (!geminiKey && !openaiKey) {
        return res.status(400).json({ success: false, error: 'No API key provided.' });
      }

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
          return res.status(testRes.status).json({ success: false, error: `Gemini API error: ${errText}` });
        }
        return res.status(200).json({ success: true, provider: 'Google Gemini 2.0 Flash' });
      }
    }

    if (!geminiKey && !openaiKey) {
      return res.status(200).json({
        fallback: true,
        isAiGenerated: false,
        reason: 'No LLM API key configured in server environment. Showing calibrated benchmark estimate.',
      });
    }

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
      return res.status(200).json(parsed);
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
      return res.status(200).json(parsed);
    }
  } catch (err) {
    console.error('Error in estimateExpenses handler:', err.message);
    return res.status(200).json({
      fallback: true,
      isAiGenerated: false,
      reason: `AI service error (${err.message}). Falling back to calibrated benchmark estimate.`,
    });
  }
};

export const smartSuggestions = async (req, res, next) => {
  try {
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
    } = req.body || {};

    const geminiKey =
      req.headers?.['x-gemini-api-key'] ||
      req.body?.geminiApiKey ||
      req.body?.apiKey ||
      process.env.GEMINI_API_KEY;

    const openaiKey =
      req.headers?.['x-openai-api-key'] ||
      req.body?.openaiApiKey ||
      process.env.OPENAI_API_KEY;

    if (!geminiKey && !openaiKey) {
      return res.status(200).json({
        fallback: true,
        isAiGenerated: false,
        reason: 'No LLM API key configured in server environment. Showing rule-based suggestions.',
      });
    }

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
      return res.status(200).json(parsed);
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
      return res.status(200).json(parsed);
    }
  } catch (err) {
    console.error('Error in smartSuggestions handler:', err.message);
    return res.status(200).json({
      fallback: true,
      isAiGenerated: false,
      reason: `AI service error (${err.message}). Falling back to rule-based suggestions.`,
    });
  }
};
