# Озвучка «Район башни» через NeuralBox TTS: голос «Кастом мой», eleven_v4_turbo (5 токенов/символ), по фразе на слот сцены.
#   python3 render/seriya/rb01-rayon-bashni/ozvuchka.py → golos/rb01/NN.mp3, golos/rb01/warp.json, golos/rb01-rayon-bashni.mp3
import json, re, subprocess, urllib.request, os
VOICE, MODEL = '4pgVbj4UhrQBWoRhHv9g', 'eleven_v4_turbo'
SET = {'stability': .45, 'similarity_boost': .8, 'style': .3, 'speed': 1.05, 'use_speaker_boost': True}
ROOT = os.path.dirname(os.path.abspath(__file__)) + '/../../..'
html = open(ROOT + '/render/seriya/rb01-rayon-bashni/scene.html', encoding='utf-8').read()
lines = json.loads(re.search(r'const LINES=(\[.*?\]);', html).group(1).replace("'", '"'))
out = ROOT + '/golos/rb01'; os.makedirs(out, exist_ok=True); spent = 0
for i, (a, b, txt) in enumerate(lines):
    text = re.sub(r'<[^>]+>', '', txt).replace('…', '').strip()
    f = f'{out}/{i:02d}.mp3'
    if not os.path.exists(f):
        body = json.dumps({'text': text, 'voice_id': VOICE, 'model_id': MODEL, 'language_code': 'ru', 'voice_settings': SET}).encode()
        r = json.load(urllib.request.urlopen(urllib.request.Request('https://neuralbox.ru/api/tts/generate', body, {'Content-Type': 'application/json'}), timeout=120))
        spent += r.get('tokens_spent', 0); urllib.request.urlretrieve(r['audio_url'], f)
    t = f'{out}/t{i:02d}.wav'  # без тишины по краям — паузы между фразами задаёт GAP
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f, '-af', 'areverse,silenceremove=start_periods=1:start_threshold=-40dB,areverse,silenceremove=start_periods=1:start_threshold=-40dB', '-ar', '44100', t], check=True)
    d = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', t]))
    print(f'{i:02d} [{a}-{b}] {d:.2f}s  {text}'); lines[i].append(d)
GAP, filt, inputs, v, warp = .15, [], [], .05, []
for i, (a, b, txt, d) in enumerate(lines):
    inputs += ['-i', f'{out}/t{i:02d}.wav']; filt.append(f'[{i}:a]adelay={int(v*1000)}|{int(v*1000)}[v{i}]')
    v0 = 0 if i == 0 else v; v1 = v + d + GAP; warp.append([round(v0, 3), round(v1, 3), a, b]); v = v1
TOTAL = round(v, 3); json.dump({'warp': warp, 'dur': TOTAL}, open(out + '/warp.json', 'w')); print('длительность ролика:', TOTAL)
mix = ''.join(f'[v{i}]' for i in range(len(lines)))
subprocess.run(['ffmpeg', '-v', 'error', '-y', *inputs, '-filter_complex', ';'.join(filt) + f';{mix}amix=inputs={len(lines)}:normalize=0,apad,atrim=0:{TOTAL}[a]', '-map', '[a]', '-ar', '44100', '-b:a', '192k', ROOT + '/golos/rb01-rayon-bashni.mp3'], check=True)
print('токенов потрачено:', spent)
