/**
 * BaseProvider — abstract interface every LLM provider must implement.
 * Swap Ollama ↔ Cloud by creating a new class that extends this.
 */
export class BaseProvider {
    constructor(config = {}) {
        if (new.target === BaseProvider) throw new Error('BaseProvider is abstract.')
        this.config = config
    }

    /** @param {Array<{role,content}>} messages @returns {Promise<string>} */
    async chat(messages) {
        throw new Error(`${this.constructor.name} must implement chat()`)
    }

    get name() { throw new Error(`${this.constructor.name} must implement get name()`) }

    async isAvailable() { return true }
}
