# ==== ЯЧЕЙКА 1: установка (T4 GPU) ====
!pip install -q f5-tts faster-whisper gradio soundfile
import torch; print("GPU:", torch.cuda.get_device_name(0) if torch.cuda.is_available() else "НЕТ — включи T4")

# ==== ЯЧЕЙКА 2: загрузка golos-dataset.zip, нарезка на фразы и расшифровка ====
import os, glob, zipfile, csv, numpy as np, soundfile as sf, librosa
from google.colab import files
up = files.upload()                                   # выбери golos-dataset.zip
zipfile.ZipFile(next(iter(up))).extractall("/content/src")
from importlib.resources import files as pkgfiles
DATA = os.path.abspath(str(pkgfiles("f5_tts").joinpath("../../data")))
RAW = "/content/mars_raw"; os.makedirs(f"{RAW}/wavs", exist_ok=True)
from faster_whisper import WhisperModel
asr = WhisperModel("large-v3", device="cuda", compute_type="float16")
rows, n = [], 0
for src in sorted(glob.glob("/content/src/**/*.wav", recursive=True)):
    y, sr = librosa.load(src, sr=24000, mono=True)
    iv = librosa.effects.split(y, top_db=35, frame_length=1024, hop_length=256)
    cur = None
    for a, b in iv:                                    # склеиваем фразы в куски 3–12 с
        if cur is None: cur = [a, b]
        elif (b - cur[0]) / sr <= 12 and (a - cur[1]) / sr < 0.8: cur[1] = b
        else:
            segs = cur; cur = [a, b]
            if (segs[1] - segs[0]) / sr >= 2.5:
                n += 1; p = f"{RAW}/wavs/c{n:04d}.wav"; sf.write(p, y[max(0,segs[0]-1200):segs[1]+2400], sr)
    if cur and (cur[1] - cur[0]) / sr >= 2.5:
        n += 1; p = f"{RAW}/wavs/c{n:04d}.wav"; sf.write(p, y[max(0,cur[0]-1200):cur[1]+2400], sr)
for p in sorted(glob.glob(f"{RAW}/wavs/*.wav")):
    segs, _ = asr.transcribe(p, language="ru", beam_size=5, vad_filter=False)
    t = " ".join(s.text.strip() for s in segs).strip()
    if len(t) > 3: rows.append((p, t))
with open(f"{RAW}/metadata.csv", "w", encoding="utf-8", newline="") as f:
    w = csv.writer(f, delimiter="|"); w.writerow(["audio_file", "text"]); w.writerows(rows)
print(f"фраз: {len(rows)}, всего ≈ {sum(sf.info(p).duration for p,_ in rows)/60:.1f} мин")
for p, t in rows[:5]: print(os.path.basename(p), "|", t)

# ==== ЯЧЕЙКА 3: подготовка и дообучение (~1–2 ч, вкладку не закрывать) ====
from huggingface_hub import snapshot_download
rep = snapshot_download("Misha24-10/F5-TTS_RUSSIAN", allow_patterns=["*.safetensors", "*.pt", "*.txt"])
ck = sorted(glob.glob(f"{rep}/**/*.safetensors", recursive=True) + glob.glob(f"{rep}/**/*.pt", recursive=True))
PRE = ([c for c in ck if "v1" in c.lower()] or ck)[-1]
VOCAB = (glob.glob(f"{rep}/**/vocab*.txt", recursive=True) or [""])[0]
print("старт от:", PRE, "\nсловарь:", VOCAB)
NAME = "mars_voice"; OUT = f"{DATA}/{NAME}_custom"
!python -m f5_tts.train.datasets.prepare_csv_wavs {RAW} {OUT}
!cp "{VOCAB}" "{OUT}/vocab.txt"
!f5-tts_finetune-cli --exp_name F5TTS_v1_Base --dataset_name {NAME} --finetune --pretrain "{PRE}" \
   --tokenizer custom --tokenizer_path "{OUT}/vocab.txt" --learning_rate 1e-5 \
   --batch_size_per_gpu 2400 --batch_size_type frame --max_samples 64 --grad_accumulation_steps 2 \
   --epochs 120 --num_warmup_updates 100 --save_per_updates 300 --last_per_updates 100 --keep_last_n_checkpoints 2

# ==== ЯЧЕЙКА 4: сохранить модель на Google Диск и озвучивать ====
from google.colab import drive; drive.mount("/content/drive")
CK = sorted(glob.glob(os.path.abspath(str(pkgfiles("f5_tts").joinpath(f"../../ckpts/{NAME}")))+"/*.pt"), key=os.path.getmtime)[-1]
!mkdir -p /content/drive/MyDrive/mars_voice && cp "{CK}" /content/drive/MyDrive/mars_voice/model_last.pt && cp "{VOCAB}" /content/drive/MyDrive/mars_voice/vocab.txt
print("сохранено на Диск:", CK)
from f5_tts.api import F5TTS
tts = F5TTS(model="F5TTS_v1_Base", ckpt_file="/content/drive/MyDrive/mars_voice/model_last.pt",
            vocab_file="/content/drive/MyDrive/mars_voice/vocab.txt", device="cuda")
# дальше — интерфейс из ячейки 2 прошлого блокнота (функции split_text / synth / gr.Blocks) без изменений
