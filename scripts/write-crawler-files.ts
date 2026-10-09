import { writeFileSync } from 'node:fs'

const CLIENT_DIR = 'dist/client'
const ROBOTS_TXT = 'User-agent: *\nAllow: /\n'

writeFileSync(`${CLIENT_DIR}/robots.txt`, ROBOTS_TXT)
