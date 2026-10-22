"""One-time archival of unpublished development-number notes; no data deletion."""
from pathlib import Path
root=Path(__file__).resolve().parents[1]
dest=(root/'docs/development-notes').resolve()
assert root.resolve() in dest.parents
dest.mkdir(parents=True,exist_ok=True)
for version in ['1.6.0','1.7.0','1.7.1','1.7.2','1.8.0','1.8.1']:
    source=(root/'releases'/f'v{version}.md').resolve()
    target=dest/f'development-{version}.md'
    if not source.exists():continue
    if target.exists():raise SystemExit(f'Archive target already exists: {target}')
    assert root.resolve() in source.parents
    source.rename(target)
    print(source.name,'->',target.relative_to(root))
