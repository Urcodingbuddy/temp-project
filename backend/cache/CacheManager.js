// CacheManager.js
const fs = require('fs/promises')
const path = require('path')

class CacheManager {
	constructor() {
		this._cache = {} // { key: array }
		this._lastLoadedAt = {} // { key: timestamp
		this.dataDir = path.join(__dirname, 'data')

		// Auto-clear every 15 minutes
		setInterval(
			() => {
				console.log('[CacheManager] Clearing in-memory cache')
				this._cache = {}
			},
			15 * 60 * 1000,
		)
	}

	async _loadFromFile(key) {
		const filePath = path.join(this.dataDir, `${key}.json`)
		try {
			const data = await fs.readFile(filePath, 'utf-8')

			console.log(`[CacheManager] Reading ${key}.json - ${data.length} chars`)

			// Validate that JSON ends properly
			const trimmed = data.trim()
			if (!trimmed.endsWith(']')) {
				console.warn(`[CacheManager] ${key}.json may be truncated.`)
			}

			const parsed = JSON.parse(trimmed)

			if (!Array.isArray(parsed)) {
				throw new Error(`${key}.json must contain a JSON array`)
			}

			this._cache[key] = parsed
			this._lastLoadedAt[key] = Date.now()
			return parsed
		} catch (err) {
			if (err.code === 'ENOENT') {
				console.warn(`[CacheManager] ${key}.json not found — starting with empty cache`)
			} else {
				console.error(`[CacheManager] Failed to load ${key}:`, err.message)

				// Attempt to show snippet near error position
				if (err.message.includes('position')) {
					const match = err.message.match(/position\s+(\d+)/)
					if (match && match[1]) {
						const pos = parseInt(match[1], 10)
						try {
							const data = await fs.readFile(filePath, 'utf-8')
							console.error(`[CacheManager] JSON snippet around position ${pos}:`)
							console.error(data.slice(pos - 50, pos + 50))
						} catch (_) {
							// Swallow re-read error silently
						}
					}
				}
			}

			this._cache[key] = []
			return []
		}
	}

	async _writeToFile(filename, data) {
		const dirPath = this.dataDir
		// Use unique temp filename to avoid concurrency issues
		const tempFilePath = path.join(dirPath, `${filename}-${Date.now()}-tmp.json`)
		const finalFilePath = path.join(dirPath, `${filename}.json`)

		try {
			// Ensure the directory exists
			await fs.mkdir(dirPath, { recursive: true })

			const jsonData = JSON.stringify(data)

			// Write to temp file
			await fs.writeFile(tempFilePath, jsonData, 'utf-8')
			console.log(`Temp file written: ${tempFilePath}`)

			// Validate written JSON by reading and parsing
			const verifyData = await fs.readFile(tempFilePath, 'utf-8')
			JSON.parse(verifyData)

			// Atomic rename temp file to final
			await fs.rename(tempFilePath, finalFilePath)

			console.log(`✅ ${filename}.json saved successfully`)
		} catch (err) {
			console.error(`❌ Failed to save ${filename}.json:`, err)

			// Attempt to clean up temp file if it exists
			try {
				await fs.access(tempFilePath)
				await fs.unlink(tempFilePath)
				console.log(`Temp file deleted: ${tempFilePath}`)
			} catch (unlinkErr) {
				if (unlinkErr.code !== 'ENOENT') {
					console.error(`❌ Failed to delete temp file:`, unlinkErr)
				}
				// If ENOENT, file is already gone, so no problem
			}
		}
	}

	async getAsync(key, forceReload = false) {
		if (!this._cache[key] || forceReload) {
			return await this._loadFromFile(key)
		}
		return this._cache[key]
	}

	async setAsync(key, data) {
		await this._writeToFile(key, data)
		this._cache[key] = Array.isArray(data) ? data : []
		this._lastLoadedAt[key] = Date.now()
		console.log(`[CacheManager] ${key} data updated.`)
	}

	clear(key) {
		delete this._cache[key]
		delete this._lastLoadedAt[key]
	}

	clearAll() {
		this._cache = {}
		this._lastLoadedAt = {}
	}

	getLastLoadedTime(key) {
		return this._lastLoadedAt[key] ?? null
	}
}

const cacheInstance = new CacheManager()

module.exports = cacheInstance
