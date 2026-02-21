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

      if (result.success && result.data) {
        if (result.data.shown) {
          // Dashboard was shown (and may have killed servers).
          // Trigger a global audio status refresh to update all toggle icons.
          this.$AudioAPI.emit('statusLoaded')
        } else {
          this.$UD.toast('❌ ' + (result.data.error || 'Falha ao exibir'))
        }
      } else {
        this.$UD.toast('❌ Hammerspoon offline')
      }
    } catch (e) {
      this.$UD.toast('❌ Sem conexao')
    } finally {
      setTimeout(() => { this.isFetching = false }, 500)
    }
  }

  setActive(isActive) {}
  setParams(params) {}

  clear() {}
}
