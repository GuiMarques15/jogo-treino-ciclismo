# jogo-treino-ciclismo

Repositório do app de ciclismo: jogo single player de treino para smart trainers (celular, tablet e PC).

## Conteúdo

| Caminho | O que é |
| --- | --- |
| `index.html` | Página publicada pelo GitHub Pages: conecta o rolo (Bluetooth FTMS) e o cardíaco, roda percursos e tem os modos ERG e inclinação manuais. **Gerada** por `ferramentas/montar.py`; não edite direto. |
| `src/pagina.html` | Modelo da página (HTML, estilo e lógica da tela). |
| `src/ftms.js` | Leitura e comandos do FTMS e do monitor cardíaco. |
| `src/percurso.js` | Versões reduzidas do percurso, posição no percurso e física (potência vira velocidade). |
| `src/treino.js` | Treinos montados pela pessoa: blocos de duração e faixa de watts, bloco atual e alvo do ERG. |
| `src/historico.js` | Banco de dados local (IndexedDB): treinos montados e atividades feitas, com uma linha por segundo. |
| `rotas/` | Percursos: o GPX original e o `.json` convertido (trechos de 100 m com inclinação). |
| `ferramentas/` | `gpx_para_rota.py` converte GPX em percurso; `montar.py` gera o `index.html`. |
| `treinos/` | Modelo de tabela para os treinos pré-desenvolvidos e explicação das colunas. |
| `documentos/` | Desenho do núcleo do jogo (perfil do atleta, treinos, testes de FTP, bots, análise). |

## Como usar a página de teste

Abra o link do GitHub Pages do repositório:

- Android, PC e tablet: Chrome ou Edge.
- iPhone: app Bluefy (o Safari não tem Bluetooth web).

Toque em "Conectar trainer", escolha o rolo e use os botões de ERG e inclinação.

## Meus treinos

No cartão "Meus treinos", toque em "Novo treino", dê um nome e monte os blocos: duração (`mm:ss`, ou só os minutos) e a faixa de watts (mínimo e máximo). O botão ⧉ duplica um bloco, o que ajuda a montar intervalos. O treino fica salvo no aparelho e aparece na lista para fazer, editar ou apagar.

Ao fazer o treino, o rolo fica em ERG no meio da faixa de cada bloco. A tela mostra a faixa, quanto falta no bloco e no treino, e se a sua potência está dentro, abaixo ou acima da faixa. No fim, o rolo sai do ERG e o resumo mostra o tempo na faixa e a média de cada bloco.

## Atividades salvas

Cada percurso ou treino iniciado é salvo no próprio aparelho (IndexedDB do navegador), segundo a segundo, enquanto você pedala. Se a página fechar no meio, o que já foi pedalado continua salvo.

- Tabela `treinos`: os treinos montados (nome e blocos com duração e faixa de watts).
- Tabela `atividades`: uma linha por percurso ou treino feito (início, fim, nome, tempo, potência média e máxima, FC média; nos percursos também versão, peso, distância e subida; nos treinos o tempo na faixa).
- Tabela `segundos`: uma linha por segundo (`segundo, hora, potencia_w, cadencia_rpm, fc_bpm, velocidade_kmh, distancia_m, inclinacao_pct, altitude_m, bloco, alvo_min_w, alvo_max_w`; as colunas que não se aplicam ficam vazias).

O cartão "Percursos salvos" lista tudo e permite baixar o CSV ou apagar. Os dados ficam só naquele aparelho e naquele navegador; limpar os dados do site apaga o histórico.

## Como adicionar um percurso

1. Coloque o GPX em `rotas/` e converta: `python3 ferramentas/gpx_para_rota.py rotas/nome.gpx rotas/nome.json "Nome do percurso"`. Se o GPX tiver picos irreais nas curvas, acrescente a inclinação máxima no fim (ex.: `14`): os picos são aparados e a subida que sobra vai para os trechos vizinhos. A Serra do Rio do Rastro foi gerada com `14`.
2. Gere a página: `python3 ferramentas/montar.py`

Cada percurso aparece em três versões na página: 33%, 66% e 100% da distância, com as mesmas inclinações.

Depois de mudar qualquer arquivo em `src/` ou `rotas/`, rode `python3 ferramentas/montar.py` antes de publicar.
