import React from 'react';
import { AbsoluteFill } from 'remotion';
import Peep from 'react-peeps';

const B: React.FC<{ body: string; face: string; hair: string; acc?: string }> = ({ body, face, hair, acc = 'None' }) => (
  <div style={{ width: 300, height: 340, border: '1px dashed #444' }}>
    <Peep style={{ width: 300, height: 340 }} body={body as any} face={face as any} hair={hair as any} accessory={acc as any} facialHair={'None' as any}
      strokeColor="#1b1714" backgroundColor="#efe6d0" viewBox={{ x: '-100', y: '0', width: '1300', height: '1480' }} />
    <div style={{ color: '#aaa', fontSize: 18, textAlign: 'center' }}>{body} · {face} · {hair}</div>
  </div>
);
const S: React.FC<{ body: string; face: string; hair: string; acc?: string; fh?: string; kind?: string }> = ({ body, face, hair, acc = 'None', fh = 'None', kind = 'stand' }) => {
  const stand = kind === 'stand';
  return (
  <div style={{ width: 230, height: 470, border: '1px dashed #444' }}>
    <Peep style={{ width: 230, height: stand ? 420 : 230, marginTop: stand ? 0 : 150 }} body={body as any} face={face as any} hair={hair as any} accessory={acc as any} facialHair={fh as any}
      strokeColor="#1b1714" backgroundColor="#efe6d0" viewBox={stand ? { x: '-200', y: '0', width: '1700', height: '3050' } : { x: '-100', y: '0', width: '1300', height: '1300' }} />
    <div style={{ color: '#aaa', fontSize: 13, textAlign: 'center', marginTop: stand ? 0 : 40 }}>{body}·{face}·{hair}·{fh}</div>
  </div>);
};
const L: [string,string,string,string,string,string][] = [
 ['Sweater','Smile','Bun','None','None','bust'],['Sweater','OldAged','GrayBun','None','None','bust'],['ButtonShirt','Smile','MediumShort','None','None','bust'],['ButtonShirt','Calm','GrayMedium','GlassRound','None','bust'],
 ['PoloSweater','Smile','Short','None','MoustacheThin','bust'],['PoloSweater','OldAged','GrayShort','GlassRoundThick','None','bust'],['ButtonShirt','Calm','BaldTop','GlassRoundThick','GrayFull','bust'],['Shirt','Smile','GrayShort','None','Chin','bust'],
 ['RestingWB','Smile','GrayBun','None','None','stand'],['EasingBW','Smile','Bun','None','None','stand'],['ShirtPantsWB','Calm','GrayShort','GlassRoundThick','None','stand'],['CrossedArmsWB','Smile','Short','None','MoustacheThin','stand'],
 ['Device','Smile','GrayBun','None','None','bust'],['Device','SmileBig','GrayShort','GlassRoundThick','None','bust'],['Coffee','EatingHappy','GrayMedium','None','None','bust'],['Paper','Calm','ShortWavy','GlassRound','None','bust'],
];
export const PeepTest: React.FC = () => (
  <AbsoluteFill style={{ background: 'linear-gradient(180deg,#171b28,#0b0c11)', flexDirection: 'row', flexWrap: 'wrap', padding: 10, gap: 10 }}>
    {L.map(([b,f,h,a,fh,k], i) => <S key={i} body={b} face={f} hair={h} acc={a} fh={fh} kind={k} />)}
  </AbsoluteFill>
);
