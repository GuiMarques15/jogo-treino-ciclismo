// Leitura e comandos do Bluetooth FTMS (Fitness Machine Service) e do
// monitor cardíaco (Heart Rate Service). Funções puras, sem Web Bluetooth,
// para poderem ser reaproveitadas no app final e testadas fora do navegador.
(function (root) {
  const UUID = {
    ftmsService: 0x1826,
    indoorBikeData: 0x2ad2,
    controlPoint: 0x2ad9,
    machineStatus: 0x2ada,
    hrService: 0x180d,
    hrMeasurement: 0x2a37,
  };

  const OP = {
    requestControl: 0x00,
    reset: 0x01,
    setTargetPower: 0x05,
    startOrResume: 0x07,
    stopOrPause: 0x08,
    setSimulation: 0x11,
    response: 0x80,
  };

  const RESULT = {
    0x01: 'sucesso',
    0x02: 'comando não suportado',
    0x03: 'parâmetro inválido',
    0x04: 'falha na operação',
    0x05: 'controle não permitido',
  };

  // Indoor Bike Data (0x2AD2). Os campos presentes dependem dos bits de flags,
  // na ordem definida pela especificação FTMS v1.0.
  function parseIndoorBikeData(view) {
    const flags = view.getUint16(0, true);
    let o = 2;
    const out = {};
    // Bit 0 ("More Data") invertido: 0 significa que a velocidade está presente.
    if (!(flags & 0x0001)) { out.speedKmh = view.getUint16(o, true) / 100; o += 2; }
    if (flags & 0x0002) { out.avgSpeedKmh = view.getUint16(o, true) / 100; o += 2; }
    if (flags & 0x0004) { out.cadenceRpm = view.getUint16(o, true) / 2; o += 2; }
    if (flags & 0x0008) { out.avgCadenceRpm = view.getUint16(o, true) / 2; o += 2; }
    if (flags & 0x0010) {
      out.distanceM = view.getUint16(o, true) | (view.getUint8(o + 2) << 16);
      o += 3;
    }
    if (flags & 0x0020) { out.resistance = view.getInt16(o, true); o += 2; }
    if (flags & 0x0040) { out.powerW = view.getInt16(o, true); o += 2; }
    if (flags & 0x0080) { out.avgPowerW = view.getInt16(o, true); o += 2; }
    if (flags & 0x0100) {
      out.energyKcal = view.getUint16(o, true);
      o += 5; // total (2) + por hora (2) + por minuto (1)
    }
    if (flags & 0x0200) { out.heartRate = view.getUint8(o); o += 1; }
    if (flags & 0x0400) { o += 1; } // equivalente metabólico
    if (flags & 0x0800) { out.elapsedS = view.getUint16(o, true); o += 2; }
    if (flags & 0x1000) { out.remainingS = view.getUint16(o, true); o += 2; }
    return out;
  }

  // Heart Rate Measurement (0x2A37): bit 0 das flags diz se o valor é 8 ou 16 bits.
  function parseHeartRate(view) {
    const flags = view.getUint8(0);
    return flags & 0x01 ? view.getUint16(1, true) : view.getUint8(1);
  }

  // Resposta do Control Point: 0x80, opcode do pedido, código de resultado.
  function parseControlPointResponse(view) {
    if (view.byteLength < 3 || view.getUint8(0) !== OP.response) return null;
    const code = view.getUint8(2);
    return { requestOp: view.getUint8(1), code, ok: code === 0x01, text: RESULT[code] || `código ${code}` };
  }

  function cmdRequestControl() {
    return new Uint8Array([OP.requestControl]);
  }

  function cmdStart() {
    return new Uint8Array([OP.startOrResume]);
  }

  // Modo ERG: o trainer segura a potência alvo, independente da cadência.
  function cmdTargetPower(watts) {
    const b = new DataView(new ArrayBuffer(3));
    b.setUint8(0, OP.setTargetPower);
    b.setInt16(1, Math.round(watts), true);
    return new Uint8Array(b.buffer);
  }

  // Modo simulação: inclinação em %, vento em m/s, resistência ao rolamento
  // (crr) e coeficiente de arrasto (cw, kg/m) com valores típicos de estrada.
  function cmdSimulation({ gradePct, windMs = 0, crr = 0.004, cw = 0.51 }) {
    const b = new DataView(new ArrayBuffer(7));
    b.setUint8(0, OP.setSimulation);
    b.setInt16(1, Math.round(windMs * 1000), true);
    b.setInt16(3, Math.round(gradePct * 100), true);
    b.setUint8(5, Math.round(crr * 10000));
    b.setUint8(6, Math.round(cw * 100));
    return new Uint8Array(b.buffer);
  }

  const api = {
    UUID, OP, parseIndoorBikeData, parseHeartRate, parseControlPointResponse,
    cmdRequestControl, cmdStart, cmdTargetPower, cmdSimulation,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.FTMS = api;
})(this);
