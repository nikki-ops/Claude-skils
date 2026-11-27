# Озвучка «Купол треснул»: голос MARS CITY «Кастом мой» (ElevenLabs eleven_v4_turbo через NeuralBox), по фразе на сцену.
#   python3 render/seriya/kupol-01/ozvuchka.py → golos/kupol-01/NN.mp3, golos/kupol-01.wav, golos/kupol-01/tayming.json (фразы + слова)
# Слова: начало/конец фразы — по тишине, внутри — по паузам «...» (silencedetect) и длине слов.
import json, subprocess, urllib.request, os, re
VOICE, MODEL = '4pgVbj4UhrQBWoRhHv9g', 'eleven_v4_turbo'
SET = {'stability': .42, 'similarity_boost': .75, 'style': .2, 'speed': 1.02, 'use_speaker_boost': True}
ROOT = os.path.dirname(os.path.abspath(__file__)) + '/../../..'
# «Купол треснул» (серия 1): скорость 1.11, без «...» в первых трёх фразах. [мин. начало, текст, скорость]; начало = max(мин, конец предыдущей + 0.1)
LINES = [[0.3, 'Купол над городом треснул.', 1.11],
         [0.0, 'Буря затягивает дома в космос.', 1.11],
         [0.0, 'Один. Два. Пять домов уже улетели.', 1.11],
         [8.0, 'Каждый лайк — заплатка на купол.', 1.11],
         [11.0, 'Пиши «Держу купол» и свой ник — твой дом получит якорь.', 1.11],
         [17.6, 'Если до завтра не наберём триста лайков — улетит весь город.', 1.11],
         [0.25, 'Чей дом следующий?', 1.11]]
out = ROOT + '/golos/kupol-01'; os.makedirs(out, exist_ok=True); spent = 0; prev = 0; ins = []; filt = []; phr = []; words = []
def dur(f): return float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]))
for i, (want, text, spd) in enumerate(LINES):
    f = f'{out}/{i:02d}.mp3'
    if not os.path.exists(f):
        j = f + '.json'
        if not os.path.exists(j):
            body = json.dumps({'text': text, 'voice_id': VOICE, 'model_id': MODEL, 'language_code': 'ru', 'voice_settings': dict(SET, speed=spd)}).encode()
            r = json.load(urllib.request.urlopen(urllib.request.Request('https://neuralbox.ru/api/tts/generate', body, {'Content-Type': 'application/json'}), timeout=120))
            spent += int(r.get('tokens_spent', 0)); json.dump(r, open(j, 'w'))
        r = json.load(open(j))
        subprocess.run(['curl', '-sS', '--retry', '6', '--retry-all-errors', '--retry-delay', '3', '-m', '90', '-o', f, r['audio_url']], check=True)
    t = f'{out}/t{i:02d}.wav'
    # обрезка тишины по краям, длинные паузы внутри → 0.2 с, первые три фразы чуть быстрее (atempo, тон не меняется)
    af = 'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=stop_periods=-1:stop_duration=0.24:stop_threshold=-42dB:stop_silence=0.2'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f, '-af', af, '-ar', '44100', t], check=True)
    d = dur(t)
    st = want if i == 0 else (prev + want if i == len(LINES) - 1 else max(want, prev + .1))
    prev = st + d; phr.append([round(st, 3), round(d, 3), text])
    # паузы внутри фразы → куски; слова раскладываем по кускам пропорционально длине
    sd = subprocess.run(['ffmpeg', '-i', t, '-af', 'silencedetect=n=-38dB:d=0.18', '-f', 'null', '-'], capture_output=True, text=True).stderr
    ss = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', sd)]; se = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', sd)]
    spans = []; a = 0
    for s0, s1 in zip(ss, se):
        if s0 > a + .05: spans.append([a, s0])
        a = s1
    if d > a + .05: spans.append([a, d])
    parts = [p.strip() for p in re.split(r'\.\.\.|…', text) if p.strip()]
    w_all = [p.split() for p in parts]
    if len(spans) != len(parts):  # не совпало — одна группа на всю фразу
        spans = [[spans[0][0] if spans else 0, spans[-1][1] if spans else d]]; w_all = [sum(w_all, [])]
    for (a, b), ws in zip(spans, w_all):
        L = [len(re.sub(r'[^\wё]', '', w, flags=re.I)) + 1 for w in ws]; tot = sum(L); x = a
        for w, l in zip(ws, L):
            y = x + (b - a) * l / tot; words.append([round(st + x, 3), round(st + y, 3), w]); x = y
    ins += ['-i', t]; filt.append(f'[{i}]adelay={int(st*1000)}|{int(st*1000)}[a{i}]')
    print(f'{i} старт {st:.2f} длина {d:.2f} кусков {len(spans)}  {text}')
DUR = round(prev + .45, 2)
subprocess.run(['ffmpeg', '-v', 'error', '-y', *ins, '-filter_complex', ';'.join(filt) + ';' + ''.join(f'[a{i}]' for i in range(len(LINES))) + f'amix=inputs={len(LINES)}:normalize=0,apad,atrim=0:{DUR}[a]', '-map', '[a]', '-ac', '2', '-ar', '44100', ROOT + '/golos/kupol-01.wav'], check=True)
json.dump({'phrases': phr, 'words': words, 'dur': DUR}, open(out + '/tayming.json', 'w'), ensure_ascii=False)
print('токенов', spent)
