#!/usr/bin/env node
/**
 * sensors/email.mjs — AgentMail email sensor
 *
 * Polls the agent's email inbox and triggers the agent for each new message.
 * Requires AgentMail (agentmail.to) API key and an inbox.
 *
 * Setup:
 *   1. Create an inbox at console.agentmail.to
 *   2. Set AGENTMAIL_API_KEY and AGENTMAIL_INBOX in .env
 *   3. node sensors/email.mjs [--poll 60]
 *
 * The agent receives: sender, subject, body — and can reply via AgentMail API.
 */

import { spawn } from 'child_process'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { readFileSync, writeFileSync, existsSync } from 'fs'

const __dir = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dir, '..')

// Load env
if (existsSync(join(ROOT, '.env'))) {
  const env = readFileSync(join(ROOT, '.env'), 'utf8')
  for (const line of env.split('\n')) {
    const [k, ...v] = line.split('=')
    if (k && !k.startsWith('#')) process.env[k.trim()] = v.join('=').trim()
  }
}

const AM_KEY = process.env.AGENTMAIL_API_KEY
const INBOX = process.env.AGENTMAIL_INBOX
const POLL_INTERVAL = parseInt(process.argv[process.argv.indexOf('--poll') + 1] || '60') * 1000
const STATE_FILE = join(ROOT, 'memory/email-sensor-state.json')

if (!AM_KEY || !INBOX) {
  console.error('Set AGENTMAIL_API_KEY and AGENTMAIL_INBOX in .env')
  process.exit(1)
}

function loadState() {
  if (!existsSync(STATE_FILE)) return { lastMessageId: null, processed: [] }
  try { return JSON.parse(readFileSync(STATE_FILE, 'utf8')) } catch { return { lastMessageId: null, processed: [] } }
}

function saveState(state) {
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2))
}

async function fetchMessages() {
  const res = await fetch(`https://api.agentmail.to/v0/inboxes/${INBOX}/messages?limit=10`, {
    headers: { 'Authorization': `Bearer ${AM_KEY}` }
  })
  if (!res.ok) throw new Error(`AgentMail ${res.status}`)
  const data = await res.json()
  return data.messages || []
}

async function sendReply(messageId, text) {
  const res = await fetch(`https://api.agentmail.to/v0/inboxes/${INBOX}/messages/${messageId}/reply`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${AM_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  })
  return res.ok
}

async function runAgent(message) {
  return new Promise((resolve, reject) => {
    const proc = spawn('node', ['harness/run.mjs', message], { cwd: ROOT, env: process.env })
    let output = ''
    proc.stdout.on('data', d => { output += d })
    proc.stderr.on('data', d => process.stderr.write(d))
    proc.on('close', code => code === 0 ? resolve(output.trim()) : reject(new Error(`exit ${code}`)))
  })
}

async function poll() {
  const state = loadState()
  let messages

  try {
    messages = await fetchMessages()
  } catch (e) {
    console.error(`[email] Fetch error: ${e.message}`)
    return
  }

  for (const msg of messages) {
    if (state.processed.includes(msg.message_id)) continue

    const from = msg.from?.[0]?.email || 'unknown'
    const subject = msg.subject || '(no subject)'
    const body = msg.extracted_text || msg.text || msg.body || ''

    console.log(`[email] New message from ${from}: "${subject}"`)

    const prompt = `You have received an email.

From: ${from}
Subject: ${subject}

${body}

Please respond to this email appropriately. Your response will be sent as a reply.`

    try {
      const response = await runAgent(prompt)
      console.log(`[email] Agent response: ${response.slice(0, 100)}...`)

      if (response && !response.startsWith('HEARTBEAT_OK')) {
        const sent = await sendReply(msg.message_id, response)
        console.log(`[email] Reply ${sent ? 'sent' : 'failed'}`)
      }

      state.processed.push(msg.message_id)
      // Keep last 500 processed IDs
      if (state.processed.length > 500) state.processed = state.processed.slice(-500)
      saveState(state)
    } catch (e) {
      console.error(`[email] Agent error: ${e.message}`)
    }
  }
}

console.log(`[email] Agent email sensor watching ${INBOX} (poll: ${POLL_INTERVAL/1000}s)`)
poll()
setInterval(poll, POLL_INTERVAL)
