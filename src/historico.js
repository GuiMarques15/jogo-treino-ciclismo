// Banco de dados local (IndexedDB). Cada percurso ou treino feito é uma
// atividade, e cada segundo pedalado é uma linha na tabela `segundos`, gravada
// na hora, então fechar a página no meio não perde o que já foi pedalado.
// A tabela `treinos` guarda os treinos montados pela pessoa.
(function (root) {
  const NOME = 'treino-no-rolo', VERSAO = 2;
  const COLUNAS = ['segundo', 'hora', 'potencia_w', 'cadencia_rpm', 'fc_bpm', 'velocidade_kmh',
    'distancia_m', 'inclinacao_pct', 'altitude_m', 'bloco', 'alvo_min_w', 'alvo_max_w'];
  let banco = null;

  function abrir() {
    if (banco) return banco;
    banco = new Promise((ok, erro) => {
      const req = indexedDB.open(NOME, VERSAO);
      req.onupgradeneeded = e => {
        const db = req.result;
        if (e.oldVersion < 1) {
          db.createObjectStore('atividades', { keyPath: 'id', autoIncrement: true });
          db.createObjectStore('segundos', { keyPath: ['atividade', 'segundo'] });
        }
        if (e.oldVersion < 2) db.createObjectStore('treinos', { keyPath: 'id', autoIncrement: true });
      };
      req.onsuccess = () => ok(req.result);
      req.onerror = () => erro(req.error);
    });
    // Pede ao navegador para não apagar os dados quando faltar espaço.
    if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
    return banco;
  }

  async function tx(lojas, modo, fn) {
    const db = await abrir();
    return new Promise((ok, erro) => {
      const t = db.transaction(lojas, modo);
      const r = fn(t);
      t.oncomplete = () => ok(r && 'result' in r ? r.result : r);
      t.onerror = () => erro(t.error);
      t.onabort = () => erro(t.error);
    });
  }

  // Cria a atividade e devolve o id dela.
  const criarAtividade = dados =>
    tx('atividades', 'readwrite', t => t.objectStore('atividades').add({ ...dados, concluida: false }));

  const atualizarAtividade = (id, dados) =>
    tx('atividades', 'readwrite', t => {
      const loja = t.objectStore('atividades');
      const req = loja.get(id);
      req.onsuccess = () => loja.put({ ...req.result, ...dados });
    });

  const gravarSegundo = (atividade, linha) =>
    tx('segundos', 'readwrite', t => t.objectStore('segundos').put({ atividade, ...linha }));

  const listarAtividades = () =>
    tx('atividades', 'readonly', t => t.objectStore('atividades').getAll())
      .then(lista => lista.sort((a, b) => b.id - a.id));

  const lerSegundos = atividade =>
    tx('segundos', 'readonly', t => t.objectStore('segundos')
      .getAll(IDBKeyRange.bound([atividade, -Infinity], [atividade, Infinity])));

  const apagarAtividade = atividade =>
    tx(['atividades', 'segundos'], 'readwrite', t => {
      t.objectStore('atividades').delete(atividade);
      t.objectStore('segundos').delete(IDBKeyRange.bound([atividade, -Infinity], [atividade, Infinity]));
    });

  // Treinos montados: { id, nome, blocos: [{ seg, min, max }], criado, alterado }.
  const salvarTreino = treino =>
    tx('treinos', 'readwrite', t => t.objectStore('treinos').put(treino));

  const listarTreinos = () =>
    tx('treinos', 'readonly', t => t.objectStore('treinos').getAll())
      .then(lista => lista.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')));

  const apagarTreino = id => tx('treinos', 'readwrite', t => t.objectStore('treinos').delete(id));

  // Uma linha por segundo, separada por vírgula, com cabeçalho.
  const paraCsv = linhas =>
    [COLUNAS.join(','), ...linhas.map(l => COLUNAS.map(c => l[c] ?? '').join(','))].join('\n');

  // Resumo calculado a partir das linhas gravadas (serve também para
  // atividades interrompidas, que não chegaram a ser encerradas).
  function resumir(linhas) {
    const n = linhas.length, ult = linhas[n - 1] || {};
    const fcs = linhas.map(l => l.fc_bpm).filter(x => typeof x === 'number');
    let subida = 0;
    for (let i = 1; i < n; i++) subida += Math.max(0, (linhas[i].altitude_m - linhas[i - 1].altitude_m) || 0);
    const comAlvo = linhas.filter(l => typeof l.alvo_min_w === 'number');
    const noAlvo = comAlvo.filter(l => l.potencia_w >= l.alvo_min_w && l.potencia_w <= l.alvo_max_w).length;
    return {
      tempo_s: ult.segundo || 0,
      distancia_m: ult.distancia_m || 0,
      subida_m: Math.round(subida),
      potencia_media_w: n ? Math.round(linhas.reduce((s, l) => s + l.potencia_w, 0) / n) : 0,
      potencia_max_w: Math.max(0, ...linhas.map(l => l.potencia_w)),
      fc_media_bpm: fcs.length ? Math.round(fcs.reduce((s, x) => s + x, 0) / fcs.length) : null,
      no_alvo_pct: comAlvo.length ? Math.round(noAlvo / comAlvo.length * 100) : null,
    };
  }

  const api = { COLUNAS, criarAtividade, atualizarAtividade, gravarSegundo, listarAtividades,
    lerSegundos, apagarAtividade, salvarTreino, listarTreinos, apagarTreino, paraCsv, resumir };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Historico = api;
})(this);
