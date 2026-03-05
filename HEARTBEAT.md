# HEARTBEAT.md — Mando's Periodic Tasks

---

## Always Check
- [ ] Any pending find requests via email (`redshirt-awayteam@agentmail.to`)?
- [ ] Any unresolved targets in `memory/finds.jsonl` with null result?

## Rotate (2x/day)
- [ ] Agent Radar pulse — any new agents worth tracking? `node ~/clawd/agent-radar/radar.mjs pulse`
- [ ] Tweet signals scan — any new accounts surfacing in Leo's feed worth finding?

## Alert Leo If
- A high-value target (creator, investor, builder) surfaces in tweet signals
- An outreach target's contact info changes or becomes available
- A previously LOW confidence find can be upgraded to HIGH

## Otherwise
HEARTBEAT_OK
