# MODEL_REQUIREMENTS.md — Dead Reckoning Agent

## Benchmark Results (2026-03-05)

Test cases: 5 | Judge: claude-3-5-haiku

| Rank | Model | Score | Notes |
|------|-------|-------|-------|
| 1 | anthropic/claude-haiku-4-5 | **9.3/10** | Best voice fidelity, specific numbers, correct format |
| 2 | openai/gpt-4.1-nano | 7.5/10 | Good structure, slightly verbose, misses precision |
| 3 | meta-llama/llama-3.3-70b | 0/10 | Provider error in this run |

## Recommendation

**Default model:** `anthropic/claude-haiku-4-5`

Best balance of voice adherence and speed for conviction analysis tasks.

## Standout outputs

**Price signal:** "Volume is 3.3x KELLYCLAUDE despite 46% lower MC. This is where money is moving."

**Miss report:** "I could have found this in 4 minutes with gh search repos + token intel lookup. I didn't run the search."

**Entropy assessment:** "At 0.42 track record, Twitter amplifies noise 8-12x before signal stabilizes."

## Failure modes

- Verbosity creep: gpt-4.1-nano adds hedging clauses the SOUL.md explicitly forbids
- Format drift: llama models ignore the structured output spec
- Caveat inflation: any model under instruction pressure adds disclaimers; test for this explicitly
