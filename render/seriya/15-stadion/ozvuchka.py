# Озвучка «Стадион» через NeuralBox TTS (голос «Кастом мой», eleven_v4_turbo), по фразе на слот сцены, тишина по краям обрезана.
#   python3 render/seriya/15-stadion/ozvuchka.py → golos/15-stadion/NN.mp3, golos/15-stadion.mp3, печатает начала фраз
import json, subprocess, urllib.request, os, sys
VOICE, MODEL = '4pgVbj4UhrQBWoRhHv9g', 'eleven_v4_turbo'
SET = {'stability': .42, 'similarity_boost': .8, 'style': .35, 'speed': 1.08, 'use_speaker_boost': True}
ROOT = os.path.dirname(os.path.abspath(__file__)) + '/../../..'
# [начало слота, текст] — структура хита «1 лайк = 1 этаж»; первая фраза — хвост последней (петля)
LINES = [[0, '…будет твоим!'], [1.4, 'Каждый лайк — один болельщик.'], [3.5, 'На каждом месте — ник подписчика.'],
         [5.8, 'Быстрее… быстрее… ещё быстрее!'], [8.9, 'Стоп…'], [9.7, 'В VIP-ложе кто-то сидит…'], [11.45, 'Пиши ник — и это место']]
out = ROOT + '/golos/15-stadion'; os.makedirs(out, exist_ok=True); spent = 0; prev = 0; starts = []; ins = []; filt = []
for i, (slot, text) in enumerate(LINES):
    f = f'{out}/{i:02d}.mp3'
    if not os.path.exists(f):
        j = f + '.json'  # ответ API храним, чтобы при обрыве скачивания не платить повторно
        if not os.path.exists(j):
            body = json.dumps({'text': text, 'voice_id': VOICE, 'model_id': MODEL, 'language_code': 'ru', 'voice_settings': SET}).encode()
            r = json.load(urllib.request.urlopen(urllib.request.Request('https://neuralbox.ru/api/tts/generate', body, {'Content-Type': 'application/json'}), timeout=120))
            spent += r.get('tokens_spent', 0); json.dump(r, open(j, 'w'))
        r = json.load(open(j))
        subprocess.run(['curl', '-sS', '--retry', '6', '--retry-all-errors', '--retry-delay', '3', '-m', '90', '-o', f, r['audio_url']], check=True)
    t = f'{out}/t{i:02d}.wav'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f, '-af', 'areverse,silenceremove=start_periods=1:start_threshold=-40dB,areverse,silenceremove=start_periods=1:start_threshold=-40dB', '-ar', '44100', t], check=True)
    d = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', t]))
    st = max(slot, prev + .12) if i else 0; prev = st + d; starts.append(round(st, 2))
    ins += ['-i', t]; filt.append(f'[{i}]adelay={int(st*1000)}|{int(st*1000)}[a{i}]')
    print(f'{i} старт {st:.2f} длина {d:.2f}  {text}')
TOTAL = round(prev + .08, 2)
subprocess.run(['ffmpeg', '-v', 'error', '-y', *ins, '-filter_complex', ';'.join(filt) + ';' + ''.join(f'[a{i}]' for i in range(len(LINES))) + f'amix=inputs={len(LINES)}:normalize=0,apad,atrim=0:{TOTAL}[a]', '-map', '[a]', '-ac', '2', '-ar', '44100', '-b:a', '192k', ROOT + '/golos/15-stadion.mp3'], check=True)
json.dump({'starts': starts, 'total': TOTAL}, open(out + '/tayming.json', 'w'))
print('итого', TOTAL, 'с; токенов', spent)
