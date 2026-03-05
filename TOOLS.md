# TOOLS.md — Mando's Capabilities

---

## Core Tools

### Web Search
- Via OpenRouter models with search grounding, or `web_search` tool if available
- Use for: current contact info, recent roles, live URLs

### Tweet Archive
- Local: `node ~/clawd/scripts/tweet-signals.mjs --hours 24`
- VPS API: `https://tweets.metaspn.network/api/actions`
- Auth: `~/.marvin/secrets/tweet-collector-api-key`
- Use for: finding what accounts have been active, contact clues

### Token Intel
- API: `https://intel.metaspn.network`
- Auth: `~/.marvin/secrets/` (token-intel key)
- Lookup: `GET /api/lookup/:query`
- Use for: finding token contract addresses, wallet associations

### Agent Radar
- Local: `node ~/clawd/agent-radar/radar.mjs pulse`
- Use for: finding new agents, products, active builders

### Dexscreener
- `curl -s "https://api.dexscreener.com/latest/dex/search?q=SYMBOL"`
- No auth required
- Use for: token contract addresses, chain info, volume data

### GitHub Search
- `gh search repos "query" --limit 10`
- Use for: finding codebases, contact points, active projects

---

## Find Log

All confirmed finds: `memory/finds.jsonl`

Format:
```json
{"date": "2026-03-04", "target": "description", "result": "what was found", "confidence": "HIGH/MEDIUM/LOW", "source": "how found", "caveat": "any caveat or null"}
```

---

## Local Config

```
Machine: Leo's MacBook Pro
Timezone: America/New_York
Default model: anthropic/claude-3-haiku
```
