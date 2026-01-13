import EventEmitter from 'events'

/**
 * AudioAPI - Gerencia comunicação com Hammerspoon API
 * Emite eventos para as Actions
 */

export default class AudioAPI extends EventEmitter {
  constructor() {
    super()
    this.API_BASE = 'http://127.0.0.1:8765'
    this.POLL_INTERVAL = 3000

    this.devices = {
      input: [],
      output: []
    }

    this.currentDevices = {
      input: null,
      output: null
    }

    this.isConnected = false
    this.init()
  }

  async init() {
    // Testa conexão
    const health = await this.callAPI('/health')

    if (!health.success) {
      console.error('❌ Hammerspoon API not running!')
      this.emit('disconnected')
      return
    }

    console.log('✅ Hammerspoon API OK')
    this.isConnected = true
    this.emit('connected')

    // Carrega devices
    await this.loadDevices()

    // Inicia polling
    this.startPolling()
  }

  async callAPI(endpoint, options = {}) {
    const timeout = options.timeout || 5000 // 5s timeout padrão
    const retries = options.retries || 0

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), timeout)

        const response = await fetch(`${this.API_BASE}${endpoint}`, {
          signal: controller.signal
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        return { success: true, data }
      } catch (error) {
        const isLastAttempt = attempt === retries

        if (error.name === 'AbortError') {
          console.error(`API Timeout [${endpoint}] (attempt ${attempt + 1}/${retries + 1})`)
          if (isLastAttempt) {
            return { success: false, error: 'Request timeout - API não respondeu' }
          }
        } else {
          console.error(`API Error [${endpoint}] (attempt ${attempt + 1}/${retries + 1}):`, error.message)
          if (isLastAttempt) {
            return { success: false, error: error.message }
          }
        }

        // Aguarda antes de retry (backoff exponencial)
        if (!isLastAttempt) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 500))
        }
      }
    }

    return { success: false, error: 'Max retries reached' }
  }

  async loadDevices() {
    console.log('[AudioAPI] Loading devices...')
    const result = await this.callAPI('/audio/devices/list')

    if (result.success && result.data.devices) {
      this.devices.input = result.data.devices.input
      this.devices.output = result.data.devices.output

      console.log('✅ Devices loaded - Input:', this.devices.input.length, 'Output:', this.devices.output.length)
      console.log('[AudioAPI] Output devices:', {
        input: this.devices.input.length,
        output: this.devices.output.length
      })

      this.emit('devicesLoaded')
    } else {
      console.error('❌ Failed to load devices')
    }
  }

  async getStatus() {
    const result = await this.callAPI('/audio/status')

    if (result.success) {
      const oldInput = this.currentDevices.input
      const oldOutput = this.currentDevices.output

      this.currentDevices.input = result.data.input.name
      this.currentDevices.output = result.data.output.name

      // Emite eventos se mudou
      if (oldInput !== this.currentDevices.input) {
        this.emit('inputChanged', this.currentDevices.input)
      }

      if (oldOutput !== this.currentDevices.output) {
        this.emit('outputChanged', this.currentDevices.output)
      }
    }

    return result
  }

  async setDevice(type, deviceName) {
    const encodedName = encodeURIComponent(deviceName)
    const result = await this.callAPI(`/audio/${type}/${encodedName}/set`)

    if (result.success && result.data.success) {
      console.log(`✅ ${type} changed to: ${deviceName}`)

      // Atualiza cache imediatamente
      this.currentDevices[type] = deviceName

      // Emite evento
      this.emit(`${type}Changed`, deviceName)

      return true
    } else {
      console.error(`❌ Failed to change ${type}`)
      return false
    }
  }

  async setDeviceByIndex(type, deviceIndex) {
    // JavaScript usa index 0-based, Lua usa 1-based
    // IMPORTANTE: Converter para número antes de somar!
    const luaIndex = Number(deviceIndex) + 1
    const result = await this.callAPI(`/audio/${type}/index/${luaIndex}/set`, {
      timeout: 3000,  // 3s timeout
      retries: 1      // 1 retry
    })

    if (!result.success) {
      console.error(`❌ API call failed:`, result.error)
      return false
    }

    if (!result.data.success) {
      console.error(`❌ Failed to change ${type} by index:`, result.data.error || 'Unknown error')
      return false
    }

    console.log(`✅ ${type} changed to: ${result.data.device} (Index: ${deviceIndex})`)

    // Atualiza cache imediatamente
    this.currentDevices[type] = result.data.device

    // Emite evento
    this.emit(`${type}Changed`, result.data.device)

    return true
  }

  startPolling() {
    setInterval(() => {
      this.getStatus()
    }, this.POLL_INTERVAL)

    // Poll inicial
    this.getStatus()
  }

  getDevices(type) {
    return this.devices[type] || []
  }

  getCurrentDevice(type) {
    return this.currentDevices[type]
  }
}
