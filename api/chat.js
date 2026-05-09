export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST method.' });

  try {
    const apiKey = process.env.AGENT_ROUTER_TOKEN;
    if (!apiKey) return res.status(500).json({ error: 'AGENT_ROUTER_TOKEN belum diset di Vercel Environment Variables.' });

    const { messages = [], model = 'gpt-5', mode = 'chat', temperature = 0.7, systemPrompt } = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0) return res.status(400).json({ error: 'Messages kosong.' });

    const finalSystem =
      systemPrompt ||
      (mode === 'code'
        ? 'You are a coding assistant. Provide working code, concise explanations, and safe debugging help.'
        : mode === 'article'
        ? 'You are an SEO article writer. Write clear, useful, structured articles in Indonesian unless requested otherwise.'
        : mode === 'recipe'
        ? 'You are a recipe writer. Create complete recipes with ingredients, steps, tips, serving size, and cooking time.'
        : 'You are a helpful AI assistant. Reply in the user language.');

    const cleanMessages = [
      { role: 'system', content: finalSystem },
      ...messages
        .filter(m => ['user', 'assistant'].includes(m.role))
        .map(m => ({ role: m.role, content: String(m.content || '') }))
    ];

    const response = await fetch('https://agentrouter.org/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey
      },
      body: JSON.stringify({
        model,
        messages: cleanMessages,
        temperature
      })
    });

    const raw = await response.text();
    let data;
    try { data = JSON.parse(raw); }
    catch (e) {
      return res.status(502).json({
        error: 'AgentRouter returned non-JSON response.',
        detail: raw.slice(0, 800)
      });
    }

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || data?.message || `AgentRouter error ${response.status}`,
        detail: data
      });
    }

    return res.status(200).json({
      reply: data?.choices?.[0]?.message?.content || data?.choices?.[0]?.text || 'No response from AI',
      usage: data?.usage || null
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Server error' });
  }
                        }
