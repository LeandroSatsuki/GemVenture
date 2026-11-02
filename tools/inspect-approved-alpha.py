"""Read original PNG alpha, hash and bounds; render inspection backgrounds only."""
from pathlib import Path
from PIL import Image, ImageOps, ImageDraw
import hashlib, json

root = Path(__file__).resolve().parent.parent
manifest = json.loads(Path('E:/assets GemVenture/production/approved-art-v1/manifest.json').read_text(encoding='utf-8'))
entries = []
for spec in manifest['entries']:
    source = Path(spec['source'])
    im = Image.open(source).convert('RGBA')
    a = im.getchannel('A')
    hist = a.histogram()
    bbox = a.point(lambda x: 255 if x > 24 else 0).getbbox()
    digest = hashlib.sha256(source.read_bytes()).hexdigest()
    if digest != spec['sha256'] or list(im.size) != spec['size'] or list(bbox) != spec['bbox'] or not hist[0]:
        raise ValueError('Source/alpha mismatch: ' + spec['id'])
    entries.append(dict(id=spec['id'], sha256=digest, bbox=list(bbox), zeroAlpha=hist[0], alphaRange=a.getextrema()))
    if spec['id'] == 'boss-b6':
        proof = Image.new('RGB', (1100, 600), '#353658')
        for i, color in enumerate(['#ffffff', '#180d2f']):
            panel = Image.new('RGBA', (550, 560), color)
            preview = ImageOps.contain(im, (530, 530), Image.Resampling.LANCZOS)
            panel.alpha_composite(preview, ((550-preview.width)//2, (560-preview.height)//2))
            proof.paste(panel.convert('RGB'), (i*550, 40))
        ImageDraw.Draw(proof).text((20, 12), 'Original source: real alpha, white / dark backgrounds; no modification of sprite', fill='white')
        proof.save(root/'docs/art/approved-mole-alpha-check.png')
report = dict(checked=len(entries), sourceManifest='E:/assets GemVenture/production/approved-art-v1/manifest.json', entries=entries)
(root/'docs/art/approved-alpha-audit.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
print(json.dumps(dict(checked=len(entries), allHaveRealAlpha=True, hashesVerified=True, proof='docs/art/approved-mole-alpha-check.png')))
