export default function handler(req, res) {
  return res.status(200).json({
    ok: true,
    provider: 'AgentRouter.org',
    baseUrl: 'https://agentrouter.org/v1',
    chatEndpoint: '/v1/chat/completions',
    hasAgentRouterKey: Boolean(process.env.AGENT_ROUTER_TOKEN)
  });
}
