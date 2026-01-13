/**
 * Property Inspector - Set Output Device
 * Padrão oficial do SDK Ulanzi
 */

let ACTION_SETTING = {}
let form = null

// Conecta ao plugin (action UUID)
$UD.connect('com.moraes.anysound.output')

$UD.onConnected(conn => {
  console.log('[OUTPUT] Connected')
  form = document.querySelector('#property-inspector')
  document.querySelector('.udpi-wrapper').classList.remove('hidden')

  // Um único listener - padrão oficial
  form.addEventListener('input', Utils.debounce(() => {
    const value = Utils.getFormValue(form)
    ACTION_SETTING = { ...ACTION_SETTING, ...value }
    console.log('[OUTPUT] Sending:', ACTION_SETTING)

    // Envia para o backend (temporário)
    $UD.sendParamFromPlugin(ACTION_SETTING)

    // Salva persistentemente
    $UD.setSettings(ACTION_SETTING)
  }, 150))
})

// Recebe settings quando botão é adicionado
$UD.onAdd(jsonObj => {
  console.log('[OUTPUT] onAdd:', jsonObj)
  if (jsonObj && jsonObj.param) {
    onSetParams(jsonObj.param)
  }
})

// Recebe settings do app
$UD.onParamFromApp(jsonObj => {
  console.log('[OUTPUT] onParamFromApp:', jsonObj)
  if (jsonObj && jsonObj.param) {
    onSetParams(jsonObj.param)
  }
})

// Recebe settings do plugin backend
$UD.onParamFromPlugin(jsonObj => {
  console.log('[OUTPUT] onParamFromPlugin:', jsonObj)
  if (jsonObj && jsonObj.param) {
    onSetParams(jsonObj.param)
  }
})

// Aplica settings ao form - padrão oficial
function onSetParams(params) {
  console.log('[OUTPUT] onSetParams:', params)
  ACTION_SETTING = { ...ACTION_SETTING, ...params }

  // Se recebeu lista de devices, renderizar
  if (params.list && params.list.length > 0) {
    renderForm(params)
  }

  // Aplicar valores ao form
  if (form) {
    Utils.setFormValue(ACTION_SETTING, form)
  }
}

// Renderiza form - padrão oficial
function renderForm(params) {
  const { list, currentIndex } = ACTION_SETTING
  const select = document.getElementById('oList')

  if (!select || !list) return

  console.log('[OUTPUT] Rendering', list.length, 'devices, selected:', currentIndex)

  // Limpa select
  select.innerHTML = ''

  // Adiciona options
  for (let i = 0; i < list.length; i++) {
    const option = document.createElement('option')
    option.setAttribute('value', i)
    option.setAttribute('label', list[i].name)

    // Marca como selected - padrão oficial
    if (currentIndex * 1 === i) {
      option.selected = true
    }

    select.appendChild(option)
  }
}
