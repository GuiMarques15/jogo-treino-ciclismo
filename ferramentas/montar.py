"""Gera o index.html (arquivo único) a partir de src/pagina.html, dos scripts em src/ e dos percursos em rotas/.

Uso: python3 ferramentas/montar.py
"""
import glob
import json
import pathlib

raiz = pathlib.Path(__file__).resolve().parent.parent
pagina = (raiz / 'src/pagina.html').read_text(encoding='utf-8')

for nome in ('ftms.js', 'percurso.js'):
    codigo = (raiz / 'src' / nome).read_text(encoding='utf-8')
    pagina = pagina.replace(f'<!-- MONTAR: src/{nome} -->', f'<script>\n// Gerado de src/{nome} por ferramentas/montar.py\n{codigo}</script>')

rotas = [json.loads(pathlib.Path(p).read_text(encoding='utf-8')) for p in sorted(glob.glob(str(raiz / 'rotas/*.json')))]
pagina = pagina.replace('<!-- MONTAR: rotas -->', f'<script>\n// Gerado de rotas/*.json por ferramentas/montar.py\nconst ROTAS = {json.dumps(rotas, ensure_ascii=False, separators=(",", ":"))};\n</script>')

(raiz / 'index.html').write_text(pagina, encoding='utf-8')
print('index.html gerado com', len(rotas), 'percurso(s)')
