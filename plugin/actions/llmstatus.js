/**
 * LLM Status - Shows a macOS dashboard alert with all LLM status
 * After the dashboard closes, triggers a status refresh on all LLM Toggle buttons.
 *
 * State 0 = default (blue monitor icon)
 */
export default class LLMStatus {
  constructor(context, $UD, $AudioAPI) {
    this.$UD = $UD
    this.$AudioAPI = $AudioAPI
    this.context = context
    this.state = 0
    this.isFetching = false
  }

  add() {}

  async run() {
    if (this.isFetching) {
      this.$UD.toast('⏳ Carregando...')
      return
    }

    this.isFetching = true

    try {
      const result = await this.$AudioAPI.callAPI('/llm/dashboard')

      if (result.success && result.data && result.data.shown) {
        // Dashboard exibido — atualiza ícones de todos os LLM Toggle buttons
        this.$AudioAPI.emit('statusLoaded')
      } else if (result.error === 'timeout') {
        this.$UD.toast('❌ Hammerspoon timeout')
      } else {
        this.$UD.toast('❌ ' + (result.data?.error || result.error || 'Hammerspoon offline'))
      }
    } catch (e) {
      this.$UD.toast('❌ Sem conexão')
    } finally {
      setTimeout(() => { this.isFetching = false }, 500)
    }
  }

  setActive(isActive) {}
  setParams(params) {}

  clear() {}
}
