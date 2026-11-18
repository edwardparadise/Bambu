'use strict';
/* All project-planning information remains on the visitor's device. */
(function(){
 const tool=document.querySelector('.interactive-tool');if(!tool)return;
 const status=tool.querySelector('.tool-status');
 function report(message){if(status)status.textContent=message}
 function collect(){
  const lines=['BAMBU Interiors — project planning notes',''];
  if(tool.matches('form')){
   tool.querySelectorAll('.tool-fields label').forEach(label=>{
    const input=label.querySelector('input,select,textarea');if(!input)return;
    const name=label.childNodes[0]?.textContent?.trim()||input.name;
    const value=String(input.value||'').trim();
    lines.push(name+': '+(value||'Not yet confirmed'));
   });
  }else{
   const boxes=[...tool.querySelectorAll('.check-items input[type="checkbox"]')];
   lines.push('Items reviewed: '+boxes.filter(x=>x.checked).length+' of '+boxes.length,'');
   boxes.forEach(box=>lines.push((box.checked?'[x] ':'[ ] ')+box.value));
  }
  lines.push('','These notes are a starting point, not a professional survey, cost estimate or legal advice.');
  return lines.join('\n');
 }
 function fieldsAreValid(){return !tool.matches('form') || tool.reportValidity()}
 async function copy(){if(!fieldsAreValid())return;const value=collect();try{await navigator.clipboard.writeText(value);report('Notes copied. You can paste them into an email or document.')}catch(e){const area=document.createElement('textarea');area.value=value;area.style.position='fixed';area.style.opacity='0';document.body.appendChild(area);area.select();let ok=false;try{ok=document.execCommand('copy')}catch(_){}area.remove();report(ok?'Notes copied.':'Copy unavailable here. Please use Email BAMBU instead.')}}
 function email(){if(!fieldsAreValid())return;const subject='BAMBU project planning notes';location.href='mailto:hello@bambuinteriors.co.uk?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(collect());report('Your email application should open. Review and send the message yourself.')}
 tool.querySelector('[data-copy]')?.addEventListener('click',copy);
 tool.querySelector('[data-email]')?.addEventListener('click',email);
 const boxes=[...tool.querySelectorAll('.check-items input[type="checkbox"]')];
 function progress(){const count=boxes.filter(x=>x.checked).length;const label=tool.querySelector('[data-count]');if(label)label.textContent=String(count);const bar=tool.querySelector('progress');if(bar)bar.value=count}
 boxes.forEach(x=>x.addEventListener('change',progress));
 tool.querySelector('[data-reset]')?.addEventListener('click',()=>{boxes.forEach(x=>x.checked=false);progress();report('Checklist reset.')});
 tool.addEventListener('reset',()=>report('Form cleared.'));
 progress();
})();
