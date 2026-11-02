"""Rasterize the project's own geometric SVG guides, without changing AI artwork."""
from pathlib import Path
import sys
root = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(root / 'asset-work' / 'python-deps'))
import pymupdf

folder = root / 'dist' / 'assets' / 'terrain-kit-v1'
for source in sorted(folder.glob('*.svg')):
    with pymupdf.open(source) as document:
        image = document[0].get_pixmap(alpha=True)
        image.save(source.with_suffix('.png'))
        print(f'{source.stem}: {image.width} x {image.height}')
