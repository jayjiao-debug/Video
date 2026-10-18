import sim,json,collections
R=json.load(open('ratings.json'))
out={}
for lab in ['GPR','BTs','BT','BL']:
  c,r,s,N=sim.run(100000,400,40,1.0,7,R[lab])
  reg={k:round(100*v/N,1) for k,v in r.items()}
  teams={t:{st:round(100*s[(st,t)]/N,1) for st in ['QF','SF','F']}|{'W':round(100*c[t]/N,1)} for t in R[lab] if t!='MVK'}
  out[lab]={'region':reg,'teams':teams}
  print(lab,reg);print('  ',' '.join(f"{t}:{v['QF']}/{v['SF']}/{v['F']}/{v['W']}" for t,v in sorted(teams.items(),key=lambda kv:-kv[1]['W'])))
json.dump(out,open('sim_out.json','w'),indent=1)
