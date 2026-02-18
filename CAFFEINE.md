# Caffeine Mode

Toggle que **impede o sistema de dormir** mas **permite que as telas escureçam** (economia de energia).

## Comportamento

| Caffeine | Sistema (CPU/processos) | Display (monitores) |
|----------|-------------------------|----------------------|
| **ON**   | Não dorme               | Pode dormir (após tempo de inatividade) |
| **OFF**  | Pode dormir             | Pode dormir          |

- **Botão no deck**: um clique alterna entre ON e OFF; o ícone indica o estado atual (verde = ativo, cinza = inativo).
- **Backend**: Hammerspoon usa `systemIdle` (não `displayIdle`), então só o sleep do *sistema* é bloqueado; o sleep do *display* segue as preferências do macOS.

## Lock screen (senha ao acordar)

Se, ao acordar o display, a tela de bloqueio pedir senha, isso vem das preferências do macOS, não do Caffeine:

- **Ajustes do Sistema** → **Tela de bloqueio** → **Requerer senha após**  
- Para não pedir senha ao acordar o display: escolha **Nunca** ou o intervalo desejado.

## Requisitos

- Hammerspoon rodando com a API em `http://127.0.0.1:8765`.
- Rotas: `GET /system/caffeine/status`, `GET /system/caffeine/toggle`.
