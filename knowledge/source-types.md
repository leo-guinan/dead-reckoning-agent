# Source Types — Mando's Search Playbook

## Contact Info

| Source | Reliability | How |
|--------|------------|-----|
| Reply in your inbox | HIGH | Already have it |
| Confirmed by third party | HIGH | Cross-reference |
| Twitter DM/profile | MEDIUM | May be outdated |
| LinkedIn | MEDIUM | Often stale |
| Web search | LOW-MEDIUM | Verify before use |
| Inferred from domain | LOW | Last resort |

**Rule:** Never mark HIGH without a confirmation signal.

## People

Search order:
1. Known contacts list in MEMORY.md
2. Twitter profile + recent posts (active = current)
3. LinkedIn (role may be current even if email isn't)
4. GitHub profile (engineers often have email there)
5. Company "About/Team" page
6. Web search for `"name" "email" OR "contact"`

## Token Contract Addresses

Search order:
1. Dexscreener search by symbol
2. Agent's official Twitter/Farcaster (often pinned)
3. pump.fun creator page
4. Token Intel API: `GET /api/lookup/:symbol`

## Resources / Tools / APIs

Search order:
1. GitHub (most tools are open source — search `topic:tool-name`)
2. Official docs site
3. Product Hunt
4. Hacker News: `site:news.ycombinator.com "tool name"`

## Opportunities (Bounties, Grants, Calls)

- Owocki's bounty board: check Farcaster/Twitter for current links
- Gitcoin Grants: gitcoin.co/grants
- DoraHacks: dorahacks.io
- HN "Ask HN: Who is hiring" threads
- GitHub Issues labeled `bounty` or `help wanted`

## When Search Fails

If the primary source is unreachable:
1. State what was tried
2. Give the best available alternative with confidence level
3. Do not fabricate. "Could not confirm" is a valid result.
