# Guia de Instalação - AnySound Plugin

## 📦 Componentes do Sistema

O AnySound Plugin é composto por **2 componentes principais**:

### 1. Backend Hammerspoon (API HTTP)
**Localização**: `~/.hammerspoon/audio-manager.lua` + `~/.hammerspoon/init.lua`

**Funções**:
- Gerencia dispositivos de áudio do macOS
- Fornece API HTTP em `http://127.0.0.1:8765`
- Controla troca de dispositivos e mute/unmute

**Endpoints disponíveis**:
```
GET /health                          - Health check
GET /audio/devices/list              - Lista todos os dispositivos
GET /audio/status                    - Status atual (input/output)
GET /audio/input/index/:id/set       - Define dispositivo input por índice
GET /audio/output/index/:id/set      - Define dispositivo output por índice
GET /audio/input/mute/status         - Status de mute do input
GET /audio/input/mute/toggle         - Toggle mute do input
GET /audio/output/mute/status        - Status de mute do output
GET /audio/output/mute/toggle        - Toggle mute do output
```

### 2. Plugin Ulanzi (Frontend)
**Localização**: `~/Library/Application Support/Ulanzi/UlanziDeck/Plugins/com.moraes.anysound.ulanziPlugin/`

**Funções**:
- Interface visual no Ulanzi Deck
- Botões para controlar dispositivos
- Indicadores de status (verde/vermelho/cinza)
- 4 ações disponíveis:
  - Set Input Device (3 estados: inactive/active/muted)
  - Set Output Device (3 estados: inactive/active/muted)
  - Microphone Mute Toggle (botão independente)
  - Output Mute Toggle (botão independente)

---

## 🚀 Opções de Instalação

### Opção 1: Instalação Completa (RECOMENDADO)

**Script**: `/Users/moraesdev/Desktop/TOOLS_MORAES/ULANZI/scripts/QUICK-INSTALL.sh`

**O que faz**:
✅ Instala backend Hammerspoon (audio-manager.lua)
✅ Cria/atualiza init.lua com TODOS os endpoints (incluindo mute)
✅ Recarrega Hammerspoon automaticamente
✅ Faz build do plugin
✅ Instala plugin no Ulanzi Deck
✅ Testa API Hammerspoon
✅ Verifica instalação completa

**Quando usar**:
- Primeira instalação
- Atualização completa do sistema
- Quando mudou tanto o backend quanto o plugin

**Como executar**:
```bash
cd /Users/moraesdev/Desktop/TOOLS_MORAES/ULANZI/scripts
./QUICK-INSTALL.sh
```

---

### Opção 2: Instalação Apenas do Plugin

**Script**: `/Users/moraesdev/Desktop/AnyAudioPlugin/install-dev.sh`

**O que faz**:
✅ Faz build do plugin (webpack)
✅ Remove instalação antiga do plugin
✅ Instala plugin atualizado no Ulanzi Deck
✅ Oferece restart automático do Ulanzi Studio

**NÃO faz**:
❌ Não toca no backend Hammerspoon
❌ Não atualiza init.lua
❌ Não adiciona endpoints

**Quando usar**:
- Desenvolvimento/debug do plugin
- Quando só mudou código do plugin
- Backend já está funcionando

**Como executar**:
```bash
cd /Users/moraesdev/Desktop/AnyAudioPlugin
./install-dev.sh
```

---

### Opção 3: Desinstalação

**Script**: `/Users/moraesdev/Desktop/AnyAudioPlugin/uninstall.sh`

**O que faz**:
✅ Remove plugin do Ulanzi Deck
✅ Limpa diretório de instalação

**Como executar**:
```bash
cd /Users/moraesdev/Desktop/AnyAudioPlugin
./uninstall.sh
```

---

## 🔧 Instalação Manual do Backend (Se Necessário)

Se o `QUICK-INSTALL.sh` não funcionar ou você quiser instalar manualmente:

### 1. Copiar audio-manager.lua
```bash
cp /Users/moraesdev/Desktop/TOOLS_MORAES/ULANZI/docs/hammerspoon/audio-manager.lua ~/.hammerspoon/
```

### 2. Configurar init.lua

Adicione ao seu `~/.hammerspoon/init.lua`:

```lua
-- Load Audio Manager
AudioManager = require('audio-manager')

-- Start HTTP Server
local server = require('hs.httpserver')
local json = require('hs.json')
local audioServer = server.new()

-- Health check
audioServer:setCallback('/health', function(method, path, headers, body)
  return json.encode({status = "healthy", service = "AnySound API", version = "1.0.0"}), 200, {["Content-Type"] = "application/json"}
end)

-- List devices
audioServer:setCallback('/audio/devices/list', function(method, path, headers, body)
  return json.encode({success = true, devices = AudioManager.listDevicesDetailed()}), 200, {["Content-Type"] = "application/json"}
end)

-- Get status
audioServer:setCallback('/audio/status', function(method, path, headers, body)
  return json.encode(AudioManager.getStatus()), 200, {["Content-Type"] = "application/json"}
end)

-- Set input by index
audioServer:setCallback('/audio/input/index/%d+/set', function(method, path, headers, body)
  local index = tonumber(path:match('/audio/input/index/(%d+)/set'))
  return json.encode(AudioManager.setDeviceByIndex(index, "input")), 200, {["Content-Type"] = "application/json"}
end)

-- Set output by index
audioServer:setCallback('/audio/output/index/%d+/set', function(method, path, headers, body)
  local index = tonumber(path:match('/audio/output/index/(%d+)/set'))
  return json.encode(AudioManager.setDeviceByIndex(index, "output")), 200, {["Content-Type"] = "application/json"}
end)

-- Mic mute status
audioServer:setCallback('/audio/input/mute/status', function(method, path, headers, body)
  return json.encode(AudioManager.getMicMuteStatus()), 200, {["Content-Type"] = "application/json"}
end)

-- Mic mute toggle
audioServer:setCallback('/audio/input/mute/toggle', function(method, path, headers, body)
  return json.encode(AudioManager.toggleMicMute()), 200, {["Content-Type"] = "application/json"}
end)

-- Output mute status
audioServer:setCallback('/audio/output/mute/status', function(method, path, headers, body)
  return json.encode(AudioManager.getOutputMuteStatus()), 200, {["Content-Type"] = "application/json"}
end)

-- Output mute toggle
audioServer:setCallback('/audio/output/mute/toggle', function(method, path, headers, body)
  return json.encode(AudioManager.toggleOutputMute()), 200, {["Content-Type"] = "application/json"}
end)

-- Start server
audioServer:setPort(8765):start()
print("✅ AnySound API started on http://127.0.0.1:8765")
```

### 3. Recarregar Hammerspoon
```bash
# Via CLI
hs -c "hs.reload()"

# Ou via teclado
# Cmd + Alt + Ctrl + R
```

### 4. Testar API
```bash
curl http://127.0.0.1:8765/health
curl http://127.0.0.1:8765/audio/devices/list
curl http://127.0.0.1:8765/audio/input/mute/status
```

---

## 🧪 Testando a Instalação

### Testar Backend Hammerspoon
```bash
cd /Users/moraesdev/Desktop/TOOLS_MORAES/ULANZI/scripts
./hammerspoon-test.sh
```

### Testar Plugin Ulanzi
1. Abra Ulanzi Studio
2. Procure categoria "AnySound"
3. Arraste "Set Input Device" para o deck
4. Configure o dispositivo no Property Inspector
5. Clique 3x no botão: Verde → Cinza → Verde

---

## 🔄 Fluxo de Atualização

### Atualizando Backend + Plugin (versão completa)
```bash
cd /Users/moraesdev/Desktop/TOOLS_MORAES/ULANZI/scripts
./QUICK-INSTALL.sh
```

### Atualizando Apenas Plugin (desenvolvimento)
```bash
cd /Users/moraesdev/Desktop/AnyAudioPlugin
./install-dev.sh
```

### Após Mudanças no Código
```bash
# 1. Build
cd /Users/moraesdev/Desktop/AnyAudioPlugin
npm run build

# 2. Instalar
./install-dev.sh

# 3. Reiniciar Ulanzi Studio
killall "Ulanzi Studio" && open -a "Ulanzi Studio"
```

---

## 📁 Estrutura de Arquivos

```
AnyAudioPlugin/                         # Repositório principal
├── plugin/                             # Código fonte do plugin
│   ├── app.js                          # Entry point
│   └── actions/                        # Actions (input/output/mute)
├── assets/                             # Ícones (verde/vermelho/cinza)
├── dist/                               # Código compilado (gerado)
├── manifest.json                       # Configuração do plugin
├── install-dev.sh                      # Instalador só plugin
└── uninstall.sh                        # Desinstalador

TOOLS_MORAES/ULANZI/
├── docs/hammerspoon/
│   └── audio-manager.lua               # Backend Hammerspoon
└── scripts/
    ├── QUICK-INSTALL.sh                # Instalador completo ⭐
    └── hammerspoon-test.sh             # Tester da API

~/.hammerspoon/                         # Instalação Hammerspoon
├── audio-manager.lua                   # Backend (copiado)
└── init.lua                            # Config com endpoints HTTP

~/Library/.../Plugins/                  # Instalação Plugin
└── com.moraes.anysound.ulanziPlugin/
    ├── dist/app.js                     # Código compilado
    ├── assets/                         # Ícones
    ├── manifest.json                   # Config
    └── node_modules/                   # Dependências
```

---

## ⚠️ Troubleshooting

### Plugin não aparece no Ulanzi Studio
```bash
# Verificar instalação
ls -la ~/Library/Application\ Support/Ulanzi/UlanziDeck/Plugins/com.moraes.anysound.ulanziPlugin/

# Reinstalar
cd /Users/moraesdev/Desktop/AnyAudioPlugin
./install-dev.sh

# Reiniciar Ulanzi Studio
killall "Ulanzi Studio" && open -a "Ulanzi Studio"
```

### API Hammerspoon não responde
```bash
# Testar API
curl http://127.0.0.1:8765/health

# Se falhar, recarregar Hammerspoon
hs -c "hs.reload()"

# Ou via teclado: Cmd + Alt + Ctrl + R
```

### Endpoints de mute não funcionam (404)
Provavelmente o init.lua não tem os endpoints. Execute:
```bash
cd /Users/moraesdev/Desktop/TOOLS_MORAES/ULANZI/scripts
./QUICK-INSTALL.sh
```

Isso vai recriar o init.lua com todos os endpoints.

---

## 🎯 Versão Atual

- **Plugin Version**: 1.0.0
- **Backend Version**: 1.0.0
- **New Features**:
  - 3-state device toggle (inactive/active/muted)
  - Integrated mute controls
  - Smart device switching (always starts unmuted)
- **Data**: 2026-02-02
