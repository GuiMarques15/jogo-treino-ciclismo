# Modelo de tabela de treinos

Uma linha por bloco do treino. Pode ser feito no Excel ou Google Planilhas e salvo como CSV.

| Coluna | O que colocar |
| --- | --- |
| treino | Nome do treino (igual em todas as linhas do mesmo treino) |
| objetivo | Resistencia, Limiar, VO2, Sprint, Recuperacao, Teste |
| nivel | Iniciante, Intermediario, Avancado |
| ordem | Posicao do bloco no treino (1, 2, 3...) |
| serie | Letra que agrupa blocos que se repetem juntos (vazio se nao repete) |
| repeticoes_da_serie | Quantas vezes a serie se repete (mesmo numero em todas as linhas da serie) |
| duracao_mm_ss | Duracao do bloco, ex.: 10:00 |
| tipo | fixo (alvo constante), rampa (vai do inicio ao fim) ou livre (sem alvo) |
| alvo_inicio_pct_ftp | Alvo em % do FTP (para fixo, so esse) |
| alvo_fim_pct_ftp | Alvo no fim do bloco, para rampa (para fixo, repetir o inicio) |
| cadencia_rpm | Cadencia sugerida, opcional |
| texto | Mensagem que aparece na tela durante o bloco, opcional |

O exemplo em modelo-treinos.csv e um "Sweet spot 3x10": aquecimento, 3 vezes (10 min a 90% + 5 min a 55%), desaquecimento.
