function getEnv (varName: string): string | undefined {
  const { env } = process
  return env[varName]
}

export const TEST_MODE = getEnv('TEST_MODE')?.toLocaleLowerCase() === 'true'

export const socketPorts = {
  unreadCount: getEnv('OFFCHAIN_WS_UNREAD_COUNT_PORT'),
  activity: getEnv('OFFCHAIN_WS_ACTIVITY_TG_PORT'),
  moderation: getEnv('OFFCHAIN_WS_MODERATION_TG_PORT')
}

export const appBaseUrl = process.env.APP_BASE_URL

export const substrateNodeUrl = process.env.SUBSTRATE_URL

export const ipfsReadOnlyNodeUrl = process.env.IPFS_READ_ONLY_NODE_URL || 'http://localhost:8080'
export const ipfsNodeUrl = process.env.IPFS_NODE_URL || 'http://localhost:5001'
export const ipfsClusterUrl = process.env.IPFS_CLUSTER_URL || 'http://localhost:9094'
export const ipfsGatewayUrl = process.env.IPFS_GATEWAY_URL
export const port = process.env.OFFCHAIN_SERVER_PORT || 3001

export const emailHost = process.env.EMAIL_HOST
export const emailPort = parseInt(process.env.EMAIL_PORT)
export const emailUser = process.env.EMAIL_USER
export const emailPassword = process.env.EMAIL_PASSWORD
export const emailFrom = process.env.EMAIL_FROM

export const recatchaKey = process.env.RECAPTCHA_KEY

export const subsocialLogo = `https://app.subsocial.network/ipfs/ipfs/Qmasp4JHhQWPkEpXLHFhMAQieAH1wtfVRNHWZ5snhfFeBe`

export const faucetMnemonic = process.env.FAUCET_MNEMONIC

export const faucetDripAmount = parseFloat(process.env.FAUCET_DRIP_AMOUNT || '0')

export const corsAllowedList = process.env.CORS_ALLOWED_ORIGIN.split(',')
export const isAllCorsAllowed = corsAllowedList[0] === '*'

export const subsocialParaId = 2100
export const kusamaNodeUrl = process.env.KUSAMA_NODE_URL
