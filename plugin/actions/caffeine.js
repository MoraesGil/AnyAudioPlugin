/**
 * Caffeine Action - Toggle System Sleep Prevention
 * Botão toggle que previne o sistema de dormir (mas respeita estado dos monitores)
 *
 * IMPORTANTE:
 * - Ativo: Sistema continua processando, não entra em sleep
 * - Inativo: Comportamento normal do macOS (pode dormir)
 * - Monitores podem estar apagados independente do caffeine mode
 */

export default class Caffeine {
  constructor(context, $UD, $AudioAPI) {
    this.$UD = $UD
    this.$AudioAPI = $AudioAPI
    this.context = context
    this.isActive = false
    this.isToggling = false // Flag para evitar múltiplas chamadas simultâneas

    // Carrega status inicial quando API estiver pronta
    if (this.$AudioAPI.isStatusLoaded) {
      this.refreshStatus()
    } else {
      this.$AudioAPI.on('statusLoaded', () => {
        this.refreshStatus()
      })
    }
  }

  // Atualiza status de caffeine consultando a API
  async refreshStatus() {
    try {
      const result = await this.$AudioAPI.callAPI('/system/caffeine/status')

      if (result.success) {
        const newActive = result.data.active || false

        // Só atualiza se mudou
        if (this.isActive !== newActive) {
          this.isActive = newActive
          this.updateIcon()
        }
      }
    } catch (error) {
      console.error('[CAFFEINE] Failed to refresh status:', error)
    }
  }

  // Botão adicionado ao deck
  add() {
    this.refreshStatus()
  }

  // Botão clicado - toggle caffeine mode
  async run() {
    // Proteção contra fast clicking
    if (this.isToggling) {
      console.warn('[CAFFEINE] Toggle already in progress, ignoring...')
      this.$UD.toast('⏳ Aguarde...')
      return
    }

    console.log('[CAFFEINE] Toggling caffeine mode...')

    // Marca como toggling
    this.isToggling = true

    try {
      const result = await this.$AudioAPI.callAPI('/system/caffeine/toggle')

      if (result.success && result.data && result.data.success) {
        this.isActive = result.data.active

        // Atualiza ícone imediatamente
        this.updateIcon()

        // Toast com feedback
        const icon = this.isActive ? '☕' : '💤'
        const status = this.isActive ? 'ACTIVE' : 'INACTIVE'
        this.$UD.toast(`${icon} Caffeine ${status}`)
      } else {
        this.$UD.toast('❌ Failed to toggle caffeine')
        console.error('[CAFFEINE] Toggle failed:', result)
      }
    } catch (error) {
      this.$UD.toast('❌ Error toggling caffeine')
      console.error('[CAFFEINE] Error:', error)
    } finally {
      // Sempre libera o lock após 300ms
      setTimeout(() => {
        this.isToggling = false
      }, 300)
    }
  }

  // Botão fica visível/invisível
  setActive(isActive) {
    if (isActive) {
      // Quando deck volta a ser visível, atualiza status
      this.refreshStatus()
    }
  }

  // Settings atualizados (não usado neste botão, mas necessário pela interface)
  setParams(params) {
    // Nenhuma configuração necessária para este botão
  }

  // Atualiza ícone (verde = active, cinza = inactive)
  updateIcon() {
    // State 0 = inactive (ícone cinza com Zzz)
    // State 1 = active (ícone verde com café fumegante)

    // Label mostra a PRÓXIMA AÇÃO (não o estado atual)
    // Se está active → mostra "Deactivate" (o que vai fazer ao clicar)
    // Se está inactive → mostra "Activate" (o que vai fazer ao clicar)
    const labelText = this.isActive ? 'Deactivate' : 'Activate'

    this.$UD.setStateIcon(this.context, this.isActive ? 1 : 0, labelText)
  }

  // Botão removido
  clear() {
    // Cleanup se necessário
  }
}
