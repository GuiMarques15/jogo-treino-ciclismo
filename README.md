# jogo-treino-ciclismo

Repositório do app de ciclismo: jogo single player de treino para smart trainers (celular, tablet e PC).

## Conteúdo

| Caminho | O que é |
| --- | --- |
| `index.html` | Página de teste de conexão: liga ao trainer por Bluetooth FTMS e ao monitor cardíaco, com modos ERG e inclinação. Publicada pelo GitHub Pages. |
| `src/ftms.js` | Leitura e comandos do FTMS e do monitor cardíaco (fonte; uma cópia está embutida no `index.html`). |
| `treinos/` | Modelo de tabela para os treinos pré-desenvolvidos e explicação das colunas. |
| `documentos/` | Desenho do núcleo do jogo (perfil do atleta, treinos, testes de FTP, bots, análise). |

## Como usar a página de teste

Abra o link do GitHub Pages do repositório:

- Android, PC e tablet: Chrome ou Edge.
- iPhone: app Bluefy (o Safari não tem Bluetooth web).

Toque em "Conectar trainer", escolha o rolo e use os botões de ERG e inclinação.

Ao alterar `src/ftms.js`, copie a mudança para o bloco embutido no `index.html`.
