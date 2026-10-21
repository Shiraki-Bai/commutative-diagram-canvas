"""Conservative source scan. Reports rule/path only; never prints matched secrets."""
from pathlib import Path
import re,sys
root=Path(__file__).resolve().parents[1]
patterns={
 'github-token':re.compile(r'gh[opusr]_[A-Za-z0-9]{20,}'),
 'github-fine-grained':re.compile(r'github_pat_[A-Za-z0-9_]{40,}'),
 'provider-key':re.compile(r'\bsk-(?:proj-)?[A-Za-z0-9_-]{24,}'),
 'private-key':re.compile(r'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----'),
 'credential-url':re.compile(r'https?://[^/\s:@]+:[^/\s@]+@'),
}
skip={'dist','.git','node_modules','__pycache__','.cache'}
issues=[];count=0
for path in root.rglob('*'):
 if not path.is_file():continue
 rel=path.relative_to(root)
 if any(part in skip or part.startswith(('test-profile','tex-test-','edge-test')) for part in rel.parts):continue
 if path.name.startswith('.env') and path.name!='.env.example':issues.append((str(rel),'environment-file'));continue
 if path.suffix.lower() in {'.pem','.p12','.pfx','.key'}:issues.append((str(rel),'credential-file'));continue
 if path.suffix.lower() not in {'.js','.cjs','.py','.json','.html','.css','.md','.txt','.svg'} and path.name!='.gitignore':continue
 text=path.read_text(encoding='utf-8',errors='replace');count+=1
 for label,pattern in patterns.items():
  if pattern.search(text):issues.append((str(rel),label))
if issues:
 for path,label in issues:print(f'CHECK REQUIRED: {path}: {label}')
 sys.exit(1)
print(f'PASS: scanned {count} source/document files; no configured secret signatures found. This is not proof against every possible secret.')
