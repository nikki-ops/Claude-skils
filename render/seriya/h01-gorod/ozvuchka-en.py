# EN-озвучка ng01 (Comment Decides). Озвучка серии 1 через NeuralBox TTS: голос Prince Nur, модель eleven_v4_turbo (5 токенов/символ), по строке на слот сцены.
#   python3 render/seriya/h01-gorod/ozvuchka.py   → golos/ng01/NN.mp3 + golos/ng01-en-golos.wav (собранная дорожка 40 с)
import json, re, subprocess, urllib.request, os
VOICE, MODEL = 'oKxkBkm5a8Bmrd1Whf2c', 'eleven_v4_turbo'
SET = {'stability': .45, 'similarity_boost': .8, 'style': .3, 'speed': 1.05, 'use_speaker_boost': True}
ROOT = os.path.dirname(os.path.abspath(__file__)) + '/../../..'
html = open(ROOT + '/render/seriya/h01-gorod/buldozer-en.html', encoding='utf-8').read()
lines = json.loads(re.search(r'const LINES=(\[.*?\]);', html).group(1).replace("'", '"'))
out = ROOT + '/golos/ng01-en'; os.makedirs(out, exist_ok=True); spent = 0
for i, (a, b, txt) in enumerate(lines):
    text = re.sub(r'<[^>]+>', '', txt).strip('… ').strip() + ('…' if txt.endswith('…') else '')
    f = f'{out}/{i:02d}.mp3'
    if not os.path.exists(f):
        body = json.dumps({'text': text, 'voice_id': VOICE, 'model_id': MODEL, 'language_code': 'en', 'voice_settings': SET}).encode()
        r = json.load(urllib.request.urlopen(urllib.request.Request('https://neuralbox.ru/api/tts/generate', body, {'Content-Type': 'application/json'}), timeout=120))
        spent += r.get('tokens_spent', 0); urllib.request.urlretrieve(r['audio_url'], f)
    d = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]))
    print(f'{i:02d} [{a}-{b}] {d:.2f}s  {text}')
    lines[i].append(d)
# сборка: фразы подряд с паузой GAP — кадр не висит после слов. warp.json: [видео_с, видео_по, сцена_с, сцена_по] на каждую фразу.
GAP = .2
SLOTS = [(0,2),(2,5),(5,9),(9,13),(13,17),(17,21),(21,25),(25,29),(29,33),(33,37),(37,40)]
filt, inputs, v, warp = [], [], .05, []
for i, (a, b, txt, d) in enumerate(lines):
    inputs += ['-i', f'{out}/{i:02d}.mp3']
    filt.append(f'[{i}:a]adelay={int(v*1000)}|{int(v*1000)}[v{i}]')
    v0 = 0 if i == 0 else v; v1 = v + d + GAP; warp.append([round(v0, 3), round(v1, 3), SLOTS[i][0], SLOTS[i][1]]); v = v1
TOTAL = round(v, 3)
json.dump({'warp': warp, 'dur': TOTAL}, open(out + '/warp.json', 'w'))
print('длительность ролика:', TOTAL)
mix = ''.join(f'[v{i}]' for i in range(len(lines)))
subprocess.run(['ffmpeg', '-v', 'error', '-y', *inputs, '-filter_complex', ';'.join(filt) + f';{mix}amix=inputs={len(lines)}:normalize=0,apad,atrim=0:'+str(TOTAL)+'[a]', '-map', '[a]', '-ar', '44100', ROOT + '/golos/ng01-en-golos.wav'], check=True)
print('токенов потрачено:', spent)
