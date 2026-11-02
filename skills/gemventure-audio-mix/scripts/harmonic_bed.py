"""Reduce estimated percussion in a stereo mix without claiming original stems."""
import argparse, json, pathlib, subprocess, sys
import numpy as np

def read_audio(path, rate=48000):
    raw=subprocess.run(['ffmpeg','-v','error','-i',str(path),'-ar',str(rate),'-ac','2','-f','f32le','pipe:1'],capture_output=True,check=True).stdout
    return np.frombuffer(raw,dtype='<f4').reshape(-1,2).copy()

def write_audio(path, audio, rate=48000):
    subprocess.run(['ffmpeg','-v','error','-y','-f','f32le','-ar',str(rate),'-ac','2','-i','pipe:0','-c:a','pcm_f32le',str(path)],input=np.asarray(audio,dtype='<f4').tobytes(),check=True)

def harmonic_bed(audio, rate=48000, percussion_floor=.22):
    from scipy import signal, ndimage
    _,_,z=signal.stft(audio.T,fs=rate,window='hann',nperseg=4096,noverlap=3584,boundary='zeros',padded=True)
    magnitude=np.sqrt(np.mean(np.abs(z)**2,axis=0))
    harmonic=ndimage.median_filter(magnitude,size=(1,31),mode='reflect')
    percussive=ndimage.median_filter(magnitude,size=(31,1),mode='reflect')
    mask=harmonic**2/(harmonic**2+(1.7*percussive)**2+1e-20)
    shared=percussion_floor+(1-percussion_floor)*mask
    _,out=signal.istft(z*shared[None,:,:],fs=rate,window='hann',nperseg=4096,noverlap=3584,boundary=True)
    return out.T[:len(audio)].astype(np.float32)

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('input',type=pathlib.Path);p.add_argument('output',type=pathlib.Path)
    p.add_argument('--deps-path',type=pathlib.Path);p.add_argument('--percussion-floor',type=float,default=.22)
    a=p.parse_args()
    if a.deps_path:sys.path.insert(0,str(a.deps_path.resolve()))
    if a.input.resolve()==a.output.resolve():p.error('Original must not be overwritten')
    if not 0<=a.percussion_floor<=1:p.error('Percussion floor must be in [0,1]')
    original=read_audio(a.input);out=harmonic_bed(original,percussion_floor=a.percussion_floor)
    if not np.isfinite(out).all():raise ValueError('Nonfinite output')
    a.output.parent.mkdir(parents=True,exist_ok=True);write_audio(a.output,out)
    print(json.dumps({'samples':len(out),'sampleRate':48000,'channels':2,'percussionFloor':a.percussion_floor,'semantics':'Estimated harmonic bed with residual percussion; shared stereo mask; not original stems'}))

if __name__=='__main__':main()
