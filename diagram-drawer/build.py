from pathlib import Path
import json,re
p=Path(__file__).resolve().parent
version=json.loads((p.parent/'commutative-diagram-app/manifest.json').read_text(encoding='utf-8'))['version']
html=(p/'index.html').read_text(encoding='utf-8')
html=html.replace('<link rel="stylesheet" href="style.css">','<style>'+(p/'style.css').read_text(encoding='utf-8')+'</style>')
for name in ['mathjax.js','tikz-parser.js','acorn.js','snippets.js','arrow-geometry.js','app.js','snippet-ui.js','toolbar-shortcuts.js']:
    code=re.sub(r'</script',r'<\\/script',(p/name).read_text(encoding='utf-8'),flags=re.I)
    html=html.replace(f'<script src="{name}" defer></script>','')
    html=html.replace('</body>','<script>'+code+'</script></body>')
licenses=p.parent/'commutative-diagram-app/ui/licenses'
license_data={f.name:f.read_text(encoding='utf-8') for f in licenses.glob('*.txt')}
html=html.replace('</body>','<script type="application/json" id="third-party-licenses">'+json.dumps(license_data,ensure_ascii=False).replace('</','<\\/')+'</script></body>')
out=p.parent/'dist'
out.mkdir(exist_ok=True)
file=out/f'交换图画布-{version}.html'
file.write_text(html,encoding='utf-8')
print(file)
