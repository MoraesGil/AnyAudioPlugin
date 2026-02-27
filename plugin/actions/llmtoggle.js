/**
 * LLM Toggle - Start/Stop local LLM servers via Hammerspoon
 *
 * States (3, same pattern as InputDevice):
 *   0 = OFF  (red robot)  - server not running on this port
 *   1 = ON   (green robot) - server running with selected model on selected port
 *   2 = LOADING (yellow robot) - server starting up
 *
 * Multiple instances can run simultaneously on different ports.
 * Port conflict and RAM checks are done server-side by Hammerspoon.
 */
export default class LLMToggle {
  constructor(context, $UD, $AudioAPI) {
    this.$UD = $UD
    this.$AudioAPI = $AudioAPI
    this.context = context
    this.state = 0
    this.isToggling = false
    this.config = {
      modelId: '',
      port: 58004,
      engine: 'vllm-mlx',
      modelList: []
    }
    this.pollTimer = null
    this._startupDone = false

    this.$AudioAPI.on('statusLoaded', () => {
      this._scheduleRefresh()
    })

    if (this.$AudioAPI.isStatusLoaded) {
      this._scheduleRefresh()
    }

    this.loadModelList()
  }

  _scheduleRefresh() {
    if (this._startupDone) {
      this.refreshStatus()
      return
    }
    setTimeout(() => {
      this._startupDone = true
      this.refreshStatus()
    }, 1500)
  }

  async loadModelList() {
    try {
      const result = await this.$AudioAPI.callAPI('/llm/list')
      if (result.success && result.data && result.data.models) {
        this.config.modelList = result.data.models
        this.$UD.sendParamFromPlugin({
          list: result.data.models,
          freeRAM: result.data.freeRAM,
          totalRAM: result.data.totalRAM,
          currentModelId: this.config.modelId,
          currentPort: this.config.port,
          engine: this.config.engine
        }, this.context)
      }
    } catch (e) {
      console.error('[LLM] Failed to load models:', e)
    }
  }

  async refreshStatus() {
    if (!this.config.modelId && !this.config.port) {
      this.state = 0
      this.updateIcon()
      return
    }

    try {
      // Uma única chamada ao status geral — evita double-fetch
      const result = await this.$AudioAPI.callAPI('/llm/status')
      if (result.success && result.data && result.data.servers) {
        const modelId = this.config.modelId
        const port    = this.config.port
        const match   = result.data.servers.find(
          s => (modelId && s.model === modelId) || (port && s.port === port)
        )
        if (match) {
          this.state = 1
          this.config.port = match.port
          this.updateIcon()
          this._updateTitle(match)
          this.stopPolling()
        } else {
          this.state = 0
          this.updateIcon()
          this.$UD.setTitle('', this.context)
        }
      }
    } catch (e) {
      this.state = 0
      this.updateIcon()
    }
  }

  _updateTitle(serverInfo) {
    if (!serverInfo) return
    const engine = serverInfo.type || this.config.engine || ''
    const port = serverInfo.port || this.config.port || ''
    this.$UD.setTitle(`${engine}\n:${port}`, this.context)
  }

  startPolling() {
    this.stopPolling()
    let count = 0
    let inFlight = false  // evita chamadas sobrepostas se HS demorar
    this.pollTimer = setInterval(async () => {
      if (inFlight) return
      count++
      inFlight = true

      try {
        const encoded = encodeURIComponent(this.config.modelId)
        const result = await this.$AudioAPI.callAPI(
          `/llm/status?model=${encoded}&port=${this.config.port}`
        )
        if (result.success && result.data && result.data.running) {
          this.state = 1
          this.updateIcon()
          this._updateTitle(result.data)
          this.$UD.toast('🤖 LLM pronta!')
          this.stopPolling()
          return
        }
      } catch (e) { /* keep polling */ } finally {
        inFlight = false
      }

      if (count > 60) {
        this.stopPolling()
        this.state = 0
        this.updateIcon()
        this.$UD.toast('⚠️ Timeout (5min) carregando modelo')
      }
    }, 5000)
  }

  stopPolling() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer)
      this.pollTimer = null
    }
  }

  add() {
    this.loadModelList()
    this.refreshStatus()
  }

  async run() {
    if (this.isToggling) {
      this.$UD.toast('⏳ Aguarde...')
      return
    }

    if (!this.config.modelId || this.config.modelId === '') {
      this.$UD.toast('⚠️ Abra as configs e selecione um modelo')
      return
    }

    this.isToggling = true

    try {
      if (this.state === 1) {
        const result = await this.$AudioAPI.callAPI(`/llm/stop?port=${this.config.port}`)
        if (result.success) {
          this.state = 0
          this.updateIcon()
          this.$UD.setTitle('', this.context)
          this.$UD.toast('🤖 LLM OFF')
        } else {
          this.$UD.toast('❌ ' + (result.data?.error || 'Falha ao parar'))
        }
      } else {
        const encoded = encodeURIComponent(this.config.modelId)
        const engine = this.config.engine || 'vllm-mlx'
        const result = await this.$AudioAPI.callAPI(
          `/llm/start?model=${encoded}&port=${this.config.port}&engine=${engine}`
        )
        if (result.success && result.data) {
          if (result.data.success === false) {
            if (result.data.portConflict) {
              this.$UD.toast('🚫 Porta ' + this.config.port + ' em uso! Escolha outra.')
            } else {
              this.$UD.toast('❌ ' + (result.data.error || 'Erro do servidor'))
            }
          } else if (result.data.running) {
            this.state = 1
            this.updateIcon()
            this._updateTitle(result.data)
            this.$UD.toast('🤖 Ja rodando')
          } else if (result.data.loading) {
            this.state = 2
            this.updateIcon()
            this.$UD.toast('🤖 Ja carregando...')
            this.startPolling()
          } else {
            this.state = 2
            this.updateIcon()
            const msg = result.data.ramWarning
              ? '⚠️ RAM baixa! Pode ficar lento...'
              : '🤖 Carregando (~30s)...'
            this.$UD.toast(msg)
            this.startPolling()
          }
        } else {
          const errMsg = result.data?.error || result.error || 'Hammerspoon nao respondeu'
          this.$UD.toast('❌ ' + errMsg)
        }
      }
    } catch (e) {
      this.$UD.toast('❌ Hammerspoon offline')
    } finally {
      setTimeout(() => { this.isToggling = false }, 1000)
    }
  }

  setActive(isActive) {
    if (isActive) {
      this.refreshStatus()
      this.loadModelList()
    }
  }

  setParams(params) {
    if (params.modelId !== undefined) this.config.modelId = params.modelId
    if (params.port !== undefined) this.config.port = parseInt(params.port) || 58004
    if (params.engine !== undefined) this.config.engine = params.engine
    this.refreshStatus()
  }

  updateIcon() {
    this.$UD.setStateIcon(this.context, this.state)
  }

  clear() {
    this.stopPolling()
  }
}
