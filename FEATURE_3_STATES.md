# Feature: 3-State Device Toggle

## Overview

Implementação de sistema de **3 estados** para botões de dispositivos de áudio (Input/Output), permitindo controle completo de ativação e mute com um único botão.

## Estados dos Botões

### State 0: Inactive (Vermelho)
- **Indicador visual**: Ícone vermelho com linha diagonal
- **Condição**: Outro dispositivo está ativo
- **Comportamento ao clicar**: Ativa este dispositivo (sempre unmuted)

### State 1: Active (Verde)
- **Indicador visual**: Ícone verde
- **Condição**: Este dispositivo está ativo E não está mutado
- **Comportamento ao clicar**: Muta o dispositivo

### State 2: Muted (Cinza)
- **Indicador visual**: Ícone cinza com X
- **Condição**: Este dispositivo está ativo MAS está mutado
- **Comportamento ao clicar**: Desmuta o dispositivo (volta para Active)

## Comportamento de Toggle

### Ciclo de cliques em um botão:
```
Inactive (vermelho)
    ↓ click
Active (verde)
    ↓ click
Muted (cinza)
    ↓ click
Active (verde)
    ↓ click
Muted (cinza)
    ↓ ...
```

### Ao trocar de dispositivo:
```
Botão A: Active (verde) → clica em Botão B
Botão A: Inactive (vermelho)
Botão B: Active (verde)
```

**Importante**: O dispositivo anterior **sempre volta para Inactive**, nunca para Muted.

### Ao voltar para dispositivo anterior:
```
Botão A: Active/Muted → clica em Botão B → clica em Botão A novamente
Botão A: volta para Active (verde), NUNCA para Muted
```

**Importante**: Ao reativar um dispositivo, ele **sempre começa unmuted**, independente do estado anterior.

## Arquivos Modificados

### 1. Ícones Criados
- `assets/actions/input/input_muted.svg` - Ícone cinza para microfone mutado
- `assets/actions/output/output_muted.svg` - Ícone cinza para saída mutada

### 2. manifest.json
- Adicionado terceiro estado (State 2) para Input e Output devices
- Referências aos novos ícones muted

### 3. plugin/actions/audioapi.js
**Novos métodos:**
- `getMuteStatus(type)` - Verifica status de mute do dispositivo
- `toggleMute(type)` - Alterna estado de mute
- `isMuted(type)` - Retorna se dispositivo está mutado

**Novos eventos:**
- `inputMuteChanged` - Emitido quando mute do input muda
- `outputMuteChanged` - Emitido quando mute do output muda

**Novo estado:**
- `muteStatus.input` - Cache do status de mute do input
- `muteStatus.output` - Cache do status de mute do output

### 4. plugin/actions/inputdevice.js
**Modificações em `run()`:**
- Implementa lógica de 3 estados
- CASO 1: Inactive → ativa dispositivo (unmuted)
- CASO 2: Active → muta dispositivo
- CASO 3: Muted → desmuta dispositivo
- Garante que ao ativar dispositivo, ele sempre começa unmuted

**Modificações em `updateIcon()`:**
- Verifica 3 condições:
  1. Não é o dispositivo ativo → State 0 (Inactive)
  2. É o dispositivo ativo E está mutado → State 2 (Muted)
  3. É o dispositivo ativo E não está mutado → State 1 (Active)

**Novo listener:**
- `inputMuteChanged` - Atualiza ícone quando mute muda

### 5. plugin/actions/outputdevice.js
Mesmas modificações de `inputdevice.js`, adaptadas para output.

## API Hammerspoon Requerida

O plugin espera que a API Hammerspoon forneça os seguintes endpoints:

### Status de Mute
```
GET /audio/input/mute/status
Response: { "muted": true/false }

GET /audio/output/mute/status
Response: { "muted": true/false }
```

### Toggle Mute
```
GET /audio/input/mute/toggle
Response: { "success": true, "muted": true/false }

GET /audio/output/mute/toggle
Response: { "success": true, "muted": true/false }
```

## Benefícios

1. **UX Simplificada**: Um único botão controla ativação e mute
2. **Feedback Visual Claro**: 3 cores (verde/vermelho/cinza) mostram estado exato
3. **Comportamento Intuitivo**: Ao trocar dispositivo, sempre começa unmuted
4. **Menos Botões**: Não precisa de botões separados para mute
5. **Compatibilidade**: Mantém botões de mute independentes (micmute/outputmute) para casos específicos

## Instalação

```bash
cd /Users/moraesdev/Desktop/AnyAudioPlugin
./install-plugin.sh
```

## Testes Recomendados

1. **Toggle básico**: Clicar 3x no mesmo botão deve ciclar verde → cinza → verde
2. **Troca de dispositivo**: Trocar de A para B deve deixar A vermelho e B verde
3. **Persistência de unmute**: A (verde) → mute (cinza) → troca para B → volta para A → deve estar verde
4. **Múltiplos botões**: Ter 3+ botões de input/output e testar todas as combinações

## Versão

- **Plugin Version**: 1.0.0
- **Feature**: 3-State Device Toggle
- **Data**: 2026-02-02
- **Autor**: moraesdev
