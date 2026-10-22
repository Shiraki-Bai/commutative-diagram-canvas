from pathlib import Path
import shutil, zipfile, json
root=Path(__file__).resolve().parent
app=root.parent/'commutative-diagram-app'
ui=app/'ui'
ui.mkdir(parents=True,exist_ok=True)
for name in ['style.css','app.js','tikz-parser.js','arrow-geometry.js','snippets.js','snippet-ui.js','toolbar-shortcuts.js','diagram-library.js','diagram-library-ui.js','acorn.js','mathjax.js']:
    shutil.copyfile(root/name,ui/name)
html=(root/'index.html').read_text(encoding='utf-8')
for name in ['app.js','snippet-ui.js','toolbar-shortcuts.js','diagram-library-ui.js']:
    html=html.replace(f'<script src="{name}" defer></script>','')
html=html.replace('</body>','<script type="module" src="boot.js"></script></body>')
(ui/'editor.html').write_text(html,encoding='utf-8')
version=json.loads((app/'manifest.json').read_text(encoding='utf-8'))['version']
dist=root.parent/'dist'
dist.mkdir(exist_ok=True)
output=dist/f'交换图画布-HanaApp-{version}.zip'
with zipfile.ZipFile(output,'w',zipfile.ZIP_DEFLATED) as z:
    for path in app.rglob('*'):
        if path.is_file():z.write(path,path.relative_to(app))
print(output)
