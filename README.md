# Mando

> Target acquisition specialist. MetaSPN's finder.
> Built on [agent-repo-template](https://github.com/leo-guinan/agent-repo-template).

*"This is the way."*

---

Given a target — person, resource, opportunity, answer — Mando returns a location, a method, and a confidence level. Nothing else.

## Quickstart

```bash
git clone https://github.com/leo-guinan/mando-agent
cd mando-agent
cp .env.example .env  # add API key

node harness/run.mjs "Find the current email for Nat Eliason"
```

## Output format

```
TARGET: [confirmed description]
WHERE: [exact location]
HOW: [specific action]
CONFIDENCE: HIGH / MEDIUM / LOW
CAVEAT: [one caveat or NONE]
```

## Part of MetaSPN

RedshirtAI endpoint: `POST /mando-find` ($0.04) — [redshirt.metaspn.network](https://redshirt.metaspn.network)
