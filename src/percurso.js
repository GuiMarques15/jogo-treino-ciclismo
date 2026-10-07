// Percursos: trechos com distância e inclinação, versões reduzidas e a física
// que transforma a potência da pessoa em velocidade no percurso. Funções puras,
// testáveis fora do navegador e reaproveitáveis no app final.
(function (root) {
  // Versão do percurso com a distância multiplicada por `fator`. As inclinações
  // ficam iguais, então a subida total encolhe na mesma proporção.
  function versao(rota, fator) {
    const trechos = rota.trechos.map(([m, inc]) => ({ m: m * fator, inc }));
    let ini = 0, alt = rota.elevacao_inicial;
    for (const t of trechos) {
      t.ini = ini;
      t.alt = alt;
      ini += t.m;
      alt += t.m * t.inc / 100;
    }
    const subida = trechos.reduce((s, t) => s + Math.max(0, t.m * t.inc / 100), 0);
    return { nome: rota.nome, fator, trechos, distancia: ini, subida };
  }

  // Trecho em que está quem já andou `dist` metros, e a altitude nesse ponto.
  function posicao(v, dist) {
    const ts = v.trechos;
    let lo = 0, hi = ts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (ts[mid].ini <= dist) lo = mid; else hi = mid - 1;
    }
    const t = ts[lo];
    const dentro = Math.min(Math.max(dist - t.ini, 0), t.m);
    return { indice: lo, inc: t.inc, alt: t.alt + dentro * t.inc / 100 };
  }

  const G = 9.81, RHO = 1.2, CDA = 0.32, CRR = 0.004, EFICIENCIA = 0.97;

  // Avança a velocidade (m/s) por `dt` segundos com a potência e a inclinação
  // atuais. Considera peso, rolamento, ar e embalo, então descidas aceleram
  // mesmo sem pedalar e subidas freiam.
  function avancar(vel, potencia, inc, massa, dt) {
    const ang = Math.atan(inc / 100);
    const passos = Math.max(1, Math.round(dt / 0.1));
    const h = dt / passos;
    let v = vel;
    for (let i = 0; i < passos; i++) {
      const forcaPedal = (Math.max(potencia, 0) * EFICIENCIA) / Math.max(v, 1);
      const resist = massa * G * (Math.sin(ang) + CRR * Math.cos(ang)) + 0.5 * RHO * CDA * v * v;
      v = Math.max(0, v + ((forcaPedal - resist) / massa) * h);
    }
    return v;
  }

  // Velocidade constante que uma potência sustenta numa inclinação (m/s).
  function velocidadeEstavel(potencia, inc, massa) {
    let v = 8;
    for (let i = 0; i < 400; i++) v = avancar(v, potencia, inc, massa, 1);
    return v;
  }

  const api = { versao, posicao, avancar, velocidadeEstavel };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Percurso = api;
})(this);
