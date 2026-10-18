"""Split vocals from a stereo track with the UVR MDX-Net Voc_FT model (onnx).
usage: python3 sep_vocals.py in.audio model.onnx vocals.wav inst.wav
"""
import sys, numpy as np, librosa, soundfile as sf, onnxruntime as ort

SR, NFFT, HOP, DIM_F, DIM_T, COMP = 44100, 6144, 1024, 3072, 256, 1.021
x, _ = librosa.load(sys.argv[1], sr=SR, mono=False)
if x.ndim == 1: x = np.stack([x, x])
sess = ort.InferenceSession(sys.argv[2])
chunk = HOP * (DIM_T - 1); trim = NFFT // 2; gen = chunk - 2 * trim
n = x.shape[1]; pad = gen - n % gen
mp = np.concatenate([np.zeros((2, trim)), x, np.zeros((2, pad)), np.zeros((2, trim))], 1).astype(np.float32)
out = []
for i in range(0, n + pad, gen):
    w = mp[:, i:i + chunk]
    S = np.stack([librosa.stft(w[c], n_fft=NFFT, hop_length=HOP, window='hann', center=True, pad_mode='reflect') for c in range(2)])
    S = S[:, :DIM_F, :DIM_T]
    inp = np.stack([S[0].real, S[0].imag, S[1].real, S[1].imag])[None].astype(np.float32)
    o = sess.run(None, {'input': inp})[0][0]
    V = np.zeros((2, NFFT // 2 + 1, DIM_T), np.complex64)
    V[0, :DIM_F] = o[0] + 1j * o[1]; V[1, :DIM_F] = o[2] + 1j * o[3]
    v = np.stack([librosa.istft(V[c], hop_length=HOP, window='hann', center=True, length=chunk) for c in range(2)])
    out.append(v[:, trim:-trim])
    print(i // gen, end=' ', flush=True)
voc = np.concatenate(out, 1)[:, :n] * COMP
sf.write(sys.argv[3], voc.T, SR, subtype='FLOAT')
sf.write(sys.argv[4], (x - voc).T, SR, subtype='FLOAT')
print('\ndone', n / SR)
