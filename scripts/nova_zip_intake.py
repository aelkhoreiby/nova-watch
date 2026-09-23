#!/usr/bin/env python3
from __future__ import annotations
import hashlib, json, os, tempfile, zipfile, subprocess, shutil
from pathlib import Path
from collections import Counter

IMAGE_EXT={".jpg",".jpeg",".png",".webp",".avif",".gif"}
VIDEO_EXT={".mp4",".mov",".m4v",".avi",".mkv",".webm"}
DOC_EXT={".pdf",".doc",".docx",".txt",".rtf"}
SHEET_EXT={".csv",".xlsx",".xls"}
ARCHIVE_EXT={".zip",".rar",".7z"}

def sha256(p: Path):
    h=hashlib.sha256()
    with p.open("rb") as f:
        for b in iter(lambda:f.read(1024*1024),b""): h.update(b)
    return h.hexdigest()

def classify(p: Path):
    e=p.suffix.lower()
    if e in IMAGE_EXT:return "image"
    if e in VIDEO_EXT:return "video"
    if e in DOC_EXT:return "document"
    if e in SHEET_EXT:return "spreadsheet"
    if e in ARCHIVE_EXT:return "archive"
    return "other"

def inspect_video(actual: Path):
    ffprobe=shutil.which("ffprobe")
    if ffprobe:
        try:
            raw=subprocess.check_output([ffprobe,"-v","error","-show_entries","format=duration,size:stream=width,height,r_frame_rate,codec_name","-of","json",str(actual)],text=True,timeout=20)
            return {"method":"ffprobe","data":json.loads(raw)}
        except Exception as e:
            return {"inspection_error":str(e)}
    try:
        import imageio_ffmpeg
        ffmpeg=imageio_ffmpeg.get_ffmpeg_exe()
        proc=subprocess.run([ffmpeg,"-hide_banner","-i",str(actual)],capture_output=True,text=True,timeout=20)
        text=proc.stderr
        result={"method":"ffmpeg-fallback","raw_probe":text[-4000:]}
        return result
    except Exception as e:
        return {"inspection_error":str(e),"inspection_note":"ffprobe and imageio-ffmpeg unavailable"}

def main():
    inbox=Path(os.environ.get("NOVA_PRODUCT_INBOX","")).expanduser()
    if not inbox: inbox=Path.home()/"Desktop"/"NOVA Products"
    zips=sorted(p for p in inbox.iterdir() if p.is_file() and p.suffix.lower()==".zip")
    out=Path("product-queue")/"intake-report.json"
    out.parent.mkdir(parents=True,exist_ok=True)
    report={"status":"no-zip","inbox":str(inbox),"archives":[]}
    if not zips:
        out.write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding="utf-8"); print("No ZIP found:",inbox); return
    report["status"]="analyzed"
    for z in zips:
        item={"file":z.name,"size_bytes":z.stat().st_size,"sha256":sha256(z),"entries":[]}
        with tempfile.TemporaryDirectory(prefix="nova-intake-") as td:
            extract_dir=Path(td)
            with zipfile.ZipFile(z) as zz:
                infos=[i for i in zz.infolist() if not i.is_dir()]
                zz.extractall(extract_dir)
            counts=Counter()
            for i in infos:
                p=Path(i.filename); typ=classify(p); counts[typ]+=1
                entry={"path":i.filename,"size_bytes":i.file_size,"type":typ}
                actual=extract_dir/p
                if typ=="image":
                    try:
                        from PIL import Image
                        with Image.open(actual) as im:
                            entry["width"],entry["height"]=im.size
                            entry["format"],entry["mode"]=im.format,im.mode
                    except Exception as e: entry["inspection_error"]=str(e)
                elif typ=="video":
                    entry.update(inspect_video(actual))
                item["entries"].append(entry)
            item["entry_count"]=len(infos)
            item["types"]=dict(counts)
            item["product_candidates"]=sorted({str(Path(i.filename).parts[0]) for i in infos if len(Path(i.filename).parts)>1})
            item["content_inspection"]="extracted_and_metadata_inspected"
        report["archives"].append(item)
        print(f"ZIP: {z.name} | {len(item['entries'])} files | {dict(item['types'])}")
    out.write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding="utf-8")
    print("Wrote",out)

if __name__=="__main__": main()
