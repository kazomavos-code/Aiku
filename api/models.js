export default async function handler(req, res) {
  try {
    const apiKey = process.env.AGENT_ROUTER_TOKEN;
    if (!apiKey) return res.status(500).json({ error: 'AGENT_ROUTER_TOKEN belum diset.' });

    const response = await fetch('https://agentrouter.org/v1/models', {
      headers: { 'Authorization': 'Bearer ' + apiKey }
    });

    const raw = await response.text();
    try {
      const data = JSON.parse(raw);
      return res.status(response.status).json(data);
    } catch (e) {
      return res.status(response.status).json({ raw: raw.slice(0, 1000) });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
