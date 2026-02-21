/**
 * CPU Temp - Monitor de temperatura da CPU no Ulanzi Deck
 *
 * Estados (5): 0=verde (aceitável), 1=amarelo (médio), 2=laranja (quente),
 *              3=vermelho (perigo), 4=vermelho crítico
 * Exibição em tempo real no ícone; ao pressionar abre modal com legenda + última leitura.
 */
export default class CpuTemp {
  constructor(context, $UD, $AudioAPI) {
    this.$UD = $UD
    this.$AudioAPI = $AudioAPI
    this.context = context
    this.state = 0
    this.pollInterval = 15000 // 15s
    this.pollTimer = null
  }

  add() {
    this.refreshStatus()
    this.startPolling()
  }

  async refreshStatus() {
    try {
      const result = await this.$AudioAPI.callAPI('/cpu/status')
      if (result.success && typeof result.state === 'number') {
        this.state = Math.min(4, Math.max(0, result.state))
        this.updateIcon()
        if (result.tempDisplay && result.label) {
          this.$UD.setTitle(`${result.tempDisplay}\n${result.label}`, this.context)
        }
      }
    } catch (e) {
      this.state = 4
      this.updateIcon()
      this.$UD.setTitle('—\nErro', this.context)
    }
  }

  startPolling() {
    this.stopPolling()
    this.pollTimer = setInterval(() => this.refreshStatus(), this.pollInterval)
  }

  stopPolling() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer)
      this.pollTimer = null
    }
  }

  async run() {
    if (this.isShowingModal) {
      this.$UD.toast('⏳ Aguarde...')
      return
    }
    this.isShowingModal = true
    try {
      const result = await this.$AudioAPI.callAPI('/cpu/show-modal')
      if (result.success && result.shown) {
        this.refreshStatus()
      } else {
        this.$UD.toast('❌ ' + (result.error || 'Hammerspoon offline'))
      }
    } catch (e) {
      this.$UD.toast('❌ Sem conexão')
    } finally {
      setTimeout(() => { this.isShowingModal = false }, 500)
    }
  }

  setActive(isActive) {
    if (isActive) {
      this.refreshStatus()
      this.startPolling()
    } else {
      this.stopPolling()
    }
  }

  setParams() {}
  updateIcon() {
    this.$UD.setStateIcon(this.context, this.state)
  }

  clear() {
    this.stopPolling()
  }
}
