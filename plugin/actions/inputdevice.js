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

    // Aguarda AudioAPI carregar devices
    this.$AudioAPI.on('devicesLoaded', () => {
      this.sendDeviceList()
    })

    // Monitora mudanças de device ativo
    this.$AudioAPI.on('inputChanged', () => {
      this.updateIcon()
    })

    this.sendDeviceList()
    this.updateIcon()
  }

  // Envia lista de devices para PropertyInspector
  sendDeviceList() {
    const devices = this.$AudioAPI.getDevices('input')
    this.config.deviceList = devices

    console.log('[INPUT] sendDeviceList - devices:', devices ? devices.length : 0)

    if (!devices || devices.length === 0) {
      console.warn('[INPUT] No devices to send!')
      return
    }

    this.$UD.sendParamFromPlugin({
      list: devices,
      currentIndex: this.config.deviceIndex
    }, this.context)

    console.log('[INPUT] Sent list with', devices.length, 'devices')
  }

  // Botão adicionado ao deck
  add() {
    this.sendDeviceList()
    this.updateIcon()
  }

  // Botão clicado - troca device
  async run() {
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

    console.log('[INPUT] Switching to device at index:', index, '(', device.name, ')')

    // Usa endpoint index (resolve problema de nomes duplicados)
    const success = await this.$AudioAPI.setDeviceByIndex('input', index)

    if (success) {
      this.$UD.toast(`🎤 ${device.name}`)
      this.updateIcon()
    } else {
      this.$UD.toast('❌ Failed to switch device')
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
      this.config.deviceIndex = params.currentIndex
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

    const currentDevice = this.$AudioAPI.getCurrentDevice('input')
    const isActive = currentDevice === device.name

    this.$UD.setStateIcon(this.context, isActive ? 1 : 0) // 1=Verde, 0=Vermelho
  }

  // Botão removido
  clear() {
    // Cleanup se necessário
  }
}
