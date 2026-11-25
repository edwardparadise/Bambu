'use strict';
/* All project-planning information remains on the visitor's device. */
(function(){
 const tool=document.querySelector('.interactive-tool');if(!tool)return;
 const status=tool.querySelector('.tool-status');
 function report(message){if(status)status.textContent=message}
 function collect(){
  const lines=['BAMBU Interiors: project planning notes',''];
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
 function email(){if(!fieldsAreValid())return;try{sessionStorage.setItem('bambu-planning-enquiry',collect());location.href='contact.html#project-enquiry';}catch(_){const subject='BAMBU project planning notes';location.href='mailto:ed@bambuinteriors.co.uk,joe@bambuinteriors.co.uk?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(collect());}}
 function download(){
  if(!fieldsAreValid())return;
  const fileName=(tool.getAttribute('data-tool')||location.pathname.split('/').pop()||'bambu-notes')
   .replace(/\.html$/,'').replace(/[^a-z0-9-]/gi,'-')+'-notes.txt';
  const blob=new Blob([collect()+'\n'],{type:'text/plain;charset=utf-8'});
  const url=URL.createObjectURL(blob);
  const anchor=document.createElement('a');
  anchor.href=url;anchor.download=fileName;
  document.body.appendChild(anchor);anchor.click();anchor.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
  report('Notes downloaded to your device. No details were sent to BAMBU.');
 }
 tool.querySelector('[data-download]')?.addEventListener('click',download);
 tool.querySelector('[data-copy]')?.addEventListener('click',copy);
 tool.querySelector('[data-email]')?.addEventListener('click',email);
 const boxes=[...tool.querySelectorAll('.check-items input[type="checkbox"]')];
 function progress(){const count=boxes.filter(x=>x.checked).length;const label=tool.querySelector('[data-count]');if(label)label.textContent=String(count);const bar=tool.querySelector('progress');if(bar)bar.value=count}
 boxes.forEach(x=>x.addEventListener('change',progress));
 tool.querySelector('[data-reset]')?.addEventListener('click',()=>{boxes.forEach(x=>x.checked=false);progress();report('Checklist reset.')});
 tool.addEventListener('reset',()=>report('Form cleared.'));
 // Summarise unanswered questions without claiming professional assessment.
 const summary=document.createElement('div');summary.className='bambu-tool-summary';summary.setAttribute('aria-live','polite');tool.appendChild(summary);
 function review(){summary.replaceChildren();const head=document.createElement('strong');head.textContent='Your next decisions';summary.appendChild(head);const p=document.createElement('p');if(boxes.length){const missing=boxes.filter(b=>!b.checked);p.textContent=missing.length?missing.length+' items remain unreviewed. Resolve critical approvals, building information and programme dependencies before committing.':'All items marked as reviewed. Confirm the evidence with the project team before relying on the checklist.';summary.appendChild(p);const ul=document.createElement('ul');missing.forEach(b=>{const li=document.createElement('li');li.textContent=b.value;ul.appendChild(li);});summary.appendChild(ul);}else{const inputs=[...tool.querySelectorAll('.tool-fields input,.tool-fields select,.tool-fields textarea')];const missing=inputs.filter(x=>!String(x.value||'').trim());p.textContent=missing.length+' unanswered items. Compare options against the brief, cost and key dates. These notes are a starting point, not a recommendation.';summary.appendChild(p);}}
 tool.addEventListener('input',review);tool.addEventListener('reset',()=>setTimeout(review,0));tool.querySelector('[data-reset]')?.addEventListener('click',review);progress();review();
})();
