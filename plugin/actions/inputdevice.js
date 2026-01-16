/**
 * InputDevice Action - Set Input Device (Microphone)
 * Segue padrão oficial do SDK Ulanzi
 */

export default class InputDevice {
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
    this.$AudioAPI.on('inputChanged', () => {
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
    const devices = this.$AudioAPI.getDevices('input')
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

  // Botão clicado - troca device
  async run() {
    // Proteção contra fast switching
    if (this.isSwitching) {
      console.warn('[INPUT] Switch already in progress, ignoring...')
      this.$UD.toast('⏳ Aguarde...')
      return
    }

    const index = this.config.deviceIndex

    if (index === null || index === undefined) {
      this.$UD.toast('⚠️ Device not configured')
      return
    }

    const devices = this.$AudioAPI.getDevices('input')
    const device = devices[index]

    if (!device) {
      this.$UD.toast('❌ Device not found')
      return
    }

    // Verifica se o device já está ativo (evita chamada desnecessária à API)
    const currentIndex = this.$AudioAPI.getCurrentDeviceIndex('input')
    if (Number(currentIndex) === Number(index)) {
      console.log('[INPUT] Device already active, skipping API call')
      this.$UD.toast(`✓ ${device.name}`)
      return
    }

    console.log('[INPUT] Switching to device at index:', index, '(', device.name, ')')

    // Marca como switching
    this.isSwitching = true

    try {
      // Usa endpoint index (resolve problema de nomes duplicados)
      const success = await this.$AudioAPI.setDeviceByIndex('input', index)

      if (success) {
        this.$UD.toast(`🎤 ${device.name}`)
        this.updateIcon()
      } else {
        this.$UD.toast('❌ Failed to switch device')
      }
    } finally {
      // Sempre libera o lock após 500ms
      setTimeout(() => {
        this.isSwitching = false
      }, 500)
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
    if (params.currentIndex !== undefined) {
      // Garante que deviceIndex seja sempre número
      this.config.deviceIndex = Number(params.currentIndex)
      this.updateIcon()
    }
  }

  // Atualiza ícone (verde = ativo, vermelho = inativo)
  updateIcon() {
    const index = this.config.deviceIndex

    if (index === null || index === undefined) {
      this.$UD.setStateIcon(this.context, 0) // Vermelho
      return
    }

    const devices = this.$AudioAPI.getDevices('input')
    const device = devices[index]

    if (!device) {
      this.$UD.setStateIcon(this.context, 0) // Vermelho
      return
    }

    // IMPORTANTE: Compara por ÍNDICE, não por nome (resolve ARZOPAs duplicados)
    // Converte ambos para Number para evitar problema de string vs number (0 !== "0")
    const currentIndex = this.$AudioAPI.getCurrentDeviceIndex('input')
    const isActive = Number(currentIndex) === Number(index)

    this.$UD.setStateIcon(this.context, isActive ? 1 : 0) // 1=Verde, 0=Vermelho
  }

  // Botão removido
  clear() {
    // Cleanup se necessário
  }
}
