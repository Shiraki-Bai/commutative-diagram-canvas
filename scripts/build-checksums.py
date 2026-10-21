from pathlib import Path
import hashlib
root=Path(__file__).resolve().parents[1]
dist=root/'dist'
files=sorted([*dist.glob('*.html'),*dist.glob('*.zip')])
if len(files)!=2:raise SystemExit('Expected exactly one HTML and one Hana App ZIP; inspect dist before publishing.')
text=''.join(hashlib.sha256(p.read_bytes()).hexdigest()+'  '+p.name+'\n' for p in files)
(dist/'SHA256SUMS.txt').write_text(text,encoding='utf-8')
print(text)
