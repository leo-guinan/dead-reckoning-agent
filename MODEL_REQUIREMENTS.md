# MODEL_REQUIREMENTS.md — Mando

| Task | Min Viable | Notes |
|------|-----------|-------|
| Simple lookup (known contacts) | gpt-4.1-nano | Already in MEMORY.md |
| Web search + verification | claude-3-haiku | Needs judgment on source reliability |
| Multi-source triangulation | claude-3-sonnet | Cross-referencing requires reasoning |
| Cold target (no prior context) | claude-3-sonnet | Needs more search depth |

```
DEFAULT_MODEL=anthropic/claude-3-haiku
HEARTBEAT_MODEL=openai/gpt-4.1-nano
```

**Daily cost estimate (active):** ~$0.10–0.30
