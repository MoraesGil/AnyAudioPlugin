/**
 * Property Inspector - Set Output Device
 * Usa UID para identificar dispositivos (estável entre reordenações)
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
  console.log('[OUTPUT] onSetParams:', params, 'current UID:', ACTION_SETTING.deviceUID)
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

// Renderiza form com UID como value
function renderForm(params) {
  const { list, currentUID } = ACTION_SETTING
  const select = document.getElementById('oList')

  if (!select || !list) return

  console.log('[OUTPUT] renderForm - currentUID:', currentUID)

  // Limpa select
  select.innerHTML = ''

  // Adiciona options com UID como value
  for (let i = 0; i < list.length; i++) {
    const option = document.createElement('option')
    option.setAttribute('value', list[i].uid)
    option.setAttribute('label', list[i].name)

    // Marca como selected pelo UID
    if (currentUID && currentUID === list[i].uid) {
      option.selected = true
      console.log('[OUTPUT] ✓ Selected:', list[i].name, 'UID:', list[i].uid)
    }

    select.appendChild(option)
  }
}
