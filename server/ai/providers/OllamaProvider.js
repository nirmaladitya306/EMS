import { BaseProvider } from './BaseProvider.js'

/**
 * OllamaProvider — runs any locally-hosted Ollama model.
 * Env:  OLLAMA_BASE_URL  (default: http://localhost:11434)
 *       OLLAMA_MODEL     (default: qwen2.5:3b)
 */
export class OllamaProvider extends BaseProvider {
    constructor(config = {}) {
        super(config)
        this.baseURL = config.baseURL || process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
        this.model   = config.model   || process.env.OLLAMA_MODEL   || 'qwen2.5:3b'
    }

    get name() { return `Ollama/${this.model}` }

    async chat(messages) {
        const response = await fetch(`${this.baseURL}/api/chat`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model:    this.model,
                messages,
                stream:   false,
                options:  { temperature: 0.3, num_predict: 1024 },
            }),
        })

        if (!response.ok) {
            const err = await response.text()
            throw new Error(`Ollama ${response.status}: ${err}`)
        }

        const json    = await response.json()
        const content = json?.message?.content
        if (!content) throw new Error('Ollama returned empty content')
        return content.trim()
    }

    async isAvailable() {
        try {
            const res = await fetch(`${this.baseURL}/api/tags`, {
                signal: AbortSignal.timeout(2500)
            })
            return res.ok
        } catch { return false }
    }
}
