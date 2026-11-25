# Озвучка серии 1 через NeuralBox TTS: голос Prince Nur, модель eleven_v4_turbo (5 токенов/символ), по строке на слот сцены.
#   python3 render/seriya/h01-gorod/ozvuchka.py   → golos/ng01/NN.mp3 + golos/ng01-golos.wav (собранная дорожка 40 с)
import json, re, subprocess, urllib.request, os
VOICE, MODEL = 'oKxkBkm5a8Bmrd1Whf2c', 'eleven_v4_turbo'
SET = {'stability': .45, 'similarity_boost': .8, 'style': .3, 'speed': 1.05, 'use_speaker_boost': True}
ROOT = os.path.dirname(os.path.abspath(__file__)) + '/../../..'
html = open(ROOT + '/render/seriya/h01-gorod/buldozer.html', encoding='utf-8').read()
lines = json.loads(re.search(r'const LINES=(\[.*?\]);', html).group(1).replace("'", '"'))
out = ROOT + '/golos/ng01'; os.makedirs(out, exist_ok=True); spent = 0
for i, (a, b, txt) in enumerate(lines):
    text = re.sub(r'<[^>]+>', '', txt).strip('… ').strip() + ('…' if txt.endswith('…') else '')
    f = f'{out}/{i:02d}.mp3'
    if not os.path.exists(f):
        body = json.dumps({'text': text, 'voice_id': VOICE, 'model_id': MODEL, 'language_code': 'ru', 'voice_settings': SET}).encode()
        r = json.load(urllib.request.urlopen(urllib.request.Request('https://neuralbox.ru/api/tts/generate', body, {'Content-Type': 'application/json'}), timeout=120))
        spent += r.get('tokens_spent', 0); urllib.request.urlretrieve(r['audio_url'], f)
    d = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]))
    print(f'{i:02d} [{a}-{b}] {d:.2f}s  {text}')
    lines[i].append(d)
# сборка: фразы подряд — каждая с начала своего слота или сразу после предыдущей; ускорение только если наезжает на следующий слот (до 1.2)
filt, inputs, prev, starts = [], [], 0, []
for i, (a, b, txt, d) in enumerate(lines):
    inputs += ['-i', f'{out}/{i:02d}.mp3']; st = max(a, prev + .08)
    nxt = lines[i + 1][0] + .4 if i + 1 < len(lines) else 39.95
    tempo = min(1.2, max(1, d / max(.5, nxt - st))); prev = st + d / tempo; starts.append(round(st, 2))
    filt.append(f'[{i}:a]atempo={tempo:.3f},adelay={int(st*1000)}|{int(st*1000)}[v{i}]')
print('старты фраз:', starts)
json.dump(starts, open(out + '/starts.json', 'w'))
mix = ''.join(f'[v{i}]' for i in range(len(lines)))
subprocess.run(['ffmpeg', '-v', 'error', '-y', *inputs, '-filter_complex', ';'.join(filt) + f';{mix}amix=inputs={len(lines)}:normalize=0,apad,atrim=0:40[a]', '-map', '[a]', '-ar', '44100', ROOT + '/golos/ng01-golos.wav'], check=True)
print('токенов потрачено:', spent)
