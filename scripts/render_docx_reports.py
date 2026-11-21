"""CI-only report layout evidence using an ephemeral Linux document renderer.

The desktop's bundled renderer is unavailable on Windows without LibreOffice.
This runs conversion on the disposable CI runner, never on the owner's desktop.
No account data or production credentials are used.
"""
from pathlib import Path
import subprocess
import tempfile
import re

root=Path(__file__).resolve().parents[1]
reports=sorted((root/'docs/reports').glob('SPRINT_*_REPORT_FA.docx'))
if not reports:
    raise SystemExit('No versioned delivery reports found')
for report in reports:
    out=root/'document-results'/report.stem
    out.mkdir(parents=True,exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='sdd-report-lo-') as profile:
        subprocess.run(['libreoffice','-env:UserInstallation='+Path(profile).as_uri(),'--headless','--convert-to','pdf','--outdir',str(out),str(report)],check=True,timeout=90)
    pdf=out/(report.stem+'.pdf')
    if not pdf.exists() or not pdf.stat().st_size:
        raise SystemExit('Report conversion produced no PDF: '+report.name)
    info=subprocess.check_output(['pdfinfo',str(pdf)],text=True)
    count=int(re.search(r'Pages:\s+(\d+)',info).group(1))
    if count<2 or count>4:
        raise SystemExit('Unexpected report pagination: '+str(count))
    subprocess.run(['pdftoppm','-r','120','-png',str(pdf),str(out/'page')],check=True,timeout=90)
    if len(list(out.glob('page-*.png')))!=count:
        raise SystemExit('Missing rendered report pages')
    print(report.name+': '+str(count)+' pages rendered for visual inspection')
