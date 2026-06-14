#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const sourceOnly = process.argv.includes('--source')

function readEnv(file) {
  const env = {}
  if (!fs.existsSync(file)) return env
  for (const raw of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const line = raw.trim()
    if (!line || line.startsWith('#') || !line.includes('=')) continue
    const [key, ...rest] = line.split('=')
    env[key.trim()] = rest.join('=').trim()
  }
  return env
}

function isAddress(value) {
  return /^0x[a-fA-F0-9]{40}$/.test(value || '')
}

function item(name, ok, detail) {
  const status = ok ? 'PASS' : 'TODO'
  console.log(`${status} ${name}${detail ? ` - ${detail}` : ''}`)
  return ok
}

function sourceFile(...parts) {
  return fs.existsSync(path.join(root, ...parts))
}

const rootEnv = sourceOnly
  ? readEnv(path.join(root, '.env.example'))
  : { ...readEnv(path.join(root, '.env.example')), ...readEnv(path.join(root, '.env')) }
const landingEnv = sourceOnly
  ? readEnv(path.join(root, 'landing', '.env.example'))
  : {
      ...readEnv(path.join(root, 'landing', '.env.example')),
      ...readEnv(path.join(root, 'landing', '.env.local')),
      ...readEnv(path.join(root, 'landing', '.env')),
    }

const checks = []
checks.push(item('Treasury address', isAddress(rootEnv.TREASURY_ADDRESS), rootEnv.TREASURY_ADDRESS || 'missing'))
checks.push(item('Token address', isAddress(rootEnv.TOKEN), rootEnv.TOKEN || 'missing'))
checks.push(item('Faucet env for bot', isAddress(rootEnv.TUSDC_FAUCET_ADDRESS), rootEnv.TUSDC_FAUCET_ADDRESS || 'deploy faucet and set TUSDC_FAUCET_ADDRESS'))
checks.push(item('Faucet env for landing', isAddress(landingEnv.NEXT_PUBLIC_TUSDC_FAUCET_ADDRESS), landingEnv.NEXT_PUBLIC_TUSDC_FAUCET_ADDRESS || 'set NEXT_PUBLIC_TUSDC_FAUCET_ADDRESS before build/deploy'))
if (!sourceOnly) {
  checks.push(item('Telegram bot token', Boolean(rootEnv.TELEGRAM_BOT_TOKEN), rootEnv.TELEGRAM_BOT_TOKEN ? 'configured' : 'set TELEGRAM_BOT_TOKEN on the bot host'))
  checks.push(item('CEO private key for deploy/ops', Boolean(rootEnv.CEO_PRIVATE_KEY), rootEnv.CEO_PRIVATE_KEY ? 'configured' : 'set only on trusted deploy/ops machine'))
}
checks.push(item('Landing API routes', sourceFile('landing', 'src', 'app', 'api', 'proof', 'route.ts'), 'source present'))
checks.push(item('Deposit demo UI', sourceFile('landing', 'src', 'app', 'deposit', 'DepositClient.tsx'), 'source present'))
checks.push(item('Telegram bot source', sourceFile('agents', 'bot.py'), 'source present'))
checks.push(item('Tiny faucet source', sourceFile('src', 'TinyUSDCFaucet.sol'), 'source present'))

const ready = checks.every(Boolean)
console.log('')
console.log(ready ? `Demo readiness${sourceOnly ? ' source' : ''}: PASS` : 'Demo readiness: TODO items remain')
process.exit(ready ? 0 : 1)
