import { OllamaProvider } from './OllamaProvider.js'
import { CloudProvider }  from './CloudProvider.js'

/**
 * ProviderFactory — single place to switch LLM backends.
 * Set AI_PROVIDER in .env:
 *   ollama  → local Ollama (default)
 *   cloud   → OpenAI-compatible cloud API
 */
const PROVIDERS = {
    ollama: () => new OllamaProvider(),
    cloud:  () => new CloudProvider(),
}

let _instance = null

export function getProvider() {
    if (_instance) return _instance
    const key     = (process.env.AI_PROVIDER || 'ollama').toLowerCase()
    const factory = PROVIDERS[key]
    if (!factory) throw new Error(`Unknown AI_PROVIDER "${key}". Options: ${Object.keys(PROVIDERS).join(', ')}`)
    _instance = factory()
    console.log(`[AI] Provider: ${_instance.name}`)
    return _instance
}

/** Register a custom provider (useful for testing). */
export function registerProvider(key, factoryFn) {
    PROVIDERS[key] = factoryFn
    _instance = null
}
