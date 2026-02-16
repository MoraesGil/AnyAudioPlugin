import EventEmitter from 'events'

/**
 * AudioAPI - Gerencia comunicação com Hammerspoon API
 * Emite eventos para as Actions
 */

export default class AudioAPI extends EventEmitter {
  constructor() {
    super()
    this.API_BASE = 'http://127.0.0.1:8765'

    this.devices = {
      input: [],
      output: []
    }

    this.currentDevices = {
      input: null,
      output: null
    }

    this.currentIndexes = {
      input: -1,
      output: -1
    }

    this.currentUIDs = {
      input: null,
      output: null
    }

    this.muteStatus = {
      input: false,
      output: false
    }

    this.isConnected = false
    this.isStatusLoaded = false // Flag para sincronizar carregamento inicial
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

    // Carrega status inicial (índices dos devices ativos)
    await this.getStatus()

    // Carrega status de mute inicial
    await this.getMuteStatus('input')
    await this.getMuteStatus('output')

    // Marca status como carregado e emite evento
    this.isStatusLoaded = true
    this.emit('statusLoaded')
  }

  async callAPI(endpoint) {
    try {
      const response = await fetch(`${this.API_BASE}${endpoint}`)
      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error.message)
      return { success: false, error: error.message }
    }
  }

  async loadDevices() {
    const result = await this.callAPI('/audio/devices/list')

    if (result.success && result.data.devices) {
      this.devices.input = result.data.devices.input
      this.devices.output = result.data.devices.output

      console.log('✅ Devices loaded:', {
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

      // Armazena índices (usado para comparação em updateIcon)
      this.currentIndexes.input = result.data.input.index
      this.currentIndexes.output = result.data.output.index

      // Armazena UIDs (identificador estável - não muda com reordenação)
      this.currentUIDs.input = result.data.input.uid || null
      this.currentUIDs.output = result.data.output.uid || null

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
    const result = await this.callAPI(`/audio/${type}/index/${luaIndex}/set`)

    if (!result.success) {
      console.error(`❌ API call failed:`, result.error)
      return false
    }

    if (!result.data.success) {
      console.error(`❌ Failed to change ${type} by index:`, result.data.error || 'Unknown error')
      return false
    }

    console.log(`✅ ${type} changed to: ${result.data.device} (Index: ${deviceIndex})`)

    // Atualiza cache imediatamente (nome E índice)
    this.currentDevices[type] = result.data.device
    this.currentIndexes[type] = deviceIndex

    // Atualiza status de mute após trocar device (evita cache stale)
    await this.getMuteStatus(type)

    // Emite evento para atualizar ícones de todos os botões
    this.emit(`${type}Changed`, result.data.device)

    return true
  }

  async setDeviceByUID(type, deviceUID) {
    const encodedUID = encodeURIComponent(deviceUID)
    const result = await this.callAPI(`/audio/${type}/uid/${encodedUID}/set`)

    if (!result.success) {
      console.error(`❌ API call failed:`, result.error)
      return false
    }

    if (!result.data.success) {
      console.error(`❌ Failed to change ${type} by UID:`, result.data.error || 'Unknown error')
      return false
    }

    console.log(`✅ ${type} changed to: ${result.data.device} (UID: ${deviceUID})`)

    // Atualiza cache imediatamente
    this.currentDevices[type] = result.data.device
    this.currentUIDs[type] = deviceUID

    // Atualiza status de mute após trocar device
    await this.getMuteStatus(type)

    // Emite evento para atualizar ícones de todos os botões
    this.emit(`${type}Changed`, result.data.device)

    return true
  }

  getDevices(type) {
    return this.devices[type] || []
  }

  getCurrentDevice(type) {
    return this.currentDevices[type]
  }

  getCurrentDeviceIndex(type) {
    return this.currentIndexes[type]
  }

  getCurrentDeviceUID(type) {
    return this.currentUIDs[type]
  }

  async getMuteStatus(type) {
    const result = await this.callAPI(`/audio/${type}/mute/status`)

    if (result.success && result.data) {
      const oldMuteStatus = this.muteStatus[type]
      this.muteStatus[type] = result.data.muted || false

      // Emite evento se mudou
      if (oldMuteStatus !== this.muteStatus[type]) {
        this.emit(`${type}MuteChanged`, this.muteStatus[type])
      }
    }

    return this.muteStatus[type]
  }

  async toggleMute(type) {
    const result = await this.callAPI(`/audio/${type}/mute/toggle`)

    if (result.success && result.data && result.data.success) {
      this.muteStatus[type] = result.data.muted
      this.emit(`${type}MuteChanged`, this.muteStatus[type])
      return true
    }

    return false
  }

  isMuted(type) {
    return this.muteStatus[type]
  }
}
