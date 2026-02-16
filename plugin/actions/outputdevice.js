/**
 * OutputDevice Action - Set Output Device (Speaker/Headphones)
 * Usa UID para identificar dispositivos (estável entre reordenações)
 */

export default class OutputDevice {
  constructor(context, $UD, $AudioAPI) {
    this.$UD = $UD
    this.$AudioAPI = $AudioAPI
    this.context = context
    this.config = {
      deviceUID: null,
      deviceIndex: null, // Legacy fallback
      deviceList: []
    }
    this.isSwitching = false

    // Aguarda AudioAPI carregar devices
    this.$AudioAPI.on('devicesLoaded', () => {
      this.sendDeviceList()
    })

    // Aguarda status inicial ser carregado para atualizar ícone corretamente
    this.$AudioAPI.on('statusLoaded', () => {
      this.updateIcon()
    })

    // Monitora mudanças de device ativo
    this.$AudioAPI.on('outputChanged', () => {
      this.updateIcon()
    })

    // Monitora mudanças de mute
    this.$AudioAPI.on('outputMuteChanged', () => {
      this.updateIcon()
    })

    this.sendDeviceList()

    // Só atualiza ícone se status já foi carregado, senão aguarda evento statusLoaded
    if (this.$AudioAPI.isStatusLoaded) {
      this.updateIcon()
    }
  }

  // Encontra dispositivo na lista pelo UID
  findDeviceByUID(uid) {
    if (!uid) return null
    const devices = this.$AudioAPI.getDevices('output')
    return devices.find(d => d.uid === uid) || null
  }

  // Envia lista de devices para PropertyInspector
  sendDeviceList() {
    const devices = this.$AudioAPI.getDevices('output')
    this.config.deviceList = devices

    this.$UD.sendParamFromPlugin({
      list: devices,
      currentUID: this.config.deviceUID
    }, this.context)
  }

  // Botão adicionado ao deck
  add() {
    this.sendDeviceList()
    this.updateIcon()
  }

  // Botão clicado - implementa toggle de 3 estados
  async run() {
    // Proteção contra fast switching
    if (this.isSwitching) {
      console.warn('[OUTPUT] Action already in progress, ignoring...')
      this.$UD.toast('⏳ Aguarde...')
      return
    }

    const uid = this.config.deviceUID

    if (!uid) {
      this.$UD.toast('⚠️ Device not configured')
      return
    }

    const device = this.findDeviceByUID(uid)

    if (!device) {
      this.$UD.toast('❌ Device not found (disconnected?)')
      return
    }

    const currentUID = this.$AudioAPI.getCurrentDeviceUID('output')
    const isThisDeviceActive = currentUID === uid
    const isMuted = this.$AudioAPI.isMuted('output')

    // Marca como switching
    this.isSwitching = true

    try {
      // CASO 1: Dispositivo NÃO está ativo → ativa o dispositivo (sempre unmuted)
      if (!isThisDeviceActive) {
        console.log('[OUTPUT] Switching to device:', device.name, 'UID:', uid)
        const success = await this.$AudioAPI.setDeviceByUID('output', uid)

        if (success) {
          // Garante que ao ativar um dispositivo, ele começa unmuted
          if (this.$AudioAPI.isMuted('output')) {
            await this.$AudioAPI.toggleMute('output')
          }
          this.$UD.toast(`🔊 ${device.name}`)
          this.updateIcon()
        } else {
          this.$UD.toast('❌ Failed to switch device')
        }
      }
      // CASO 2: Dispositivo está ativo E não está mutado → muta
      else if (!isMuted) {
        console.log('[OUTPUT] Muting device:', device.name)
        const success = await this.$AudioAPI.toggleMute('output')

        if (success) {
          this.$UD.toast(`🔇 ${device.name} muted`)
          this.updateIcon()
        } else {
          this.$UD.toast('❌ Failed to mute')
        }
      }
      // CASO 3: Dispositivo está ativo E está mutado → desmuta
      else {
        console.log('[OUTPUT] Unmuting device:', device.name)
        const success = await this.$AudioAPI.toggleMute('output')

        if (success) {
          this.$UD.toast(`🔊 ${device.name} unmuted`)
          this.updateIcon()
        } else {
          this.$UD.toast('❌ Failed to unmute')
        }
      }
    } finally {
      // Sempre libera o lock após 300ms
      setTimeout(() => {
        this.isSwitching = false
      }, 300)
    }
  }

  // Botão fica visível/invisível
  setActive(isActive) {
    if (isActive) {
      this.updateIcon()
    }
  }

  // Settings atualizados do PropertyInspector
  setParams(params) {
    console.log('[OUTPUT] setParams:', params, 'previous UID:', this.config.deviceUID)

    if (params.deviceUID !== undefined && params.deviceUID !== '') {
      // Novo formato: UID-based (estável)
      this.config.deviceUID = params.deviceUID
      this.updateIcon()
    } else if (params.currentIndex !== undefined && !this.config.deviceUID) {
      // Legacy fallback: converte index para UID se possível
      const devices = this.$AudioAPI.getDevices('output')
      const index = Number(params.currentIndex)
      const device = devices[index]

      if (device && device.uid) {
        console.log('[OUTPUT] Legacy migration: index', index, '→ UID', device.uid, '(', device.name, ')')
        this.config.deviceUID = device.uid
      } else {
        console.warn('[OUTPUT] Legacy index', index, 'could not be resolved - device list may have changed')
      }

      this.updateIcon()
    }
  }

  // Atualiza ícone com 3 estados
  updateIcon() {
    const uid = this.config.deviceUID

    if (!uid) {
      this.$UD.setStateIcon(this.context, 0) // Inactive (vermelho)
      return
    }

    const device = this.findDeviceByUID(uid)

    if (!device) {
      this.$UD.setStateIcon(this.context, 0) // Inactive (vermelho) - device desconectado
      return
    }

    // Verifica se este botão representa o dispositivo atualmente ativo
    const currentUID = this.$AudioAPI.getCurrentDeviceUID('output')
    const isThisDeviceActive = currentUID === uid

    if (!isThisDeviceActive) {
      // State 0: Inactive (vermelho) - outro dispositivo está ativo
      this.$UD.setStateIcon(this.context, 0)
    } else {
      // Este dispositivo está ativo, verifica se está mutado
      const isMuted = this.$AudioAPI.isMuted('output')

      if (isMuted) {
        // State 2: Muted (cinza) - ativo mas mutado
        this.$UD.setStateIcon(this.context, 2)
      } else {
        // State 1: Active (verde) - ativo e não mutado
        this.$UD.setStateIcon(this.context, 1)
      }
    }
  }

  // Botão removido
  clear() {
    // Cleanup se necessário
  }
}
