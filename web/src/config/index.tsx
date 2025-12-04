import { cookieStorage, createStorage } from '@wagmi/core'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { baseSepolia } from '@reown/appkit/networks'

// Try to read from env, fall back to a demo string
const rawProjectId = process.env.NEXT_PUBLIC_PROJECT_ID

export const projectId =
  rawProjectId && rawProjectId.length > 0
    ? rawProjectId
    : 'demo-project-id' // TODO: replace with real ID once env is working

export const networks = [baseSepolia]

// Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  projectId,
  networks,
})

export const config = wagmiAdapter.wagmiConfig
