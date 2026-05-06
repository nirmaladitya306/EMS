import { BaseProvider } from './BaseProvider.js'

/**
 * CloudProvider — OpenAI-compatible REST API.
 * Works with: OpenAI, Azure OpenAI, Groq, Together, Anthropic proxy, etc.
 * Env:  CLOUD_LLM_BASE_URL  e.g. https://api.openai.com/v1
 *       CLOUD_LLM_API_KEY
 *       CLOUD_LLM_MODEL     e.g. gpt-4o-mini
 */
export class CloudProvider extends BaseProvider {
    constructor(config = {}) {
        super(config)
        this.baseURL = config.baseURL || process.env.CLOUD_LLM_BASE_URL
        this.apiKey  = config.apiKey  || process.env.CLOUD_LLM_API_KEY
        this.model   = config.model   || process.env.CLOUD_LLM_MODEL || 'gpt-4o-mini'
    }

    get name() { return `Cloud/${this.model}` }

    async chat(messages) {
    try {
        

        const response = await fetch(`${this.baseURL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify({
                model: this.model,
                messages,
            }),
        });

        const text = await response.text();

        console.log("⬅️ Groq raw response:", text);

        if (!response.ok) {
            throw new Error(`Groq ${response.status}: ${text}`);
        }

        const data = JSON.parse(text);

        const reply = data.choices?.[0]?.message?.content;

        if (!reply) {
            throw new Error("Empty reply from Groq");
        }

        return reply;

    } catch (err) {
        console.error("❌ CloudProvider.chat ERROR:", err.message);
        throw err;
    }
}

    async isAvailable() {
        return !!(this.apiKey && this.baseURL)
    }
}
