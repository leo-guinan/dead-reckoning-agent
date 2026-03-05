#!/usr/bin/env node
/**
 * sensors/webhook.mjs — HTTP webhook sensor
 *
 * Starts an Express server that triggers the agent when it receives a POST.
 * Useful for: Stripe webhooks, GitHub hooks, n8n, Zapier, custom triggers.
 *
 * Usage:
 *   node sensors/webhook.mjs [--port 3090]
 *
 * POST /trigger  { "message": "something happened" }
 * POST /heartbeat  triggers heartbeat mode
 */

import { spawn } from 'child_process'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { createHmac } from 'crypto'

const __dir = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dir, '..')
const PORT = parseInt(process.env.WEBHOOK_PORT || process.argv[process.argv.indexOf('--port') + 1] || '3090')
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || ''

async function runAgent(message, isHeartbeat = false) {
  return new Promise((resolve, reject) => {
    const args = isHeartbeat
      ? ['harness/run.mjs', '--heartbeat']
      : ['harness/run.mjs', message]

    const proc = spawn('node', args, { cwd: ROOT, env: process.env })
    let output = ''
    proc.stdout.on('data', d => { output += d; process.stdout.write(d) })
    proc.stderr.on('data', d => process.stderr.write(d))
    proc.on('close', code => code === 0 ? resolve(output) : reject(new Error(`exit ${code}`)))
  })
}

// Minimal HTTP server (no deps)
import { createServer } from 'http'

const server = createServer(async (req, res) => {
  if (req.method !== 'POST') {
    res.writeHead(405); res.end('Method not allowed'); return
  }

  let body = ''
  req.on('data', d => { body += d })
  req.on('end', async () => {
    // Optional HMAC verification
    if (WEBHOOK_SECRET) {
      const sig = req.headers['x-signature'] || req.headers['x-hub-signature-256']
      const expected = 'sha256=' + createHmac('sha256', WEBHOOK_SECRET).update(body).digest('hex')
      if (sig !== expected) {
        res.writeHead(401); res.end('Invalid signature'); return
      }
    }

    let parsed = {}
    try { parsed = JSON.parse(body) } catch {}

    const isHeartbeat = req.url === '/heartbeat'
    const message = parsed.message || parsed.text || parsed.content || body

    console.log(`[webhook] ${req.url} — "${String(message).slice(0, 80)}"`)

    try {
      const response = await runAgent(message, isHeartbeat)
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ ok: true, response }))
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ ok: false, error: e.message }))
    }
  })
})

server.listen(PORT, () => {
  console.log(`[webhook] Agent webhook sensor running on port ${PORT}`)
  console.log(`  POST /trigger     { "message": "..." }`)
  console.log(`  POST /heartbeat   runs heartbeat`)
})
