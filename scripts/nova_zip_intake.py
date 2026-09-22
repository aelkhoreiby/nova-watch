#!/usr/bin/env python3
from __future__ import annotations
import hashlib, json, os, tempfile, zipfile
from pathlib import Path
from collections import Counter

IMAGE_EXT = {".jpg",".jpeg",".png",".webp",".avif",".gif"}
VIDEO_EXT = {".mp4",".mov",".m4v",".avi",".mkv",".webm"}
DOC_EXT = {".pdf",".doc",".docx",".txt",".rtf"}
SHEET_EXT = {".csv",".xlsx",".xls"}
ARCHIVE_EXT = {".zip",".rar",".7z"}

def sha256(p: Path):
    h=hashlib.sha256()
    with p.open("rb") as f:
        for b in iter(lambda:f.read(1024*1024), b""): h.update(b)
    return h.hexdigest()

def classify(p: Path):
    e=p.suffix.lower()
    if e in IMAGE_EXT:return "image"
    if e in VIDEO_EXT:return "video"
    if e in DOC_EXT:return "document"
    if e in SHEET_EXT:return "spreadsheet"
    if e in ARCHIVE_EXT:return "archive"
    return "other"

def main():
    inbox=Path(os.environ.get("NOVA_PRODUCT_INBOX","")).expanduser()
    if not inbox:
        inbox=Path.home()/"Desktop"/"NOVA Products"
    zips=sorted(p for p in inbox.iterdir() if p.is_file() and p.suffix.lower()==".zip")
    out=Path("product-queue")/"intake-report.json"
    out.parent.mkdir(parents=True,exist_ok=True)
    report={"status":"no-zip","inbox":str(inbox),"archives":[]}
    if not zips:
        out.write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding="utf-8")
        print("No ZIP found:",inbox); return
    report["status"]="analyzed"
    for z in zips:
        item={"file":z.name,"size_bytes":z.stat().st_size,"sha256":sha256(z),"entries":[]}
        with zipfile.ZipFile(z) as zz:
            infos=[i for i in zz.infolist() if not i.is_dir()]
            counts=Counter()
            for i in infos:
                p=Path(i.filename)
                typ=classify(p); counts[typ]+=1
                item["entries"].append({"path":i.filename,"size_bytes":i.file_size,"type":typ})
            item["entry_count"]=len(infos)
            item["types"]=dict(counts)
            item["product_candidates"]=sorted({str(Path(i.filename).parts[0]) for i in infos if len(Path(i.filename).parts)>1})
        report["archives"].append(item)
        print(f"ZIP: {z.name} | {len(item['entries'])} files | {dict(item['types'])}")
    out.write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding="utf-8")
    print("Wrote",out)

if __name__=="__main__": main()
