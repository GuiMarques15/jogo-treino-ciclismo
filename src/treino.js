// Treinos montados pela pessoa: uma lista de blocos, cada um com duração e
// faixa de watts. Funções puras, testáveis fora do navegador.
(function (root) {
  // "5" = 5 min, "5:30" = 5 min 30 s, "1:05:00" = 1 h 5 min. Devolve segundos ou null.
  function lerDuracao(txt) {
    const partes = String(txt).trim().split(':');
    if (!partes[0] || partes.length > 3 || partes.some(p => !/^\d+$/.test(p))) return null;
    const n = partes.map(Number);
    if (n.length === 1) return n[0] * 60;
    if (n.length === 2) return n[0] * 60 + n[1];
    return n[0] * 3600 + n[1] * 60 + n[2];
  }

  function fmtDuracao(s) {
    const h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, ss = s % 60;
    return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(ss).padStart(2, '0');
  }

  // Lista de problemas do treino; vazia quando dá para salvar.
  function validar(treino) {
    const erros = [];
    if (!treino.nome || !treino.nome.trim()) erros.push('Dê um nome ao treino.');
    if (!treino.blocos.length) erros.push('Adicione pelo menos um bloco.');
    treino.blocos.forEach((b, i) => {
      const n = `Bloco ${i + 1}`;
      if (!b.seg || b.seg < 5) erros.push(`${n}: duração inválida (use mm:ss, mínimo 5 s).`);
      if (!(b.min > 0) || !(b.max > 0)) erros.push(`${n}: preencha os watts mínimo e máximo.`);
      else if (b.min > b.max) erros.push(`${n}: o mínimo passa do máximo.`);
      else if (b.max > 2000) erros.push(`${n}: watts acima de 2000.`);
    });
    return erros;
  }

  const duracaoTotal = treino => treino.blocos.reduce((s, b) => s + b.seg, 0);

  // Bloco em andamento no segundo `t` do treino (0 = início).
  function blocoEm(treino, t) {
    let ini = 0;
    for (let i = 0; i < treino.blocos.length; i++) {
      const b = treino.blocos[i];
      if (t < ini + b.seg) return { indice: i, bloco: b, inicio: ini, falta: ini + b.seg - t };
      ini += b.seg;
    }
    return null;
  }

  // Watts que o rolo segura em ERG: o meio da faixa.
  const alvoErg = b => Math.round((b.min + b.max) / 2);

  // -1 abaixo da faixa, 0 dentro, 1 acima.
  const naFaixa = (potencia, b) => (potencia < b.min ? -1 : potencia > b.max ? 1 : 0);

  const api = { lerDuracao, fmtDuracao, validar, duracaoTotal, blocoEm, alvoErg, naFaixa };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Treino = api;
})(this);
