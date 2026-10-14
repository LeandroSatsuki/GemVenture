"""Export code-native SVG references to transparent PNGs; never modify game art."""
from pathlib import Path
import sys
root = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(root / 'asset-work/python-deps'))
import pymupdf
folder = root / 'dist/asset-reference'
count = 0
for file in folder.rglob('*.svg'):
    with pymupdf.open(file) as document:
        page = document[0]
        scale = 512 / max(page.rect.width, page.rect.height)
        page.get_pixmap(matrix=pymupdf.Matrix(scale, scale), alpha=True).save(file.with_suffix('.png'))
    count += 1
print(f'{count} transparent PNG references exported to {folder}')
