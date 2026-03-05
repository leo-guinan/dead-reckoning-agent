# knowledge/ — Domain Context

> **Everything the agent needs to know that isn't memory.**
>
> Memory = things that happened.  
> Knowledge = things that are true about the domain.

---

## What goes here

- Domain reference documents (terminology, how things work)
- Product/service descriptions
- FAQs or common questions + good answers
- External context the agent should always have access to
- Structured data (pricing, specs, rules)

## What doesn't go here

- Things the agent learned from experience → `MEMORY.md` or `memory/`
- Operating instructions → `SOUL.md`
- Credentials/config → `TOOLS.md`

## Format

Each file is a markdown document. Name them clearly:
- `domain.md` — core domain knowledge
- `faq.md` — frequently asked questions
- `products.md` — product/service descriptions
- `terminology.md` — glossary

The harness loads these files as part of the system context.
Keep total knowledge/ size under ~10K words for cost efficiency.
