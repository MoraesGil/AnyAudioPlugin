/**
 * Property Inspector - LLM Toggle
 * Auto-detects running engine/port when a model is selected.
 */

let ACTION_SETTING = {}
let form = null

$UD.connect('com.moraes.anysound.llmtoggle')

$UD.onConnected(conn => {
  form = document.querySelector('#property-inspector')
  document.querySelector('.udpi-wrapper').classList.remove('hidden')

  form.addEventListener('input', Utils.debounce(() => {
    const value = Utils.getFormValue(form)
    ACTION_SETTING = { ...ACTION_SETTING, ...value }
    $UD.sendParamFromPlugin(ACTION_SETTING)
    $UD.setSettings(ACTION_SETTING)
  }, 150))
})

$UD.onAdd(jsonObj => {
  if (jsonObj && jsonObj.param) {
    onSetParams(jsonObj.param)
  }
})

$UD.onParamFromApp(jsonObj => {
  if (jsonObj && jsonObj.param) {
    onSetParams(jsonObj.param)
  }
})

$UD.onParamFromPlugin(jsonObj => {
  if (jsonObj && jsonObj.param) {
    onSetParams(jsonObj.param)
  }
})

function onSetParams(params) {
  ACTION_SETTING = { ...ACTION_SETTING, ...params }

  if (params.list && params.list.length > 0) {
    renderModelList(params)
  }

  if (form) {
    Utils.setFormValue(ACTION_SETTING, form)
  }
}

function renderModelList() {
  const { list, currentModelId, currentPort } = ACTION_SETTING
  const select = document.getElementById('oList')
  const portInput = document.getElementById('portInput')
  const engineSelect = document.getElementById('engineSelect')
  const statusHint = document.getElementById('statusHint')

  if (!select || !list || list.length === 0) return

  select.innerHTML = ''

  let hasSelection = false

  for (let i = 0; i < list.length; i++) {
    const m = list[i]
    const option = document.createElement('option')
    option.value = m.id

    const prefix = m.running ? '🟢 ' : '🔴 '
    const portLabel = m.running
      ? '→ :' + m.runningPort + ' (' + (m.runningEngine || '?') + ')'
      : '— :' + m.defaultPort
    option.textContent = prefix + m.name + ' ' + portLabel

    if (currentModelId && currentModelId === m.id) {
      option.selected = true
      hasSelection = true
    }

    select.appendChild(option)
  }

  if (!hasSelection && list.length > 0) {
    select.selectedIndex = 0
    applyModelSelection(list[0])
  } else if (hasSelection) {
    const current = list.find(m => m.id === currentModelId)
    if (current) updateHint(current)
  }

  if (currentPort && portInput) {
    portInput.value = currentPort
  }

  if (ACTION_SETTING.engine && engineSelect) {
    engineSelect.value = ACTION_SETTING.engine
  }

  // Re-attach model select listener
  const newSelect = select.cloneNode(true)
  select.parentNode.replaceChild(newSelect, select)

  newSelect.addEventListener('change', function () {
    const selectedModel = list.find(m => m.id === newSelect.value)
    if (selectedModel) {
      applyModelSelection(selectedModel)
    }
  })

  // Re-attach engine select listener
  if (engineSelect) {
    const newEngine = engineSelect.cloneNode(true)
    engineSelect.parentNode.replaceChild(newEngine, engineSelect)
    if (ACTION_SETTING.engine) newEngine.value = ACTION_SETTING.engine

    newEngine.addEventListener('change', function () {
      ACTION_SETTING.engine = newEngine.value
      $UD.sendParamFromPlugin(ACTION_SETTING)
      $UD.setSettings(ACTION_SETTING)
    })
  }
}

function applyModelSelection(model) {
  const portInput = document.getElementById('portInput')
  const engineSelect = document.getElementById('engineSelect')

  ACTION_SETTING.modelId = model.id

  if (model.running) {
    // Auto-fill from running state
    ACTION_SETTING.port = model.runningPort
    ACTION_SETTING.engine = engineFromType(model.runningEngine)
    if (portInput) portInput.value = model.runningPort
    if (engineSelect) engineSelect.value = ACTION_SETTING.engine
  } else {
    ACTION_SETTING.port = model.defaultPort
    if (portInput) portInput.value = model.defaultPort
    if (!ACTION_SETTING.engine) {
      ACTION_SETTING.engine = 'vllm-mlx'
      if (engineSelect) engineSelect.value = 'vllm-mlx'
    }
  }

  updateHint(model)
  $UD.sendParamFromPlugin(ACTION_SETTING)
  $UD.setSettings(ACTION_SETTING)
}

function engineFromType(serverType) {
  if (!serverType) return 'vllm-mlx'
  if (serverType === 'mlx-lm') return 'mlx-lm'
  if (serverType === 'litellm') return 'litellm'
  return 'vllm-mlx'
}

function updateHint(model) {
  const hint = document.getElementById('statusHint')
  if (!hint) return

  if (model.running) {
    hint.textContent = '🟢 ON — ' + (model.runningEngine || '?') + ' :' + model.runningPort + ' (RAM: ~' + model.ramRequired + 'GB)'
    hint.style.color = '#34C759'
  } else {
    hint.textContent = '🔴 OFF — precisa ~' + model.ramRequired + 'GB RAM'
    hint.style.color = '#FF3B30'
  }
}
