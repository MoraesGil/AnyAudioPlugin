# Debug: Wireless Microphone Bug

## Problema
O dispositivo "Wireless microphone" funciona corretamente MAS perde a seleção no Property Inspector (fica em branco).

## Logs Adicionados

### Backend (plugin/actions/inputdevice.js)
```
[INPUT] setParams called with: { currentIndex: X }
[INPUT] Previous deviceIndex: Y
[INPUT] New deviceIndex: Z
[INPUT] Device at index Z: "Device Name"
```

### Frontend (property-inspector/input/inspector.js)
```
[INPUT] onSetParams: { list: [...], currentIndex: X }
[INPUT] Current ACTION_SETTING before merge: {...}
[INPUT] ACTION_SETTING after merge: {...}
[INPUT] Rendering N devices, selected index: X type: "number"
[INPUT] Selected device: "Device Name" at index X
```

## Como Testar

### 1. Instalar versão com logs
```bash
cd /Users/moraesdev/Desktop/AnyAudioPlugin
./install-dev.sh
```

### 2. Reiniciar Ulanzi Studio
```bash
killall "Ulanzi Studio" && open -a "Ulanzi Studio"
```

### 3. Abrir Console do Ulanzi Studio
- Menu > View > Toggle Developer Tools
- Aba "Console"

### 4. Testar "Wireless microphone"

**Teste A: Adicionar novo botão**
1. Adicione botão "Set Input Device" ao deck
2. Abra Property Inspector (clique no botão)
3. Selecione "Wireless microphone" no dropdown
4. **OBSERVE OS LOGS**:
   - Backend: `[INPUT] setParams called with: { currentIndex: X }`
   - Frontend: `[INPUT] onSetParams: ...`
   - Frontend: `[INPUT] Selected device: "Wireless microphone" at index X`
5. Feche e reabra o Property Inspector
6. **VERIFIQUE**: O "Wireless microphone" continua selecionado?

**Teste B: Comparar com outro dispositivo**
1. Adicione outro botão "Set Input Device"
2. Selecione outro device (ex: "WJK USB Audio")
3. **OBSERVE OS LOGS**
4. Feche e reabra o Property Inspector
5. **VERIFIQUE**: O device continua selecionado?

**Teste C: Verificar índice do Wireless microphone**
1. Nos logs, procure por: `[INPUT] Rendering N devices...`
2. Anote em qual índice está o "Wireless microphone"
3. Verifique se é índice 0 (primeiro da lista)

### 5. Copiar logs relevantes

Quando o bug ocorrer, copie TODOS os logs que começam com `[INPUT]` e envie.

## Possíveis Causas

### Causa 1: Problema com índice 0
Se "Wireless microphone" for o índice 0, pode haver problema na comparação:
```javascript
// Antes (buggy)
if (currentIndex * 1 === i)  // null * 1 = 0, seleciona índice 0 erroneamente

// Agora (fixed)
const selectedIndex = currentIndex !== null && currentIndex !== undefined ? Number(currentIndex) : -1
if (selectedIndex === i)  // -1 nunca vai ser igual a nenhum índice válido
```

### Causa 2: Tipo de dados inconsistente
- Backend salva como `Number(currentIndex)`
- Frontend recebe como string?
- Comparação falha

### Causa 3: Nome com espaço
- "Wireless microphone" tem espaço
- Pode estar causando problema no encoding/decoding

### Causa 4: Sincronização
- Settings não estão sendo salvos persistentemente
- Toda vez que reabre Property Inspector, perde o valor

## Próximos Passos

Após coletar os logs:
1. Identificar em qual ponto o `currentIndex` se perde
2. Verificar se é problema de tipo (string vs number)
3. Verificar se é problema com índice 0
4. Aplicar fix específico

## Possível Fix Rápido

Se confirmar que é problema de sincronização, adicionar ao `setParams`:
```javascript
// Re-envia lista para garantir sincronização
this.sendDeviceList()
```

**Já adicionado nesta versão!**
