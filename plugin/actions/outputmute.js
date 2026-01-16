/**
 * OutputMute Action - Toggle Output (Speaker/Headphones) Mute/Unmute
 * Botão toggle independente que muta/desmuta a saída de áudio atual
 *
 * IMPORTANTE:
 * - O estado de mute é INDEPENDENTE da troca de device
 * - Quando troca o output device, o mute NÃO é afetado
 * - Detecta mudanças externas (via teclas de volume/mute ou outras apps)
 */

export default class OutputMute {
  constructor(context, $UD, $AudioAPI) {
    this.$UD = $UD
    this.$AudioAPI = $AudioAPI
    this.context = context
    this.isMuted = false
    this.isToggling = false // Flag para evitar múltiplas chamadas simultâneas

    // Monitora mudanças de device ativo (para atualizar status de mute)
    this.$AudioAPI.on('outputChanged', () => {
      this.refreshMuteStatus()
    })

    // Carrega status inicial quando API estiver pronta
    if (this.$AudioAPI.isStatusLoaded) {
      this.refreshMuteStatus()
    } else {
      this.$AudioAPI.on('statusLoaded', () => {
        this.refreshMuteStatus()
      })
    }
  }

  // Atualiza status de mute consultando a API
  async refreshMuteStatus() {
    try {
      const result = await this.$AudioAPI.callAPI('/audio/output/mute/status')

      if (result.success && result.data) {
        const newMuted = result.data.muted || false

        // Só atualiza se mudou
        if (this.isMuted !== newMuted) {
          this.isMuted = newMuted
          this.updateIcon()
        }
      }
    } catch (error) {
      console.error('[OUTPUTMUTE] Failed to refresh status:', error)
    }
  }

  // Botão adicionado ao deck
  add() {
    this.refreshMuteStatus()
  }

  // Botão clicado - toggle mute/unmute
  async run() {
    // Proteção contra fast clicking
    if (this.isToggling) {
      console.warn('[OUTPUTMUTE] Toggle already in progress, ignoring...')
      this.$UD.toast('⏳ Aguarde...')
      return
    }

    console.log('[OUTPUTMUTE] Toggling mute...')

    // Marca como toggling
    this.isToggling = true

    try {
      const result = await this.$AudioAPI.callAPI('/audio/output/mute/toggle')

      if (result.success && result.data && result.data.success) {
        this.isMuted = result.data.muted

        // Atualiza ícone imediatamente
        this.updateIcon()

        // Toast com feedback
        const icon = this.isMuted ? '🔇' : '🔊'
        const status = this.isMuted ? 'MUTED' : 'UNMUTED'
        this.$UD.toast(`${icon} ${status}`)
      } else {
        this.$UD.toast('❌ Failed to toggle mute')
        console.error('[OUTPUTMUTE] Toggle failed:', result)
      }
    } catch (error) {
      this.$UD.toast('❌ Error toggling mute')
      console.error('[OUTPUTMUTE] Error:', error)
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
      // (pode ter sido mutado externamente via teclas ou outras apps)
      this.refreshMuteStatus()
    }
  }

  // Settings atualizados (não usado neste botão, mas necessário pela interface)
  setParams(params) {
    // Nenhuma configuração necessária para este botão
  }

  // Atualiza ícone (vermelho = muted, verde = unmuted)
  updateIcon() {
    // State 0 = muted (ícone vermelho com speaker cortado)
    // State 1 = unmuted (ícone verde com speaker normal)

    // Label mostra a PRÓXIMA AÇÃO (não o estado atual)
    // Se está muted → mostra "Unmute" (o que vai fazer ao clicar)
    // Se está unmuted → mostra "Mute" (o que vai fazer ao clicar)
    const labelText = this.isMuted ? 'Unmute' : 'Mute'

    this.$UD.setStateIcon(this.context, this.isMuted ? 0 : 1, labelText)
  }

  // Botão removido
  clear() {
    // Cleanup se necessário
  }
}
