# Corps Agent DESIGN.md

## Direction
Premium dark fintech + AI operations dashboard. Inspired by shadcn clarity, Magic UI glow/aurora, ReactBits animated cards, Framer motion rhythm, GSAP-style staged reveals.

## Visual Language
- Background: deep midnight `#050816`, radial Celo green/cyan/purple glows.
- Primary accent: Celo green `#35D07F`.
- Secondary accents: cyan `#22D3EE`, violet `#A78BFA`, amber `#F59E0B`.
- Cards: glassmorphism with `rgba(255,255,255,0.06)`, thin white borders, soft shadows.
- Badges: pill chips, status dots, PASS labels.
- Typography: large compressed hero, tight tracking, clean sans, mono for addresses/txs.

## UX Goals
- Judge understands product in first 10 seconds.
- On-chain proof always visible: contract, audit status, demo tx hashes.
- Agent roles feel alive: status cards, automation timeline, command palette.
- Demo path obvious: deposit → trader profit → CEO recordProfit → payout → audit.

## Components
- Aurora background layer
- Sticky nav with status pill
- Hero with animated terminal card
- Treasury KPI cards
- Agent mesh cards
- On-chain demo flow timeline
- Auditor PASS report
- Bot command palette
- Transaction evidence grid
- Architecture panel

## Motion
- CSS-only where possible.
- Slow aurora float, pulse status dots, shimmer borders, hover lift.
- Avoid noisy effects; motion should make system feel live.

## Copy Tone
Confident, concise, technical enough for hackathon judges. Emphasize Celo, autonomous agents, treasury, payout, audit, ERC-8004 identities.
