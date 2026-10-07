"""Converte um arquivo GPX em percurso do jogo: trechos de distância fixa com inclinação.

Uso: python3 ferramentas/gpx_para_rota.py rotas/arquivo.gpx rotas/arquivo.json "Nome do percurso"
"""
import bisect
import json
import math
import sys
import xml.etree.ElementTree as ET

PASSO_M = 100  # tamanho de cada trecho, em metros
INC_MAX = 20   # inclinações acima disso (em módulo) costumam ser erro de GPS


def distancia(a, b):
    r = 6371000
    p1, p2 = math.radians(a[0]), math.radians(b[0])
    dp, dl = p2 - p1, math.radians(b[1] - a[1])
    h = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * r * math.asin(math.sqrt(h))


def converter(caminho_gpx, nome):
    ns = {'g': 'http://www.topografix.com/GPX/1/1'}
    raiz = ET.parse(caminho_gpx).getroot()
    pts = [(float(p.get('lat')), float(p.get('lon')), float(p.find('g:ele', ns).text))
           for p in raiz.iterfind('.//g:trkpt', ns)]
    acum = [0.0]
    for a, b in zip(pts, pts[1:]):
        acum.append(acum[-1] + distancia(a, b))
    elev = [p[2] for p in pts]
    total = acum[-1]

    def elev_em(x):
        i = bisect.bisect_right(acum, x)
        if i <= 0:
            return elev[0]
        if i >= len(acum):
            return elev[-1]
        f = (x - acum[i - 1]) / ((acum[i] - acum[i - 1]) or 1)
        return elev[i - 1] + f * (elev[i] - elev[i - 1])

    xs = [i * PASSO_M for i in range(int(total // PASSO_M) + 1)]
    if xs[-1] < total:
        xs.append(total)
    es = [elev_em(x) for x in xs]
    # Média móvel de 3 pontos para tirar o ruído de altitude do GPS.
    suave = [sum(es[max(0, i - 1):i + 2]) / len(es[max(0, i - 1):i + 2]) for i in range(len(es))]
    trechos = []
    for i in range(1, len(xs)):
        m = xs[i] - xs[i - 1]
        inc = (suave[i] - suave[i - 1]) / m * 100 if m else 0
        trechos.append([round(m, 1), round(max(-INC_MAX, min(INC_MAX, inc)), 1) + 0.0])  # + 0.0 evita "-0"
    return {'nome': nome, 'distancia_m': round(total), 'elevacao_inicial': round(suave[0], 1), 'trechos': trechos}


if __name__ == '__main__':
    rota = converter(sys.argv[1], sys.argv[3])
    with open(sys.argv[2], 'w', encoding='utf-8') as f:
        json.dump(rota, f, ensure_ascii=False, separators=(',', ':'))
    subida = sum(max(0, m * i / 100) for m, i in rota['trechos'])
    print(f"{rota['nome']}: {rota['distancia_m'] / 1000:.1f} km, {round(subida)} m de subida, {len(rota['trechos'])} trechos")
