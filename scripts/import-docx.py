"""Extrae sin reescribir el contenido; conserva metadatos existentes por número."""
import sys, zipfile, re, json, pathlib, xml.etree.ElementTree as E
root=pathlib.Path(__file__).resolve().parents[1]
source=pathlib.Path(sys.argv[1]); ns={'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
xml=E.fromstring(zipfile.ZipFile(source).read('word/document.xml'))
lines=[''.join(t.text or '' for t in p.findall('.//w:t',ns)) for p in xml.findall('.//w:p',ns)]
text='\n'.join(lines)
heads=list(re.finditer(r'^(\d+)\. PROMPT[^\n]*',text,re.M)); assert [int(m[1]) for m in heads]==list(range(1,31)), 'Se requieren 30 prompts consecutivos'
existing=json.loads((root/'data/prompts.json').read_text()) if (root/'data/prompts.json').exists() else []
result=[]
for i,m in enumerate(heads):
 end=heads[i+1].start() if i<29 else text.index('Flujo diario recomendado',m.end())
 item=next((p for p in existing if p['number']==i+1),{'id':str(i+1),'number':i+1})
 item.update(title=m[0].split('. ',1)[1],content=text[m.end():end].strip())
 result.append(item)
(root/'data/prompts.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
(root/'data/source.txt').write_text(text)
print('30 prompts extraídos íntegramente de',source.name)
