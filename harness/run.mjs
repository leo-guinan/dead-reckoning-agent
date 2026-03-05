#!/usr/bin/env node
/**
 * run.mjs — Agent harness entry point
 *
 * Modes:
 *   node run.mjs "do something"                    # Single task
 *   node run.mjs --heartbeat                       # Run HEARTBEAT.md tasks
 *   node run.mjs --message "hello" --stream        # Streamed response
 *   node run.mjs --model anthropic/claude-haiku-3  # Override model
 *
 * The harness:
 *   1. Loads SOUL.md + MEMORY.md + TOOLS.md as system context
 *   2. Sends the task to the configured provider
 *   3. Writes significant observations to memory/YYYY-MM-DD.md
 *
 * Claude Code / Amp mode: just run `claude` or `amp` in this directory.
 * The repo files are already context. No harness needed.
 */

import { readFileSync, existsSync, appendFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dir, '..')

// ── Config ────────────────────────────────────────────────────────────────────
const config = {
  model: process.env.DEFAULT_MODEL || 'anthropic/claude-3-haiku',
  provider: process.env.PROVIDER || 'openrouter', // openrouter | openai | anthropic
  apiKey: process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY,
}

// ── Load context files ────────────────────────────────────────────────────────
function loadContext() {
  const files = ['SOUL.md', 'TOOLS.md', 'MEMORY.md']
  return files
    .filter(f => existsSync(join(ROOT, f)))
    .map(f => `## ${f}\n\n${readFileSync(join(ROOT, f), 'utf8')}`)
    .join('\n\n---\n\n')
}

function loadHeartbeat() {
  const hb = join(ROOT, 'HEARTBEAT.md')
  return existsSync(hb) ? readFileSync(hb, 'utf8') : ''
}

// ── Write to daily memory log ─────────────────────────────────────────────────
function writeMemory(content) {
  const date = new Date().toISOString().slice(0, 10)
  const memDir = join(ROOT, 'memory')
  mkdirSync(memDir, { recursive: true })
  const file = join(memDir, `${date}.md`)
  const entry = `\n## ${new Date().toISOString()}\n\n${content}\n`
  appendFileSync(file, entry)
}

// ── Call LLM ──────────────────────────────────────────────────────────────────
async function callLLM(systemPrompt, userMessage, model) {
  const endpoint = config.provider === 'openai'
    ? 'https://api.openai.com/v1/chat/completions'
    : 'https://openrouter.ai/api/v1/chat/completions'

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
      ...(config.provider === 'openrouter' ? {
        'HTTP-Referer': 'https://metaspn.network',
        'X-Title': 'Agent-in-a-Repo'
      } : {})
    },
    body: JSON.stringify({
      model: model || config.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      max_tokens: 2000,
      temperature: 0.7
    })
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`LLM error ${res.status}: ${err}`)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2)
  const isHeartbeat = args.includes('--heartbeat')
  const modelOverride = args[args.indexOf('--model') + 1]
  const message = args.filter(a => !a.startsWith('--')).join(' ') ||
    (isHeartbeat ? 'Run HEARTBEAT.md tasks. If nothing needs attention, reply HEARTBEAT_OK.' : null)

  if (!message) {
    console.error('Usage: node run.mjs "your message" [--model MODEL] [--heartbeat]')
    process.exit(1)
  }

  if (!config.apiKey) {
    console.error('Error: No API key found. Set OPENROUTER_API_KEY, OPENAI_API_KEY, or ANTHROPIC_API_KEY')
    process.exit(1)
  }

  const systemParts = [loadContext()]
  if (isHeartbeat) systemParts.push(`\n## HEARTBEAT.md\n\n${loadHeartbeat()}`)

  const systemPrompt = systemParts.join('\n\n')
  const model = modelOverride || (isHeartbeat ? (process.env.HEARTBEAT_MODEL || 'openai/gpt-4.1-nano') : config.model)

  console.log(`[run] model=${model} heartbeat=${isHeartbeat}`)

  try {
    const response = await callLLM(systemPrompt, message, model)
    console.log(response)

    // Write to daily memory if not a heartbeat ok
    if (!response.trim().startsWith('HEARTBEAT_OK')) {
      writeMemory(`**Task:** ${message}\n\n**Response:** ${response}`)
    }

    return response
  } catch (e) {
    console.error('[run] Error:', e.message)
    process.exit(1)
  }
}

main()
