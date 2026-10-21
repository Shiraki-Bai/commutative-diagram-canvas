from pathlib import Path
import hashlib,json,shutil
root=Path(__file__).resolve().parents[1]
dist=root/'dist'
version=json.loads((root/'commutative-diagram-app/manifest.json').read_text(encoding='utf-8'))['version']
# GitHub normalizes non-ASCII release filenames. Publish stable ASCII aliases.
pairs=[(dist/f'交换图画布-{version}.html',dist/f'commutative-diagram-canvas-{version}.html'),(dist/f'交换图画布-HanaApp-{version}.zip',dist/f'commutative-diagram-canvas-HanaApp-{version}.zip')]
for source,target in pairs:shutil.copyfile(source,target)
text=''.join(hashlib.sha256(target.read_bytes()).hexdigest()+'  '+target.name+'\n' for _,target in pairs)
(dist/'SHA256SUMS.txt').write_text(text,encoding='utf-8')
print(text)
