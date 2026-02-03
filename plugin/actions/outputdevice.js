/**
 * OutputDevice Action - Set Output Device (Speaker/Headphones)
 * Segue padrão oficial do SDK Ulanzi
 */

export default class OutputDevice {
  constructor(context, $UD, $AudioAPI) {
    this.$UD = $UD
    this.$AudioAPI = $AudioAPI
    this.context = context
    this.config = {
      deviceIndex: null,
      deviceList: []
    }
    this.isSwitching = false // Flag para evitar múltiplas chamadas simultâneas

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

  // Envia lista de devices para PropertyInspector
  sendDeviceList() {
    const devices = this.$AudioAPI.getDevices('output')
    this.config.deviceList = devices

    this.$UD.sendParamFromPlugin({
      list: devices,
      currentIndex: this.config.deviceIndex
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

    const index = this.config.deviceIndex

    if (index === null || index === undefined) {
      this.$UD.toast('⚠️ Device not configured')
      return
    }

    const devices = this.$AudioAPI.getDevices('output')
    const device = devices[index]

    if (!device) {
      this.$UD.toast('❌ Device not found')
      return
    }

    const currentIndex = this.$AudioAPI.getCurrentDeviceIndex('output')
    const isThisDeviceActive = Number(currentIndex) === Number(index)
    const isMuted = this.$AudioAPI.isMuted('output')

    // Marca como switching
    this.isSwitching = true

    try {
      // CASO 1: Dispositivo NÃO está ativo → ativa o dispositivo (sempre unmuted)
      if (!isThisDeviceActive) {
        console.log('[OUTPUT] Switching to device:', device.name)
        const success = await this.$AudioAPI.setDeviceByIndex('output', index)

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
    console.log('[OUTPUT] setParams:', params, 'previous:', this.config.deviceIndex)
    if (params.currentIndex !== undefined) {
      // Garante que deviceIndex seja sempre número
      this.config.deviceIndex = Number(params.currentIndex)
      this.updateIcon()
    }
  }

  // Atualiza ícone com 3 estados
  updateIcon() {
    const index = this.config.deviceIndex

    if (index === null || index === undefined) {
      this.$UD.setStateIcon(this.context, 0) // Inactive (vermelho)
      return
    }

    const devices = this.$AudioAPI.getDevices('output')
    const device = devices[index]

    if (!device) {
      this.$UD.setStateIcon(this.context, 0) // Inactive (vermelho)
      return
    }

    // Verifica se este botão representa o dispositivo atualmente ativo
    const currentIndex = this.$AudioAPI.getCurrentDeviceIndex('output')
    const isThisDeviceActive = Number(currentIndex) === Number(index)

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
