/**
 * CPU Temp - Monitor de temperatura da CPU no Ulanzi Deck
 *
 * Estados (5): 0=verde (aceitável), 1=amarelo (médio), 2=laranja (quente),
 *              3=vermelho (perigo), 4=vermelho crítico
 *
 * Sem polling automático — status atualizado somente ao pressionar o botão.
 * Ao pressionar: atualiza ícone → abre modal com legenda + última leitura.
 */
export default class CpuTemp {
  constructor(context, $UD, $AudioAPI) {
    this.$UD = $UD
    this.$AudioAPI = $AudioAPI
    this.context = context
    this.state = 0
    this.tempDisplay = '' // ex: "~45°C" — exibido no botão
    this.isShowingModal = false
  }

  add() {}

  async refreshStatus() {
    try {
      const result = await this.$AudioAPI.callAPI('/cpu/status')
      const data = result.data
      if (result.success && data && typeof data.state === 'number') {
        this.state = Math.min(4, Math.max(0, data.state))
        this.tempDisplay = data.tempDisplay || ''
        this.updateIcon()
        if (data.tempDisplay && data.label) {
          this.$UD.setTitle(`${data.tempDisplay}\n${data.label}`, this.context)
        }
      } else if (result.success === false) {
        this.state = 4
        this.tempDisplay = '—'
        this.updateIcon()
      }
    } catch (e) {
      this.state = 4
      this.tempDisplay = '—'
      this.updateIcon()
      this.$UD.setTitle('—\nErro', this.context)
    }
  }

  async run() {
    if (this.isShowingModal) {
      this.$UD.toast('⏳ Aguarde...')
      return
    }
    this.isShowingModal = true
    try {
      // Atualiza ícone com dados frescos antes de abrir o modal
      await this.refreshStatus()
      // Abre overlay com legenda de temperatura
      const result = await this.$AudioAPI.callAPI('/cpu/show-modal')
      if (!result.success) {
        const err = result.error === 'timeout'
          ? 'Hammerspoon timeout'
          : (result.error || 'Falha ao exibir')
        this.$UD.toast('❌ ' + err)
      }
    } catch (e) {
      this.$UD.toast('❌ Sem conexão')
    } finally {
      setTimeout(() => { this.isShowingModal = false }, 500)
    }
  }

  setActive(isActive) {}
  setParams() {}

  updateIcon() {
    this.$UD.setStateIcon(this.context, this.state, this.tempDisplay || '')
  }

  clear() {}
}
