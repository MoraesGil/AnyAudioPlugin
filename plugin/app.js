#!/usr/bin/env node
/**
 * AnySound Plugin v1.0
 * Professional Audio Device Switcher
 * Segue padrão oficial do SDK Ulanzi
 */

import { UlanzideckApi } from './actions/plugin-common-node/index.js'
import AudioAPI from './actions/audioapi.js'
import InputDevice from './actions/inputdevice.js'
import OutputDevice from './actions/outputdevice.js'

// Cache de instâncias de botões
const ACTION_CACHES = {}

// SDK Ulanzi
const $UD = new UlanzideckApi()

// API de Áudio
const $AudioAPI = new AudioAPI()

// Conecta ao Ulanzi Studio
$UD.connect('com.moraes.anysound')

$UD.onConnected(conn => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🎵 AnySound v1.0 - Professional Audio Switcher')
  console.log('✅ Connected to UlanziDeck')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
})

// Botão adicionado ao deck
$UD.onAdd(jsn => {
  const { context, uuid, param } = jsn
  const instance = ACTION_CACHES[context]

  console.log('➕ onAdd:', { context, uuid })

  if (!instance) {
    // Cria nova instância baseada no UUID
    if (uuid === 'com.moraes.anysound.input') {
      ACTION_CACHES[context] = new InputDevice(context, $UD, $AudioAPI)
    } else if (uuid === 'com.moraes.anysound.output') {
      ACTION_CACHES[context] = new OutputDevice(context, $UD, $AudioAPI)
    }

    // Aplica settings salvos (se houver)
    if (param && Object.keys(param).length > 0) {
      const newInstance = ACTION_CACHES[context]
      if (newInstance && typeof newInstance.setParams === 'function') {
        newInstance.setParams(param)
      }
    }
  } else {
    // Instância já existe, chama add()
    if (typeof instance.add === 'function') {
      instance.add()
    }
  }
})

// Botão fica visível/invisível
$UD.onSetActive(jsn => {
  const { context, active } = jsn
  const instance = ACTION_CACHES[context]

  if (instance && typeof instance.setActive === 'function') {
    instance.setActive(active)
  }
})

// Botão clicado
$UD.onRun(jsn => {
  const { context } = jsn
  const instance = ACTION_CACHES[context]

  if (!instance) {
    // Se não existe, cria
    $UD.emit('add', jsn)
  } else {
    console.log('🔘 onRun:', context)
    if (typeof instance.run === 'function') {
      instance.run(jsn)
    }
  }
})

// Botão removido
$UD.onClear(jsn => {
  if (jsn.param && Array.isArray(jsn.param)) {
    for (let i = 0; i < jsn.param.length; i++) {
      const context = jsn.param[i].context
      const instance = ACTION_CACHES[context]

      console.log('🗑️  onClear:', context)

      if (instance && typeof instance.clear === 'function') {
        instance.clear(context)
      }

      delete ACTION_CACHES[context]
    }
  }
})

// Settings atualizados do App
$UD.onParamFromApp(jsn => {
  onSetParams(jsn)
})

// Settings atualizados do PropertyInspector
$UD.onParamFromPlugin(jsn => {
  onSetParams(jsn)
})

// Atualiza params
function onSetParams(jsn) {
  const settings = jsn.param || {}
  const context = jsn.context
  const instance = ACTION_CACHES[context]

  if (!settings || !instance || JSON.stringify(settings) === '{}') return

  console.log('⚙️  onSetParams:', { context, settings })

  if (typeof instance.setParams === 'function') {
    instance.setParams(settings)
  }
}

// Error handling
$UD.onClose(() => {
  console.log('🔌 Disconnected')
  process.exit(0)
})

$UD.onError(error => {
  console.error('❌ Error:', error)
})

process.on('uncaughtException', (error) => {
  console.error('💥 Exception:', error)
})

process.on('unhandledRejection', (reason) => {
  console.error('💥 Rejection:', reason)
})

console.log('🚀 AnySound Plugin starting...')
