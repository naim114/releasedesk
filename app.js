/* ReleaseDesk v2.0. Document drafting only; no deployment execution. */
(() => {
'use strict';
const STORAGE='releasedesk-v1-state', WORD_NS='http://schemas.openxmlformats.org/wordprocessingml/2006/main';
const XLS_NS='http://schemas.openxmlformats.org/spreadsheetml/2006/main';
const defaultNode=(host,ip,root,file,jasper='-',xml='-')=>({host,ip,appPath:root,filePath:file,jasperPath:jasper,xmlPath:xml});
const app=(id,name,type,filename,nodes,process,stop,start)=>({id,name,type,filename,nodes,process:process||'',stop:stop||'',start:start||'',notes:''});
const A1='aepvlapb1', A2='aepvlapb2', IP1='10.200.11.90', IP2='10.200.11.91';
function pair(root,folder,hosts=[[A1,IP1],[A2,IP2]],jasper='-',xml='-'){return hosts.map(([h,ip])=>defaultNode(h,ip,root,folder,jasper,xml));}
const initialApps=[
app('switch','Switch','jar','onecard.jar',pair('/cardzone/oneswitch','/cardzone/oneswitch/lib',[['aepvlswi1','10.200.11.100'],['aepvlswi2','10.200.11.101']],'-','/cardzone/oneswitch/deploy'),'ps -ef | grep -F /cardzone/oneswitch | grep -v grep','bin/stopSwitch','bin/startSwitch'),
app('batch','Batch','jar','onecard.jar',pair('/cardzone/oneswitch_batch','/cardzone/oneswitch_batch/lib',undefined,'/cardzone/oneswitch_batch/jasperreport','/cardzone/oneswitch_batch/deploy'),'ps -ef | grep -F /cardzone/oneswitch_batch | grep -v grep','bin/stopBatch','bin/startBatch'),
app('tomcat','Apache Tomcat / CMS','war','onecard.war',pair('/cardzone/apache-tomcat-9.0.102/','/cardzone/apache-tomcat-9.0.102/webapps'),'ps -ef | grep -F apache-tomcat-9.0.102 | grep -v grep','kill -9 <PID>','bin/startup.sh'),
app('acs','ACS (3DS)','war','acs.war',pair('/cardzone/apache-tomcat-9.0.102-3ds','/cardzone/apache-tomcat-9.0.102-3ds/webapps'),'ps -ef | grep -F apache-tomcat-9.0.102-3ds | grep -v grep','kill -9 <PID>','bin/startup.sh'),
app('3dss','3DSS (3DS Server)','war','3ds.war',pair('/cardzone/apache-tomcat-9.0.102-3dss','/cardzone/apache-tomcat-9.0.102-3dss/webapps'),'ps -ef | grep -F apache-tomcat-9.0.102-3dss | grep -v grep','kill -9 <PID>','bin/startup.sh'),
app('token','Token','war','',pair('/cardzone/apache-tomcat-9.0.102-token/','/cardzone/apache-tomcat-9.0.102-token/webapps'),'ps -ef | grep -F apache-tomcat-9.0.102-token | grep -v grep','kill -9 <PID>','bin/startup.sh'),
app('mercportal','Merchant Portal','war','mercportal.war',pair('/cardzone/apache-tomcat-9.0.102-mercportal','/cardzone/apache-tomcat-9.0.102-mercportal/webapps'),'ps -ef | grep -F apache-tomcat-9.0.102-mercportal | grep -v grep','kill -9 <PID>','bin/startup.sh'),
app('mercapi','Mercportal Batch API','jar','',pair('/cardzone/mercportal-api-batch','/cardzone/mercportal-api-batch/lib'),'ps -ef | grep -F mercportal-api-batch | grep -v grep','',''),
app('webservice','Webservice','jar','',pair('/cardzone/oneswitch_webserv','/cardzone/oneswitch_webserv/lib',[['aepvlwbs1','10.200.11.92'],['aepvlwbs2','10.200.11.93']],'-','/cardzone/oneswitch_webserv/deploy'),'ps -ef | grep -F oneswitch_webserv | grep -v grep','','')
];
const initialBank={id:'bmmb',code:'BMMB',name:'Bank Muamalat Malaysia Berhad',apps:initialApps};
const freshDraft=()=>({bankId:'bmmb',env:'PROD',ctc:'',ticketTitle:'',mantis:'',itcr:'',pcrNumber:'',changeType:'',changeTypes:[],systemAffected:'',moduleAffected:'',partiesAffected:['Application/BRM'],componentAffected:['Application'],programsAffected:['Programs/Database'],partiesOther:'',componentOther:'',programsOther:'',impactAnalysis:'',requestDate:'',requestor:'',contact:'',department:'Cardzone',pic:'',impactLevel:'Minor',uat:'Yes',startDate:'',startTime:'22:00',endDate:'',endTime:'23:00',reason:'Bugfix / Solution to Problem',codeChange:'Yes',downtime:'No',downtimeHours:'',downtimeReason:'',impactText:'',background:'',rootCause:'',solution:'',validation:'Verify application status on all nodes, confirm service connectivity, and perform post-deployment validation.',notes:'',documents:['itcr','checklist','release'],signatures:{itcr:{mode:'blank',text:'',font:'Segoe Script',style:'italic'},release:{mode:'blank',text:'',font:'Segoe Script',style:'italic'}},sqlInvolved:'No',sqlFiles:[],xmlInvolved:'No',xmlArtifacts:{},includeBinary:{},selectedAppIds:[],artifacts:{}});
let state;try{state=JSON.parse(localStorage.getItem(STORAGE)||'null');}catch{}
if(!state || !Array.isArray(state.banks) || !state.banks.length)state={banks:[JSON.parse(JSON.stringify(initialBank))],draft:freshDraft(),settingsBankId:'bmmb'};
if(!state.draft)state.draft=freshDraft();
// Migrate existing v1 local drafts without clearing bank configuration or entered information.
const seedDraft=freshDraft();Object.keys(seedDraft).forEach(k=>{if(state.draft[k]===undefined)state.draft[k]=structuredClone(seedDraft[k])});
if(!Array.isArray(state.draft.sqlFiles))state.draft.sqlFiles=[];
if(!state.draft.xmlArtifacts||typeof state.draft.xmlArtifacts!=='object')state.draft.xmlArtifacts={};
if(!state.draft.includeBinary||typeof state.draft.includeBinary!=='object')state.draft.includeBinary={};
for(const key of ['partiesAffected','componentAffected','programsAffected'])if(!Array.isArray(state.draft[key]))state.draft[key]=structuredClone(seedDraft[key]);
if(!Array.isArray(state.draft.changeTypes))state.draft.changeTypes=state.draft.changeType?[state.draft.changeType]:[];
const DOCUMENT_TYPES=['itcr','checklist','release'];
if(!Array.isArray(state.draft.documents))state.draft.documents=[...DOCUMENT_TYPES];
const cleanDocuments=()=>DOCUMENT_TYPES.filter(k=>state.draft.documents.includes(k));
const signatureDefaults=()=>({mode:'blank',text:'',font:'Segoe Script',style:'italic'});
if(!state.draft.signatures || typeof state.draft.signatures!=='object')state.draft.signatures={};
for(const role of ['itcr','release'])state.draft.signatures[role]={...signatureDefaults(),...(state.draft.signatures[role]||{})};
// Uploaded signature images are intentionally transient and excluded from JSON backups.
let signatureImages={itcr:null,release:null};
let currentView='start',planTab='pre',saveTimer;
const $=(s,base=document)=>base.querySelector(s), $$=(s,base=document)=>[...base.querySelectorAll(s)];
const escapeHtml=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const slug=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,40)||'item';
const bank=()=>state.banks.find(b=>b.id===state.draft.bankId)||state.banks[0];
const appById=(id,b=bank())=>b.apps.find(x=>x.id===id);
const persist=()=>{try{localStorage.setItem(STORAGE,JSON.stringify(state));}catch(e){console.warn('Local storage unavailable; use Export data',e)}};
const fmtDate=s=>s?`${s.slice(8,10)}/${s.slice(5,7)}/${s.slice(0,4)}`:'[Not provided]';
const stamp=()=>state.draft.startDate?state.draft.startDate.replace(/-/g,''):'YYYYMMDD';
function duration(){const d=state.draft;if(!d.startDate||!d.endDate||!d.startTime||!d.endTime)return '';const a=new Date(`${d.startDate}T${d.startTime}:00`),b=new Date(`${d.endDate}T${d.endTime}:00`);const mins=Math.round((b-a)/60000);if(!Number.isFinite(mins)||mins<0)return 'INVALID';return `${Math.floor(mins/60)} hour${Math.floor(mins/60)!==1?'s':''} ${mins%60} minute${mins%60!==1?'s':''}`;}
function downtimeDuration(){
 const hours=Number(state.draft.downtimeHours);
 if(state.draft.downtime!=='Yes')return '0 hours';
 if(!Number.isFinite(hours)||hours<=0)return '[Specify downtime hours]';
 return `${Number(hours.toFixed(2))} hour${hours===1?'':'s'}`;
}
function downtimeSummary(){
 const d=state.draft;
 return d.downtime==='Yes'?`Yes - ${downtimeDuration()}`:'No';
}

function sqlReference(value,placeholder){
 const cleaned=String(value||'').trim().replace(/^#+/,'').replace(/[^a-zA-Z0-9_-]+/g,'_').replace(/^_+|_+$/g,'');
 return cleaned||placeholder;
}
function effectiveSqlFiles(){
 const d=state.draft,files=(Array.isArray(d.sqlFiles)&&d.sqlFiles.length?d.sqlFiles:[{name:'',fallbackName:''}]);
 const ctc=sqlReference(d.ctc,''),mantis=sqlReference(d.mantis,'');
 return files.map((f,i)=>{
  const suffix=files.length>1?`_${String(i+1).padStart(2,'0')}`:'';
  // Do not invent a Mantis reference. A CTC ticket alone is sufficient.
  const parts=[];
  if(ctc)parts.push(`CTC_${ctc}`);
  if(mantis)parts.push(`MANTIS_${mantis}`);
  const base=(parts.join('_')||'SQL')+suffix;
  return {name:String(f.name||'').trim()||`${base}_UPDATE.sql`,fallbackName:String(f.fallbackName||'').trim()||`${base}_FALLBACK.sql`};
 });
}
function textOnly(html){const el=document.createElement('div');el.innerHTML=html||'';el.querySelectorAll('script,style,iframe,object').forEach(x=>x.remove());const blocks=el.querySelectorAll('p,div,li,br');blocks.forEach(x=>{if(x.tagName==='BR')x.replaceWith('\n');else if(x.tagName==='LI')x.prepend('• ');else x.append('\n');});return(el.textContent||'').replace(/\n{3,}/g,'\n\n').trim();}
function activeArtifacts(a){const found=state.draft.artifacts[a.id];return Array.isArray(found)&&found.length?found:[{name:a.filename||'',type:a.type,version:'',checksum:''}];}
function binaryArtifacts(a){return state.draft.includeBinary[a.id]===false?[]:activeArtifacts(a)}
function xmlArtifacts(a){return state.draft.xmlInvolved==='Yes'?(state.draft.xmlArtifacts[a.id]||[]):[]}
function selected(){return (state.draft.selectedAppIds||[]).map(id=>appById(id)).filter(Boolean)}
function shellQuote(s){return `'${String(s).replace(/'/g,"'\\''")}'`}
function warningList(){
 const d=state.draft,w=[];
 if(!d.ctc)w.push('CTC ticket number is not filled in.');
 if(!d.ticketTitle?.trim())w.push('Ticket title is missing (required for the ITCR Description of Change).');
 if(bank().code.toUpperCase()==='BMMB'&&d.env!=='PROD')w.push('BMMB ITCR is based on the supplied production form; manually check bank-specific environment selections.');
 if(!d.requestor)w.push('Requestor is missing.');if(!d.pic)w.push('PIC is missing.');
 if(!d.startDate||!d.endDate||!d.startTime||!d.endTime)w.push('Complete the activity start and end dates/times.');
 if(duration()==='INVALID')w.push('Activity end date/time must be after the start.');
 if(d.downtime==='Yes'&&!d.downtimeReason.trim())w.push('Downtime reason is required when downtime is Yes.');
 if(d.downtime==='Yes'&&!(Number(d.downtimeHours)>0))w.push('Enter the planned downtime duration in hours (for example, 1.5).');
 if(d.sqlInvolved==='Yes'){
  const entries=d.sqlFiles.length?d.sqlFiles:[{}];
  if(entries.some(f=>!f.name?.trim()||!f.fallbackName?.trim())&&!String(d.ctc||'').trim())w.push('Enter a CTC ticket number for automatically named SQL files, or manually enter the filenames.');
 }
 if(!selected().length&&d.sqlInvolved!=='Yes')w.push('Select at least one application, or enable an SQL-only deployment.');
 let xmlCount=0, binaryCount=0;
 selected().forEach(a=>{
  const files=binaryArtifacts(a),xmls=xmlArtifacts(a);binaryCount+=files.length;xmlCount+=xmls.length;
  files.forEach(o=>{if(!o.name?.trim())w.push(`${a.name}: enter the JAR/WAR filename.`);if(o.type!=='jar'&&o.type!=='war')w.push(`${a.name}: JAR/WAR object type is invalid.`)});
  xmls.forEach((o,i)=>{if(!o.name?.trim())w.push(`${a.name} XML ${i+1}: filename is missing.`);if(!['new','existing'].includes(o.change))w.push(`${a.name} XML ${i+1}: choose New or Existing.`)});
  if(!files.length&&!xmls.length)w.push(`${a.name}: no deployment files selected (enable JAR/WAR or add XML).`);
  if(!a.nodes.length)w.push(`${a.name}: no server nodes configured.`);
  a.nodes.forEach((n,i)=>{
   if(files.length&&(!n.filePath||!n.appPath||n.filePath==='-'))w.push(`${a.name} node ${i+1}: application or JAR/WAR deployment path missing.`);
   if(xmls.some(o=>!String(o.path||'').trim())&&(!n.xmlPath||n.xmlPath==='-'))w.push(`${a.name} node ${i+1}: XML destination path is not configured. Update Bank configuration or enter an XML-specific path.`);
  });
  if(files.length&&(!a.stop||!a.start))w.push(`${a.name}: stop/start commands are not configured—review the generated instructions.`);
 });
 if(d.xmlInvolved==='Yes'&&!xmlCount)w.push('XML is Yes: select an application and add at least one XML file.');
 return w;
}
function refreshDocumentChoices(){
 $$('[data-document-choice]').forEach(el=>{el.checked=cleanDocuments().includes(el.dataset.documentChoice)});
 const count=cleanDocuments().length;
 $('#selectionSummary').textContent=count?`${count} document${count===1?'':'s'} selected`:'Select at least one document to continue.';
 $('#startNextBtn').disabled=!count;
 $$('[data-document-download]').forEach(card=>{card.hidden=!cleanDocuments().includes(card.dataset.documentDownload)});
 $('#downloadAll').disabled=!count;
 $('#downloadAll').textContent=`Download ${count} selected document${count===1?'':'s'}`;
}
function refreshSignaturePanels(){
 for(const role of ['itcr','release']){
  const v=state.draft.signatures[role];
  $$(`[data-signature-field][data-signature-role="${role}"]`).forEach(el=>{el.value=v[el.dataset.signatureField]||''});
  $$(`[data-signature-section][data-signature-role="${role}"]`).forEach(el=>el.classList.toggle('hide',el.dataset.signatureSection!==v.mode));
  const host=$(`[data-signature-preview="${role}"]`);
  host.replaceChildren();
  if(signatureImages[role]){
   const img=document.createElement('img');img.src=signatureImages[role];img.alt='Signature image preview';host.appendChild(img);
  }else host.textContent='No image selected for this session';
 }
}
function initFields(){
 const bsel=$('#bankSelect'),sSel=$('#settingsBank');bsel.innerHTML=state.banks.map(b=>`<option value="${escapeHtml(b.id)}">${escapeHtml(b.code)} — ${escapeHtml(b.name)}</option>`).join('');sSel.innerHTML=state.banks.map(b=>`<option value="${escapeHtml(b.id)}">${escapeHtml(b.code)} — ${escapeHtml(b.name)}</option>`).join('');
 const d=state.draft;if(!state.banks.some(b=>b.id===d.bankId))d.bankId=state.banks[0].id;
 $$('[data-draft]').forEach(el=>{el.value=d[el.dataset.draft]??''});$$('[data-affected-group]').forEach(el=>{el.checked=(d[el.dataset.affectedGroup]||[]).includes(el.value)});$$('[data-change-type]').forEach(el=>{el.checked=(d.changeTypes||[]).includes(el.value)});$$('[data-rich-field]').forEach(el=>{el.innerHTML=d[el.dataset.richField]||''});sSel.value=state.settingsBankId||d.bankId;updateDetailBits();refreshDocumentChoices();refreshSignaturePanels();
}
function updateDetailBits(){const d=state.draft;$('#durationView').textContent=duration()||'Not scheduled';$('#downtimeReasonWrap').classList.toggle('hide',d.downtime!=='Yes');$('#sqlDetailsWrap').classList.toggle('hide',d.sqlInvolved!=='Yes');$('#xmlHelp').classList.toggle('hide',d.xmlInvolved!=='Yes');renderSqlFiles()}
const pages={start:['CREATE DOCUMENTS','Choose documents','Select the deployment documents you want to prepare.'],details:['NEW RELEASE','Deployment details','Enter the release information once for the selected documents.'],applications:['COMPONENTS','Applications & files','Choose JAR/WAR and XML files for each component; SQL runs first.'],review:['READY TO GENERATE','Review & generate','Check deployment steps, then download your document package.'],config:['ADMINISTRATION','Bank configuration','Manage reusable application nodes, paths and startup/shutdown commands.']};
function showView(v){if(!pages[v])return;currentView=v;$$('section[id^="view-"]').forEach(el=>el.hidden=el.id!==`view-${v}`);$$('.nav').forEach(n=>n.classList.toggle('active',n.dataset.view===v));$('#eyebrow').textContent=pages[v][0];$('#pageTitle').textContent=pages[v][1];$('#pageLead').textContent=pages[v][2];$('#crumbLabel').textContent=pages[v][1];if(v==='start')refreshDocumentChoices();if(v==='applications')renderApplications();if(v==='review')renderReview();if(v==='config')renderConfig();window.scrollTo({top:0,behavior:'instant'});}
function renderSqlFiles(){
 const host=$('#sqlFileRows');if(!host)return;
 const entries=state.draft.sqlFiles||[];
 host.innerHTML=entries.map((f,i)=>{const computed=effectiveSqlFiles()[i];return `<div class="sql-file-line">
  <label class="field"><span>SQL script ${i+1} <em>Optional</em></span><input data-sql-field="name" data-sql-idx="${i}" placeholder="${escapeHtml(computed.name)}" value="${escapeHtml(f.name||'')}"></label>
  <label class="field"><span>Fallback script <em>Optional</em></span><input data-sql-field="fallbackName" data-sql-idx="${i}" placeholder="${escapeHtml(computed.fallbackName)}" value="${escapeHtml(f.fallbackName||'')}"></label>
  <button class="mini-danger" title="Remove SQL script pair" data-remove-sql="${i}">Remove</button></div>`}).join('')||'<p class="meta">If left blank, filenames use CTC and Mantis when available; Mantis is optional.</p>';
}
function renderApplications(){
 const root=$('#applicationCards');
 root.innerHTML=bank().apps.map(a=>{
  const on=state.draft.selectedAppIds.includes(a.id),objs=activeArtifacts(a),xmls=xmlArtifacts(a);
  const binaryOn=state.draft.includeBinary[a.id]!==false;
  return `<div class="app-option ${on?'selected':''}"><label class="app-option-top"><input type="checkbox" data-choose-app="${escapeHtml(a.id)}" ${on?'checked':''}><strong>${escapeHtml(a.name)}</strong></label>
   <small class="meta">${a.nodes.length} node(s) · ${escapeHtml(a.type.toUpperCase())} · ${escapeHtml(a.filename||'File not configured')}</small>
   ${String(a.notes||'').trim()? `<div class="app-reference-notes"><strong>Application notes</strong><div>${escapeHtml(a.notes)}</div></div>` : ''}
   ${on?`<div class="app-artifacts">
    <label class="check-option"><input type="checkbox" data-binary-app="${escapeHtml(a.id)}" ${binaryOn?'checked':''}> Include JAR/WAR deployment</label>
    ${binaryOn?`<div class="cfg-small" style="margin:10px 0 8px">JAR/WAR FILE(S) (filename / version / checksum)</div>
    ${objs.map((o,i)=>`<div class="artifact-line"><input placeholder="${a.type==='war'?'app.war':'app.jar'}" data-object="name" data-aid="${escapeHtml(a.id)}" data-idx="${i}" value="${escapeHtml(o.name)}"><input placeholder="Version" data-object="version" data-aid="${escapeHtml(a.id)}" data-idx="${i}" value="${escapeHtml(o.version||'')}"><input placeholder="Checksum" data-object="checksum" data-aid="${escapeHtml(a.id)}" data-idx="${i}" value="${escapeHtml(o.checksum||'')}"><button title="Remove JAR/WAR file" data-remove-object="${escapeHtml(a.id)}" data-idx="${i}">×</button></div>`).join('')}
    <button class="tiny-action" data-add-object="${escapeHtml(a.id)}">+ Add another JAR/WAR file</button>`:''}
    ${state.draft.xmlInvolved==='Yes'?`<div class="cfg-title">XML FILES</div><p class="meta">Each XML file can be <b>New</b> (release only) or <b>Existing</b> (back up then replace). By default files use the configured node XML path. Add a path override for files such as <code>master.xml</code> under <code>cfg/packager</code>.</p>
     ${xmls.map((o,i)=>`<div class="xml-file-line"><label class="field"><span>XML filename</span><input data-xml-field="name" data-xml-app="${escapeHtml(a.id)}" data-xml-idx="${i}" placeholder="e.g. routing.xml" value="${escapeHtml(o.name||'')}"></label><label class="field"><span>XML status</span><select data-xml-field="change" data-xml-app="${escapeHtml(a.id)}" data-xml-idx="${i}"><option value="new" ${o.change==='new'?'selected':''}>New XML</option><option value="existing" ${o.change==='existing'?'selected':''}>Existing XML — replacement</option></select></label><label class="field"><span>Destination path <em>Optional override</em></span><input data-xml-field="path" data-xml-app="${escapeHtml(a.id)}" data-xml-idx="${i}" placeholder="Uses node XML path if blank" value="${escapeHtml(o.path||'')}"></label><button class="mini-danger" data-remove-xml="${escapeHtml(a.id)}" data-xml-idx="${i}">Remove</button></div>`).join('')}
     <button class="tiny-action" data-add-xml="${escapeHtml(a.id)}">+ Add XML file</button>`:''}
   </div>`:''}</div>`;
 }).join('')||'<div>No applications configured for this bank. Add them under Bank configuration.</div>';
}
function renderConfig(){const b=state.banks.find(x=>x.id===(state.settingsBankId||state.draft.bankId))||bank();$('#settingsBank').value=b.id;$('#bankConfigHeading').innerHTML=`<div class="config-bank-name"><strong>${escapeHtml(b.code)}</strong> — ${escapeHtml(b.name)} <span class="cfg-small">· ${b.apps.length} applications</span></div><div class="field-grid" style="margin-bottom:12px"><label class="field"><span>Bank code</span><input data-bank-field="code" data-bid="${b.id}" value="${escapeHtml(b.code)}"></label><label class="field"><span>Bank name</span><input data-bank-field="name" data-bid="${b.id}" value="${escapeHtml(b.name)}"></label></div>`;
$('#configAppList').innerHTML=b.apps.map(a=>`<details class="cfg-app"><summary><span>${escapeHtml(a.name)} <small class="cfg-small">— ${a.nodes.length} node(s)</small></span><span class="cfg-small">${a.type.toUpperCase()} · ${escapeHtml(a.filename||'Not set')}</span></summary><div class="cfg-body"><div class="field-grid"><label class="field"><span>Application name</span><input data-app-field="name" data-app="${a.id}" value="${escapeHtml(a.name)}"></label><label class="field"><span>Deployment object type</span><select data-app-field="type" data-app="${a.id}"><option value="jar" ${a.type==='jar'?'selected':''}>JAR</option><option value="war" ${a.type==='war'?'selected':''}>WAR</option></select></label><label class="field"><span>Default file name</span><input data-app-field="filename" data-app="${a.id}" value="${escapeHtml(a.filename)}" placeholder="onecard.jar"></label><label class="field"><span>Process-check command</span><input data-app-field="process" data-app="${a.id}" value="${escapeHtml(a.process)}" placeholder="ps -ef | grep -F ..."></label><label class="field"><span>Stop command</span><input data-app-field="stop" data-app="${a.id}" value="${escapeHtml(a.stop)}" placeholder="bin/stopSwitch"></label><label class="field"><span>Start command</span><input data-app-field="start" data-app="${a.id}" value="${escapeHtml(a.start)}" placeholder="bin/startSwitch"></label></div>
<div class="cfg-title">APPLICATION NOTES</div>
<label class="field"><span>Reusable notes for ${escapeHtml(a.name)} <em>Saved per bank and application</em></span><textarea rows="5" data-app-field="notes" data-app="${a.id}" placeholder="e.g. Special deployment instructions, validation reminders, dependencies and known precautions. Do not include passwords or secret keys.">${escapeHtml(a.notes||'')}</textarea></label>
<p class="cfg-small">These notes appear on the application selection screen. They are not included in generated documents.</p>
<div class="cfg-title">SERVER NODES</div>${a.nodes.map((n,i)=>`<div class="cfg-node"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><strong>Node ${i+1} · ${escapeHtml(n.host||'New node')}</strong><button class="mini-danger" data-remove-node="${a.id}" data-node-index="${i}">Remove node</button></div><div class="field-grid">${[['host','Server name'],['ip','IP address'],['appPath','Application path'],['filePath','JAR/WAR deployment path'],['jasperPath','JasperReport path (future use)'],['xmlPath','XML deployment path']].map(([key,label])=>`<label class="field"><span>${label}</span><input data-node-field="${key}" data-app="${a.id}" data-node="${i}" value="${escapeHtml(n[key]||'')}"></label>`).join('')}</div></div>`).join('')}<div class="cfg-actions"><button class="tiny-action" data-add-node="${a.id}">+ Add server node</button><button class="mini-danger" data-delete-app="${a.id}">Delete application</button></div></div></details>`).join('')||'<div class="notice">No applications added yet.</div>'}
function validFileName(name){return /^[A-Za-z0-9][A-Za-z0-9._+-]*\.(?:jar|war|xml)$/i.test(String(name||'')) && !String(name).includes('..')}
function validFolder(path){return /^\/[A-Za-z0-9._/-]+$/.test(String(path||'')) && !String(path).includes('..')}
function docFolder(path){return validFolder(path)?String(path):'[REVIEW: set valid destination path]'}
function docFile(name){return validFileName(name)?String(name):'[REVIEW: enter valid filename]'}
function typedFileCommands(files,fn){return files.map(o=>validFileName(o.name)?fn(o.name):'# REVIEW: file name is missing or invalid; do not proceed.').join('\n')}
function xmlGroups(a,n,xmls){
 const groups=new Map();
 for(const o of xmls){
  const folder=String(o.path||'').trim()||n.xmlPath;
  const key=folder||'';
  if(!groups.has(key))groups.set(key,[]);
  groups.get(key).push(o);
 }
 return [...groups].map(([path,files])=>{
  const master=/\/cfg\/packager\/?$/.test(path);
  const label=master?(a.name.toLowerCase()==='lb'?'LB':`Master_${a.name.replace(/[^A-Za-z0-9]/g,'_')}`):'xml';
  return {path,label,files,existing:files.filter(x=>x.change==='existing'),newFiles:files.filter(x=>x.change==='new')};
 });
}
function buildPlan(){
 const d=state.draft,pre=[],deploy=[],post=[],rollback=[],objects=[],date=stamp();
 const add=(target,a,n,i,title,commands='',note='')=>target.push({app:a.name,node:`Node ${i+1}`,host:n.host||'',ip:n.ip||'',title,commands,note,stage:target===pre?'Pre':target===deploy?'Deployment':target===post?'Post':'Rollback'});
 const addSql=(target,title,commands,note='')=>target.push({app:'SQL/Database',node:'Database',host:'',ip:'',title,commands,note,stage:target===pre?'Pre':target===deploy?'Deployment':'Rollback'});
 if(d.sqlInvolved==='Yes'){
  addSql(pre,'Back up current data in database','# Select/retrieve the affected records and save a recoverable copy.\n# Verify the data backup before running any update.');
  addSql(pre,'Prepare fallback SQL script(s)',effectiveSqlFiles().map(f=>`# Prepared fallback: ${f.fallbackName}`).join('\n'));
  effectiveSqlFiles().forEach(f=>objects.push({application:'SQL/Database',name:f.name,type:'sql',version:'',checksum:''}));
  effectiveSqlFiles().forEach(f=>addSql(deploy,`Execute SQL: ${f.name}`,`# Run approved SQL script: ${f.name}\n# Confirm successful execution BEFORE any other component is deployed.`, 'Stop deployment if SQL execution fails.'));
 }
 selected().forEach(a=>{
  const files=binaryArtifacts(a),xmls=xmlArtifacts(a);
  files.forEach(o=>objects.push({application:a.name,name:o.name,type:o.type||a.type,version:o.version||'',checksum:o.checksum||''}));
  xmls.forEach(o=>objects.push({application:a.name,name:o.name||'',type:'xml',version:'',checksum:''}));
  a.nodes.forEach((n,i)=>{
   if(!files.length&&!xmls.length)return;
   const where=n.appPath||'',folder=n.filePath||'',groups=xmlGroups(a,n,xmls);
   const label=`${a.name} — Node ${i+1} (${n.host||'Host not set'})`;
   if(files.length){
    add(pre,a,n,i,`Check backup destination and release files — ${label}`,`# Check ${docFolder(folder)} and the backup directory.\n# Confirm approved release files and available disk space.`, 'Do not move a live JAR/WAR until the application is stopped.');
   }
   if(groups.some(g=>g.existing.length)){
    add(pre,a,n,i,`Confirm existing XML files and fallback readiness — ${label}`,'# Verify the current XML files exist at their configured paths.\n# Confirm the XML deployment and rollback order.');
   }
   if(files.length){
    add(deploy,a,n,i,`Check ${a.name} process on ${n.host||'the node'}`,a.process||`ps -ef | grep -F -- ${shellQuote(where)} | grep -v grep`);
    const force=String(a.stop||'').includes('kill -9');
    add(deploy,a,n,i,`Stop ${a.name} — ${n.host||`Node ${i+1}`}`,`${force?'# Confirm the exact process ID first.\n':''}cd ${shellQuote(where)}\n${a.stop||'# STOP COMMAND NOT CONFIGURED'}`,force?'Kill -9 is forceful. Use only an approved, verified PID.':'');
    add(deploy,a,n,i,`Back up JAR/WAR after stopping ${a.name}`,validFolder(folder)?`cd ${shellQuote(folder)}\n${typedFileCommands(files,name=>`mv ${shellQuote(name)} ${shellQuote(`backup/${name}.${date}`)}`)}`:'# REVIEW: Deployment path not configured. Do not run file commands.');
    add(deploy,a,n,i,`Release JAR/WAR file(s) to ${docFolder(folder)}`,`# Transfer approved ${files.map(x=>docFile(x.name)).join(', ')} to the destination\n${validFolder(folder)?`cd ${shellQuote(folder)}\n${typedFileCommands(files,name=>`chmod 755 ${shellQuote(name)}`)}`:'# REVIEW: Deployment path not configured.'}`);
   }
   for(const group of groups){
    if(group.existing.length){
     add(deploy,a,n,i,`Back up existing ${group.label} XML on ${n.host||'the node'}`,validFolder(group.path)?`cd ${shellQuote(group.path)}\n${typedFileCommands(group.existing,name=>`mv ${shellQuote(name)} ${shellQuote(`${name}.${date}`)}`)}`:'# REVIEW: XML destination path not configured.');
    }
    add(deploy,a,n,i,`Release ${group.label} XML file(s) to ${docFolder(group.path)}`,`# Transfer the approved XML file(s)\n${validFolder(group.path)?`cd ${shellQuote(group.path)}`:'# REVIEW: XML destination path not configured.'}\nFile Name:\n${group.files.map(o=>`- ${docFile(o.name)}`).join('\n')}`);
   }
   if(files.length){
    add(deploy,a,n,i,`Start ${a.name} — ${n.host||`Node ${i+1}`}`,`cd ${shellQuote(where)}\n${a.start||'# START COMMAND NOT CONFIGURED'}`);
    add(deploy,a,n,i,`Verify ${a.name} node ${i+1} before continuing`,`# Recheck process status\n${a.process||`ps -ef | grep -F -- ${shellQuote(where)} | grep -v grep`}\n# Confirm logs, connectivity and application readiness`, 'Proceed to the next node ONLY after verification succeeds.');
   }else{
    add(deploy,a,n,i,`Verify XML changes on ${n.host||`Node ${i+1}`}`,'# Verify XML syntax, file permissions and application behavior.\n# Restart/reload only if the approved procedure requires it.');
   }
   if(files.length)add(rollback,a,n,i,`Stop ${a.name} before fallback on ${n.host||`Node ${i+1}`}`,`cd ${shellQuote(where)}\n${a.stop||'# STOP COMMAND NOT CONFIGURED'}`);
   if(files.length)add(rollback,a,n,i,`Restore backed-up JAR/WAR file(s)`,validFolder(folder)?`cd ${shellQuote(folder)}\n${typedFileCommands(files,name=>`rm -rf ${shellQuote(name)}\nmv ${shellQuote(`backup/${name}.${date}`)} ${shellQuote(name)}`)}`:'# REVIEW: Deployment path not configured.');
   for(const group of groups){
    if(group.existing.length)add(rollback,a,n,i,`Restore existing ${group.label} XML`,validFolder(group.path)?`cd ${shellQuote(group.path)}\n${typedFileCommands(group.existing,name=>`rm -rf ${shellQuote(name)}`)}\n${typedFileCommands(group.existing,name=>`mv ${shellQuote(`${name}.${date}`)} ${shellQuote(name)}`)}`:'# REVIEW: XML destination path not configured.');
    if(group.newFiles.length)add(rollback,a,n,i,`Remove new ${group.label} XML after confirmation`,`# Confirm these files can be safely removed.\n${validFolder(group.path)?`cd ${shellQuote(group.path)}\n${typedFileCommands(group.newFiles,name=>`rm -rf ${shellQuote(name)}`)}`:'# REVIEW: XML destination path not configured.'}`);
   }
   if(files.length)add(rollback,a,n,i,`Restart and verify ${a.name} after fallback on ${n.host||`Node ${i+1}`}`,`cd ${shellQuote(where)}\n${a.start||'# START COMMAND NOT CONFIGURED'}`);
  });
 });
 if(d.sqlInvolved==='Yes')effectiveSqlFiles().forEach(f=>addSql(rollback,`Execute fallback SQL: ${f.fallbackName}`,`# Execute approved fallback SQL: ${f.fallbackName}\n# Verify restored data.`, 'Confirm the approved SQL/application rollback sequence.'));
 post.push({app:'All affected components',node:'Overall',host:'',ip:'',title:'Overall post-deployment validation and verification',commands:textOnly(d.validation)||'Verify and validate all affected applications.',note:'Do not close the change until verification is complete.',stage:'Post'});
 rollback.push({app:'Services',node:'Overall',host:'',ip:'',title:'Overall verification after fallback',commands:'# View application logs and confirm service connectivity.\n# Validate business functions after the rollback.',stage:'Rollback'});
 const schedule=[...pre,...deploy,...post],start=new Date(`${d.startDate||'invalid'}T${d.startTime||'invalid'}:00`),end=new Date(`${d.endDate||'invalid'}T${d.endTime||'invalid'}:00`);
 if(Number.isFinite(start.getTime())&&Number.isFinite(end.getTime())&&end>=start) schedule.forEach((step,i)=>{const at=new Date(start.getTime()+Math.round(((end-start)*(schedule.length===1?1:i/(schedule.length-1)))/60000)*60000);const pad=x=>String(x).padStart(2,'0');step.expectedAt=`${pad(at.getDate())}/${pad(at.getMonth()+1)}/${at.getFullYear()} ${pad(at.getHours())}:${pad(at.getMinutes())}`});
 return {pre,deploy,post,rollback,objects};
}
function renderReview(){refreshDocumentChoices();const w=warningList();$('#reviewWarnings').innerHTML=w.length?`<div class="notice"><strong>${w.length} review item(s):</strong><ul>${w.map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ul>Documents may still be generated as drafts, but correct the missing items before approval.</div>`:`<div class="notice success">✓ No missing required deployment fields were detected. Review generated commands against your actual server environment.</div>`;const p=buildPlan();$('#metrics').innerHTML=[['Applications',selected().length],['Server nodes',selected().reduce((s,a)=>s+a.nodes.length,0)],['Deployment files',p.objects.length],['Planned duration',duration()||'—'],['Downtime',state.draft.downtime==='Yes'?downtimeDuration():'0 hours']].map(([k,v])=>`<div class="metric"><span>${k}</span><b>${escapeHtml(v)}</b></div>`).join('');renderPlanPreview();}
function renderPlanPreview(){const p=buildPlan();$('#planTabs').querySelectorAll('.tab').forEach(el=>el.classList.toggle('active',el.dataset.tab===planTab));const rows=p[planTab]||[];$('#planPreview').innerHTML=rows.length?rows.map((s,i)=>`<div class="step-card"><div class="num">${i+1}</div><div class="step-main"><strong>${escapeHtml(s.title)}</strong><p>${escapeHtml(s.app)} · ${escapeHtml(s.node)} ${s.ip?'· '+escapeHtml(s.ip):''}</p>${s.commands?`<pre>${escapeHtml(s.commands)}</pre>`:''}${s.note?`<p>${escapeHtml(s.note)}</p>`:''}</div></div>`).join(''):'<div class="notice">No steps configured. Select applications first.</div>'}
function safeText(s){return String(s==null?'':s)}
function sourceData(){
const d=state.draft,b=bank(),p=buildPlan(),names=[...selected().map(x=>x.name),...(d.sqlInvolved==='Yes'?['SQL/Database']:[])].join(', ')||'[Select applications]',downtime=downtimeSummary();
const mark=(group,key)=>(d[group]||[]).includes(key)?'X':'';
const title=(d.ctc?(/^#/.test(d.ctc.trim())?d.ctc.trim():'#'+d.ctc.trim()):'[CTC Ticket]')+' - '+(d.ticketTitle?.trim()||'[Ticket Title]');
const desc=[textOnly(d.background),`Root Cause: ${textOnly(d.rootCause)}`,`Solution: ${textOnly(d.solution)}`].filter(Boolean).join('\n\n');
const releaseTitle=`CTC ${d.ctc||'[CTC]'} - ${d.ticketTitle||'[Ticket Title]'}`;
const releaseProject=releaseTitle+(d.mantis?' / Mantis '+d.mantis:'');
const releaseOverview=`1. ${releaseTitle}`;
const releaseIssue=`1. ${releaseTitle}\n${textOnly(d.background)||'[Background / Issue]'}\n\nRoot Cause: ${textOnly(d.rootCause)||'[Root Cause]'}`;
const releaseSolution=`1. ${releaseTitle}\n${textOnly(d.solution)||'[Solution]'}`;
const envBoxes=['UAT','PROD','DR'].map(x=>`${d.env===x?'☒':'☐'} ${x}`).join('\n');
const justification=['Background / Issue',textOnly(d.background)||'[Background / Issue]','','Root Cause',textOnly(d.rootCause)||'[Root Cause]','','Solution',textOnly(d.solution)||'[Solution]','','Impact Analysis',textOnly(d.impactAnalysis)||'[Impact Analysis]'].join('\n');
return {BANK:b.name,BANK_CODE:b.code,PROJECT_NAME:releaseProject,ENV_BOXES:envBoxes,RELEASE_OVERVIEW:releaseOverview,RELEASE_ISSUE:releaseIssue,RELEASE_SOLUTION:releaseSolution,DOC_REF:`${b.code}_CMS_${stamp()}`,ITCR:d.itcr||'',PCR_CRSRIR:d.pcrNumber||'',MANTIS_DXC:d.mantis||'',CTC:d.ctc||'[CTC ticket no.]',MANTIS:d.mantis||'[Mantis ticket no.]',TICKET_TITLE:d.ticketTitle||'[Ticket Title]',SYSTEM_AFFECTED:d.systemAffected||'',MODULE_AFFECTED:d.moduleAffected||'',TICKETS:`CTC ${d.ctc||'—'} / Mantis ${d.mantis||'—'}`,REQUESTOR:d.requestor||'[Requestor]',DEPARTMENT:d.department||'Cardzone',CONTACT:d.contact||'[Contact number]',PIC:d.pic||'[PIC]',REQUEST_DATE:fmtDate(d.requestDate),START_DATE:fmtDate(d.startDate),START_TIME:d.startTime||'—',END_DATE:fmtDate(d.endDate),END_TIME:d.endTime||'—',DURATION:duration()||'Not specified',ENV:d.env,CODE_CHANGE:d.codeChange,UAT:d.uat,IMPACT_LEVEL:d.impactLevel,APPS:names,REASON_TYPE:d.reason,DESCRIPTION:desc||'[Background, root cause and solution]',ITCR_DESCRIPTION:title,JUSTIFICATION:justification,BACKGROUND:textOnly(d.background)||'[Background / Issue]',ROOT_CAUSE:textOnly(d.rootCause)||'[Root cause]',SOLUTION:textOnly(d.solution)||'[Solution]',IMPACT_ANALYSIS:textOnly(d.impactAnalysis)||'[Impact Analysis]',VALIDATION:d.validation||'Validate and verify affected services.',NOTES:d.notes||'—',DOWNTIME:d.downtime,DOWNTIME_HOURS:downtimeDuration(),DOWNTIME_DETAILS:downtime,DOWNTIME_REASON:d.downtime==='Yes'?(d.downtimeReason||'Not provided'):'Not applicable',IMPACT_TEXT:d.impactText||'Not specified',IMPACT_MINOR:d.impactLevel==='Minor'?'X':'',IMPACT_MAJOR:d.impactLevel==='Major'?'X':'',IMPACT_EXPEDITED:d.impactLevel==='Expedited'?'X':'',IMPACT_EMERGENCY:d.impactLevel==='Emergency'?'X':'',UAT_YES:d.uat==='Yes'?'X':'',UAT_NO:d.uat!=='Yes'?'X':'',REASON_BUGFIX:d.reason.startsWith('Bugfix')?'X':'',REASON_ENHANCEMENT:d.reason.startsWith('Enhancement')?'X':'',REASON_INFRA:d.reason.startsWith('Infrastructure')?'X':'',REASON_OTHERS:d.reason==='Other'?'X':'',
CHANGE_ADD:(d.changeTypes||[]).includes('Add / New')?'X':'',CHANGE_MODIFY:(d.changeTypes||[]).includes('Modify')?'X':'',CHANGE_DELETE:(d.changeTypes||[]).includes('Delete')?'X':'',ENV_PROD:d.env==='PROD'?'X':'',ENV_UAT:d.env==='UAT'?'X':'',ENV_DR:d.env==='DR'?'X':'',AFFECT_PARTIES_APP:mark('partiesAffected','Application/BRM'),AFFECT_PARTIES_INFRA:mark('partiesAffected','Infra'),AFFECT_PARTIES_SECURITY:mark('partiesAffected','Security'),AFFECT_PARTIES_VENDOR:mark('partiesAffected','Vendor (SL / DXC)'),AFFECT_PARTIES_OTHER:mark('partiesAffected','Others'),
AFFECT_COMPONENT_APP:mark('componentAffected','Application'),AFFECT_COMPONENT_HARDWARE:mark('componentAffected','Hardware/Network'),AFFECT_COMPONENT_RULES:mark('componentAffected','Procedural / Rules'),AFFECT_COMPONENT_DATABASE:mark('componentAffected','Database'),AFFECT_COMPONENT_OTHER:mark('componentAffected','Others'),
AFFECT_PROGRAMS_DATABASE:mark('programsAffected','Programs/Database'),AFFECT_PROGRAMS_PARAMETER:mark('programsAffected','Parameter *'),AFFECT_PROGRAMS_PATCHING:mark('programsAffected','Data Patching**'),AFFECT_PROGRAMS_RULES:mark('programsAffected','Rules / Configuration'),AFFECT_PROGRAMS_OTHER:mark('programsAffected','Others'),
PARTIES_OTHER_TEXT:(d.partiesAffected||[]).includes('Others')?d.partiesOther||'':'',COMPONENT_OTHER_TEXT:(d.componentAffected||[]).includes('Others')?d.componentOther||'':'',PROGRAMS_OTHER_TEXT:(d.programsAffected||[]).includes('Others')?d.programsOther||'':'',PARTIES_LIST:[...(d.partiesAffected||[]).filter(x=>x!=='Others'),...((d.partiesAffected||[]).includes('Others')?['Others: '+(d.partiesOther||'')]:[])].join(', '),COMPONENTS_LIST:[...(d.componentAffected||[]).filter(x=>x!=='Others'),...((d.componentAffected||[]).includes('Others')?['Others: '+(d.componentOther||'')]:[])].join(', '),PROGRAMS_LIST:[...(d.programsAffected||[]).filter(x=>x!=='Others'),...((d.programsAffected||[]).includes('Others')?['Others: '+(d.programsOther||'')]:[])].join(', '),APP_SERVER_LIST:selected().flatMap(a=>a.nodes.map((n,i)=>`${a.name} — Node ${i+1}: ${n.host} (${n.ip})`)).join('\n')||'Not applicable',DATABASE_SERVER_INFO:d.sqlInvolved==='Yes'?'SQL/Database — refer to approved database connection details':'Not applicable',SQL_UPDATES:d.sqlInvolved==='Yes'?effectiveSqlFiles().map(f=>f.name).join('\n'):'Not applicable',SQL_FALLBACKS:d.sqlInvolved==='Yes'?effectiveSqlFiles().map(f=>f.fallbackName).join('\n'):'Not applicable',IMPACT_RELEASE:`Affected components: ${names}\nService impact: ${d.impactText||'To be confirmed'}\nDowntime: ${downtime}${d.downtime==='Yes'?' — '+(d.downtimeReason||'Reason to be confirmed'):''}\nActivity window: ${fmtDate(d.startDate)} ${d.startTime||'—'} to ${fmtDate(d.endDate)} ${d.endTime||'—'}`,RELEASE_TRACKING:'',_plan:p};}
function loadBase64(b64){const clean=atob(b64);const out=new Uint8Array(clean.length);for(let i=0;i<clean.length;i++)out[i]=clean.charCodeAt(i);return out}
function parseXml(s){const x=new DOMParser().parseFromString(s,'application/xml');if(x.getElementsByTagName('parsererror').length)throw Error('Template XML could not be parsed');return x}
function allLocal(el,name){return [...el.getElementsByTagName('*')].filter(e=>e.localName===name)}
function direct(el,name){return [...el.childNodes].filter(e=>e.nodeType===1&&e.localName===name)}
function writeText(node,val,ns){const parts=String(val??'').split('\n');node.textContent=parts[0];let cur=node;for(let i=1;i<parts.length;i++){const br=node.ownerDocument.createElementNS(ns,'w:br');cur.parentNode.insertBefore(br,cur.nextSibling);const t=node.ownerDocument.createElementNS(ns,'w:t');t.setAttribute('xml:space','preserve');t.textContent=parts[i];br.parentNode.insertBefore(t,br.nextSibling);cur=t;}}
function setWordCell(tc,val){const texts=allLocal(tc,'t');if(texts.length){writeText(texts[0],val,WORD_NS);texts.slice(1).forEach(e=>e.textContent='');return;}let p=direct(tc,'p')[0];if(!p){p=tc.ownerDocument.createElementNS(WORD_NS,'w:p');tc.appendChild(p)}let r=tc.ownerDocument.createElementNS(WORD_NS,'w:r'),t=tc.ownerDocument.createElementNS(WORD_NS,'w:t');r.appendChild(t);p.appendChild(r);writeText(t,val,WORD_NS)}
function tableRowExpand(doc,marker,rows){const trs=allLocal(doc,'tr'),tr=trs.find(r=>allLocal(r,'t').some(t=>t.textContent.includes(marker)));if(!tr)throw Error('Document template missing row marker '+marker);const parent=tr.parentNode;for(const values of rows){const clone=tr.cloneNode(true),cells=direct(clone,'tc');values.forEach((v,i)=>{if(cells[i])setWordCell(cells[i],v)});if((values[0]==='' && /^(Backup Procedures|Rollback Procedures|SQL\/DATABASE|POST-DEPLOYMENT|[A-Z][A-Z0-9 &()/-]+ — )/.test(values[1]||'')) || /^(PRE-DEPLOYMENT ACTIVITIES|DEPLOYMENT ACTIVITIES|POST-DEPLOYMENT ACTIVITIES)$/.test(values[0]||'')){for(const tc of cells){const pr=direct(tc,'tcPr')[0]||tc.ownerDocument.createElementNS(WORD_NS,'w:tcPr');if(!pr.parentNode)tc.insertBefore(pr,tc.firstChild);let sh=direct(pr,'shd')[0];if(!sh){sh=tc.ownerDocument.createElementNS(WORD_NS,'w:shd');pr.appendChild(sh)}sh.setAttributeNS(WORD_NS,'w:fill',values[0]===''?'D9D9D9':'DEE8EE');for(const r of allLocal(tc,'r')){let rp=direct(r,'rPr')[0];if(!rp){rp=tc.ownerDocument.createElementNS(WORD_NS,'w:rPr');r.insertBefore(rp,r.firstChild)}if(!direct(rp,'b').length)rp.appendChild(tc.ownerDocument.createElementNS(WORD_NS,'w:b'));}}}if(marker==='[[BACKUP_ROW]]'||marker==='[[RELEASE_STEP_ROW]]'){
const heading=values[0]===''&&/^(Backup Procedures|Rollback Procedures|SQL\/DATABASE|POST-DEPLOYMENT|[A-Z][A-Z0-9 &()_/-]+ — )/.test(values[1]||'');
for(const tc of cells){
let pr=direct(tc,'tcPr')[0];if(!pr){pr=tc.ownerDocument.createElementNS(WORD_NS,'w:tcPr');tc.insertBefore(pr,tc.firstChild)}
let shade=direct(pr,'shd')[0];if(!shade){shade=tc.ownerDocument.createElementNS(WORD_NS,'w:shd');pr.appendChild(shade)}
shade.setAttributeNS(WORD_NS,'w:fill',heading?'D9D9D9':'FFFFFF');
if(!heading)for(const run of allLocal(tc,'r')){const rp=direct(run,'rPr')[0];if(rp)direct(rp,'b').forEach(n=>rp.removeChild(n))}
}}
parent.insertBefore(clone,tr)}parent.removeChild(tr);}
function replaceWordTokens(doc,map){const re=/\{\{([A-Z0-9_]+)\}\}/g;const texts=allLocal(doc,'t');texts.forEach(t=>{const orig=t.textContent||'';if(!orig.includes('{{'))return;const next=orig.replace(re,(m,key)=>Object.hasOwn(map,key)?safeText(map[key]):m);if(next!==orig)writeText(t,next,WORD_NS)});}
function stepsToWord(items){return items.map(s=>{const detail=`${s.title}${s.commands?'\n'+s.commands:''}`;return [detail,s.host?`${s.app} / ${s.node} / ${s.host}`:`${s.app} / ${s.node}`,s.expectedAt||'']})}
function stagedWordRows(plan){const rows=[];for(const [title,items] of [['PRE-DEPLOYMENT ACTIVITIES',plan.pre],['DEPLOYMENT ACTIVITIES',plan.deploy],['POST-DEPLOYMENT ACTIVITIES',plan.post]]){rows.push([title,'','']);rows.push(...stepsToWord(items));}return rows;}
// Release-note format is built as adjacent, separately numbered backup/rollback groups.
function releaseBackupRows(plan){
 const rows=[],date=stamp(),d=state.draft;
 function section(kind,label,commands){rows.push(['',`${kind} Procedures (${label})`]);let count=0;for(const c of commands)rows.push([`${++count}.`,c]);}
 if(d.sqlInvolved==='Yes'){section('Backup','SQL/Database',['Back up current affected data in the database.','Prepare and verify the fallback SQL script(s).']);section('Rollback','SQL/Database',effectiveSqlFiles().map(f=>`Execute approved fallback SQL: ${f.fallbackName}`));}
 for(const a of selected()){
  const files=binaryArtifacts(a),xmls=xmlArtifacts(a);
  a.nodes.forEach((n,i)=>{
   const label=a.nodes.length===1?a.name:`${a.name} — ${n.host||`Node ${i+1}`}`;
   if(files.length){
    const path=docFolder(n.filePath);
    section('Backup',label,[`# cd ${path}`,...files.map(o=>validFileName(o.name)?`# mv ${o.name} backup/${o.name}.${date}`:'# REVIEW: missing or invalid JAR/WAR filename')]);
    section('Rollback',label,[`# cd ${path}`,...files.map(o=>validFileName(o.name)?`# rm -rf ${o.name}`:'# REVIEW: missing or invalid JAR/WAR filename'),...files.map(o=>validFileName(o.name)?`# mv backup/${o.name}.${date} ${o.name}`:'# REVIEW: missing or invalid JAR/WAR filename')]);
   }
   for(const group of xmlGroups(a,n,xmls)){
    const labelXml=group.label==='xml'?'xml':group.label;
    const suffix=a.nodes.length>1?` — ${n.host||`Node ${i+1}`}`:'';
    if(group.existing.length){
     section('Backup',labelXml+suffix,[`# cd ${docFolder(group.path)}`,...group.existing.map(o=>validFileName(o.name)?`# mv ${o.name} ${o.name}.${date}`:'# REVIEW: missing or invalid XML filename')]);
     section('Rollback',labelXml+suffix,[`# cd ${docFolder(group.path)}`,...group.existing.map(o=>validFileName(o.name)?`# rm -rf ${o.name}`:'# REVIEW: missing or invalid XML filename'),...group.existing.map(o=>validFileName(o.name)?`# mv ${o.name}.${date} ${o.name}`:'# REVIEW: missing or invalid XML filename')]);
    }
    if(group.newFiles.length)section('Rollback',`New ${labelXml==='xml'?'XML':labelXml} XML${suffix}`,[`# cd ${docFolder(group.path)}`,...group.newFiles.map(o=>validFileName(o.name)?`# After approval: rm -rf ${o.name}`:'# REVIEW: missing or invalid XML filename')]);
   }
  });
 }
 return rows.length?rows:[['','Not applicable']];
}
function releaseProcedureRows(plan){
 const rows=[],d=state.draft;
 function section(label){rows.push(['',label]);}
 function step(state,body){rows.push([`${++state.count}.`,body]);}
 if(d.sqlInvolved==='Yes'){const seq={count:0};section('SQL/DATABASE');effectiveSqlFiles().forEach(f=>step(seq,`Execute SQL before all other component deployments\n${f.name}\nVerify successful execution. Stop deployment if SQL execution fails.`));}
 for(const a of selected()){
  const files=binaryArtifacts(a),xmls=xmlArtifacts(a);
  a.nodes.forEach((n,i)=>{
   if(!files.length&&!xmls.length)return;
   const groupLabel=a.nodes.length===1?a.name:`${a.name} — ${n.host||`Node ${i+1}`} (${n.ip||'IP not set'})`;
   const backupLabel=a.nodes.length===1?a.name:`${a.name} — ${n.host||`Node ${i+1}`}`;
   const seq={count:0};section(groupLabel.toUpperCase());
   if(files.length){
    step(seq,`Check the status of the process\n${a.process||'# Process-check command not configured'}\n\nStop the ${a.name}\ncd ${docFolder(n.appPath)}\n${a.stop||'# STOP COMMAND NOT CONFIGURED'}`);
    step(seq,`Do the backup as following above Backup Procedures (${backupLabel})\nFor Rollback, please follow Rollback Procedures (${backupLabel})`);
    step(seq,`Release the file(s) to\ncd ${docFolder(n.filePath)}\n\nChange the permission of the file(s)\n${files.map(o=>validFileName(o.name)?`chmod 755 ${o.name}`:'# REVIEW: Missing or invalid JAR/WAR filename').join('\n')}`);
   }
   for(const group of xmlGroups(a,n,xmls)){
    const suffix=a.nodes.length>1?` — ${n.host||`Node ${i+1}`}`:'';
    const label=(group.label==='xml'?'xml':group.label)+suffix;
    section(`${group.label.toUpperCase()} — ${n.host||`Node ${i+1}`}`);
    if(group.existing.length)step(seq,`Do the backup as following above Backup Procedures (${label})\nFor Rollback, please follow Rollback Procedures (${label})`);
    step(seq,`Release the file(s) to\ncd ${docFolder(group.path)}\n\nFile Name:\n${group.files.map(o=>`- ${docFile(o.name)}`).join('\n')}`);
   }
   if(files.length){
    step(seq,`Start the ${a.name}\ncd ${docFolder(n.appPath)}\n${a.start||'# START COMMAND NOT CONFIGURED'}`);
    step(seq,`Verify the ${a.name} application on ${n.host||`Node ${i+1}`}\n${a.process||'# Verify service/process and application health'}\nProceed to the next node ONLY after verification succeeds.`);
   }else step(seq,`Verify XML changes on ${n.host||`Node ${i+1}`}\nConfirm the new XML files and configuration are valid.`);
   rows.push(['',`For rollback procedure. Please follow above step 1 to ${seq.count}.`]);
  });
 }
 section('POST-DEPLOYMENT / OVERALL VERIFICATION');
 const seq={count:0};for(const x of plan.post)step(seq,`${x.title}${x.commands?'\n'+x.commands:''}`);
 return rows.length?rows:[['','No deployment steps selected']];
}
const SIGNATURE_NS={
 wp:'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing',
 a:'http://schemas.openxmlformats.org/drawingml/2006/main',
 pic:'http://schemas.openxmlformats.org/drawingml/2006/picture',
 r:'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
};
function insertAfter(reference,node){reference.parentNode.insertBefore(node,reference.nextSibling)}
async function applySignature(doc,zip,role,marker){
 const sig=state.draft.signatures[role]||signatureDefaults();
 const targets=allLocal(doc,'t').filter(t=>t.textContent.includes(marker));
 if(!targets.length)return;
 let rid='';
 if(sig.mode==='image' && signatureImages[role]){
  const relPath='word/_rels/document.xml.rels',relDoc=parseXml(await zip.file(relPath).async('string'));
  const existing=allLocal(relDoc,'Relationship').map(r=>r.getAttribute('Id')).filter(Boolean);
  let n=1;while(existing.includes(`rId${n}`))n++;
  rid=`rId${n}`;
  const relNs='http://schemas.openxmlformats.org/package/2006/relationships';
  const rel=relDoc.createElementNS(relNs,'Relationship');
  rel.setAttribute('Id',rid);rel.setAttribute('Type','http://schemas.openxmlformats.org/officeDocument/2006/relationships/image');
  rel.setAttribute('Target',`media/releasedesk_signature_${role}.png`);
  relDoc.documentElement.appendChild(rel);zip.file(relPath,new XMLSerializer().serializeToString(relDoc));
  const contentPath='[Content_Types].xml',contentDoc=parseXml(await zip.file(contentPath).async('string'));
  if(!allLocal(contentDoc,'Default').some(x=>x.getAttribute('Extension')==='png')){
   const d=contentDoc.createElementNS('http://schemas.openxmlformats.org/package/2006/content-types','Default');
   d.setAttribute('Extension','png');d.setAttribute('ContentType','image/png');contentDoc.documentElement.appendChild(d);
   zip.file(contentPath,new XMLSerializer().serializeToString(contentDoc));
  }
  zip.file(`word/media/releasedesk_signature_${role}.png`,loadBase64(signatureImages[role].split(',')[1]));
 }
 let idx=0;
 for(const t of targets){
  const old=t.textContent;t.textContent=old.replace(marker,'');
  let ancestor=t;while(ancestor&&ancestor.localName!=='r')ancestor=ancestor.parentNode;
  if(!ancestor)continue;
  if(sig.mode==='typed'){
   const value=(sig.text||'').trim()||(role==='itcr'?state.draft.requestor:state.draft.pic)||'';
   if(!value)continue;
   const run=doc.createElementNS(WORD_NS,'w:r'),props=doc.createElementNS(WORD_NS,'w:rPr');
   const fonts=doc.createElementNS(WORD_NS,'w:rFonts');
   const font=['Segoe Script','Georgia','Times New Roman','Arial','Calibri'].includes(sig.font)?sig.font:'Segoe Script';
   fonts.setAttributeNS(WORD_NS,'w:ascii',font);fonts.setAttributeNS(WORD_NS,'w:hAnsi',font);
   props.appendChild(fonts);
   props.appendChild(doc.createElementNS(WORD_NS,'w:i'));
   if(sig.style==='boldItalic')props.appendChild(doc.createElementNS(WORD_NS,'w:b'));
   const size=doc.createElementNS(WORD_NS,'w:sz');size.setAttributeNS(WORD_NS,'w:val','24');props.appendChild(size);
   run.appendChild(props);const text=doc.createElementNS(WORD_NS,'w:t');text.textContent=value;run.appendChild(text);
   insertAfter(ancestor,run);
  }else if(sig.mode==='image' && rid){
   const docPr=930+idx+++(role==='itcr'?0:30);
   const markup=`<w:drawing xmlns:w="${WORD_NS}" xmlns:wp="${SIGNATURE_NS.wp}" xmlns:a="${SIGNATURE_NS.a}" xmlns:pic="${SIGNATURE_NS.pic}" xmlns:r="${SIGNATURE_NS.r}">
    <wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="1570000" cy="425000"/><wp:effectExtent l="0" t="0" r="0" b="0"/><wp:docPr id="${docPr}" name="Signature ${role}"/>
    <wp:cNvGraphicFramePr/><a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic>
    <pic:nvPicPr><pic:cNvPr id="0" name="Signature"/><pic:cNvPicPr/></pic:nvPicPr>
    <pic:blipFill><a:blip r:embed="${rid}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>
    <pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="1570000" cy="425000"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr>
    </pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing>`;
   const drawing=parseXml(markup).documentElement;
   const run=doc.createElementNS(WORD_NS,'w:r');run.appendChild(doc.importNode(drawing,true));insertAfter(ancestor,run);
  }
 }
}

async function wordExport(kind){
 const data=sourceData(),isBMMB=bank().code.toUpperCase()==='BMMB',file=kind==='itcr'?(isBMMB?'ITCR_BMMB_template.docx':'ITCR_Generic_template.docx'):(isBMMB?'Release_Note_template.docx':'Release_Note_Generic_template.docx'),zip=await JSZip.loadAsync(loadBase64(window.BUNDLED_TEMPLATES[file]));
 const doc=parseXml(await zip.file('word/document.xml').async('string'));
 if(kind==='itcr'){
  tableRowExpand(doc,'[[IMPLEMENT_ROW]]',stagedWordRows(data._plan));
  tableRowExpand(doc,'[[BACKOUT_ROW]]',stepsToWord(data._plan.rollback));
 }else if(isBMMB){
  tableRowExpand(doc,'[[FIXED_ROW]]',[["1.",`CTC ${data.CTC}${state.draft.mantis?' / Mantis '+state.draft.mantis:''}`,`${data.TICKET_TITLE} — ${data.REASON_TYPE}`]]);
  tableRowExpand(doc,'[[PROGRAM_ROW]]',data._plan.objects.length?data._plan.objects.map((o,i)=>[String(i+1)+'.',o.name||'[Filename]',o.version||'-',o.checksum||'TO BE FILLED DURING RELEASE']):[['1.','No deployment objects','-','-']]);
  tableRowExpand(doc,'[[BACKUP_ROW]]',releaseBackupRows(data._plan));
  tableRowExpand(doc,'[[RELEASE_STEP_ROW]]',releaseProcedureRows(data._plan));
 }else{
  tableRowExpand(doc,'[[PROGRAM_ROW]]',data._plan.objects.map(o=>[`${o.application}: ${o.name}`,o.version||'',o.checksum||'']));
  tableRowExpand(doc,'[[BACKUP_ROW]]',releaseBackupRows(data._plan));
  tableRowExpand(doc,'[[RELEASE_STEP_ROW]]',releaseProcedureRows(data._plan));
 }
 replaceWordTokens(doc,data);
 await applySignature(doc,zip,kind==='itcr'?'itcr':'release',kind==='itcr'?'{{ITCR_REQUESTOR_SIGNATURE}}':'{{RELEASE_PREPARED_SIGNATURE}}');
 zip.file('word/document.xml',new XMLSerializer().serializeToString(doc));
 return await zip.generateAsync({type:'blob',compression:'DEFLATE',compressionOptions:{level:6}});
}

function setXlsxCell(doc,row,ref,value,style){const c=doc.createElementNS(XLS_NS,'c');c.setAttribute('r',ref);if(style)c.setAttribute('s',style);c.setAttribute('t','inlineStr');const is=doc.createElementNS(XLS_NS,'is');const t=doc.createElementNS(XLS_NS,'t');t.setAttribute('xml:space','preserve');t.textContent=String(value==null?'':value);is.appendChild(t);c.appendChild(is);row.appendChild(c)}
function rowXlsx(doc,n,vals,styles){
 const r=doc.createElementNS(XLS_NS,'row');r.setAttribute('r',n);
 const content=String(vals.B||'');const lines=content.split('\n').reduce((sum,line)=>sum+Math.max(1,Math.ceil(line.length/86)),0);
 r.setAttribute('ht',String(Math.min(108,Math.max(23,lines*14+5))));r.setAttribute('customHeight','1');
 for(const col of ['A','B','C','D','E','F','G'])setXlsxCell(doc,r,`${col}${n}`,vals[col]??'',styles[col]||'');
 return r;
}
function stylesOf(sheet,r){const row=allLocal(sheet,'row').find(x=>x.getAttribute('r')===String(r));const o={};if(row)direct(row,'c').forEach(c=>{const ref=c.getAttribute('r')||'';o[ref.replace(/[0-9]/g,'')]=c.getAttribute('s')||''});return o}
function replaceSheetText(doc,ref,value){const c=allLocal(doc,'c').find(x=>x.getAttribute('r')===ref);if(!c)return;c.setAttribute('t','inlineStr');[...c.childNodes].filter(x=>x.nodeType===1&&(x.localName==='v'||x.localName==='is')).forEach(e=>c.removeChild(e));const is=doc.createElementNS(XLS_NS,'is');const t=doc.createElementNS(XLS_NS,'t');t.textContent=value;is.appendChild(t);c.appendChild(is)}
function updateDimension(doc,end){const dim=allLocal(doc,'dimension')[0];if(dim)dim.setAttribute('ref',`B1:I${end}`)}
// The worksheet style IDs, palette, fonts, column widths, borders, and headers
// are sourced directly from the BMMB October 2026 supplied Excel sample.
function sampleRow(doc,num,values,styleMap,columns,ht=18){
 const row=doc.createElementNS(XLS_NS,'row');row.setAttribute('r',String(num));
 row.setAttribute('ht',String(ht));row.setAttribute('customHeight','1');
 for(const col of columns)setXlsxCell(doc,row,`${col}${num}`,values[col]??'',styleMap[col]||'');
 return row;
}
async function excelExport(){
 const d=state.draft,plan=buildPlan();
 const zip=await JSZip.loadAsync(loadBase64(window.BUNDLED_TEMPLATES['Deployment_Checklist_template.xlsx']));
 const cols1=['B','C','D','E','F','G','H','I'];
 const cols2=['B','C','D','E','F','G','H','I','J','K','L'];
 const title=`${d.env==='PROD'?'Production':d.env} Deployment - ${fmtDate(d.startDate)} (${bank().code})`;
 const meta=`CTC: ${d.ctc||'—'}   Mantis: ${d.mantis||'—'}   Activity: ${fmtDate(d.startDate)} ${d.startTime||'—'} to ${fmtDate(d.endDate)} ${d.endTime||'—'}   Downtime: ${downtimeSummary()}`;
 // Deployment sheet: keep original rows 1-3 and all original colors/font/styles.
 {
  const path='xl/worksheets/sheet1.xml',doc=parseXml(await zip.file(path).async('string')),sh=allLocal(doc,'sheetData')[0];
  const styles={section:stylesOf(doc,4),group:stylesOf(doc,5),task:stylesOf(doc,6),command:stylesOf(doc,7),space:stylesOf(doc,9)};
  replaceSheetText(doc,'B1',title);
  direct(sh,'row').filter(r=>Number(r.getAttribute('r'))>=4).forEach(r=>sh.removeChild(r));
  // Original row 2 is a thin blank spacer. Use it for a short information line.
  let row2=direct(sh,'row').find(r=>r.getAttribute('r')==='2');
  if(!row2){row2=doc.createElementNS(XLS_NS,'row');row2.setAttribute('r','2');const row3=direct(sh,'row').find(x=>x.getAttribute('r')==='3');sh.insertBefore(row2,row3)}
  direct(row2,'c').forEach(c=>row2.removeChild(c));
  row2.setAttribute('ht','25');row2.setAttribute('customHeight','1');
  setXlsxCell(doc,row2,'B2',meta,styles.group.B||'');
  for(const col of cols1.slice(1))setXlsxCell(doc,row2,`${col}2`,'',styles.group[col]||'');
  // Merge metadata text across all eight sample columns, keeping the original title/header layout.
  const merges=allLocal(doc,'mergeCells')[0];if(merges){
   if(!direct(merges,'mergeCell').some(el=>el.getAttribute('ref')==='B2:I2')){
    const mc=doc.createElementNS(XLS_NS,'mergeCell');mc.setAttribute('ref','B2:I2');merges.appendChild(mc);
   }
   merges.setAttribute('count',String(direct(merges,'mergeCell').length));
  }
  let rn=4,lastApp='',taskNo=0;
  const push=(vals,sty,height)=>sh.appendChild(sampleRow(doc,rn++,vals,sty,cols1,height));
  function section(letter,name){lastApp='';push({E:letter,F:name},styles.section,23)}
  function group(s){const name=s.app.toUpperCase();if(name!==lastApp){lastApp=name;push({F:name},styles.group,21)}}
  function step(x){group(x);
   const at=String(x.expectedAt||'').split(' '),humanNode=x.host?`${x.app} ${x.node.replace('Node','').trim()} / ${x.host}`:x.app;
   push({B:at[0]||'',C:at[1]||'',D:'',E:'',F:x.title,G:d.pic||'',H:'',I:humanNode},styles.task,22);
   for(const line of String(x.commands||'').split('\n').filter(Boolean))push({F:line},styles.command,line.length>88?28:19);
   if(x.note)push({F:`Note: ${x.note}`},styles.command,x.note.length>88?30:19);
   push({},styles.space,9);
  }
  section('A.','PRE DEPLOYMENT ACTIVITIES');plan.pre.forEach(step);
  section('B.','DEPLOYMENT ACTIVITIES');plan.deploy.forEach(step);
  section('C.','POST DEPLOYMENT ACTIVITIES');plan.post.forEach(step);
  const dim=allLocal(doc,'dimension')[0];if(dim)dim.setAttribute('ref',`B1:I${rn-1}`);
  zip.file(path,new XMLSerializer().serializeToString(doc));
 }
 // Fallback sheet: exact original 12-column layout and border styles.
 {
  const path='xl/worksheets/sheet2.xml',doc=parseXml(await zip.file(path).async('string')),sh=allLocal(doc,'sheetData')[0];
  const styles={group:stylesOf(doc,3),task:stylesOf(doc,4),command:stylesOf(doc,5),space:stylesOf(doc,6)};
  direct(sh,'row').filter(r=>Number(r.getAttribute('r'))>=2).forEach(r=>sh.removeChild(r));
  let rn=2,number=0,lastApp='';
  const push=(values,sty,h)=>sh.appendChild(sampleRow(doc,rn++,values,sty,cols2,h));
  push({B:'Fall back'},styles.group,20);
  for(const x of plan.rollback){
   if(x.app!==lastApp){lastApp=x.app;push({B:String(++number),D:x.app.toUpperCase(),J:x.app.toUpperCase(),K:d.pic||'',L:''},styles.group,21)}
   const host=x.host?`${x.app} ${x.node.replace('Node','').trim()} / ${x.host}`:x.app;
   push({D:host,J:x.title},styles.task,20);
   for(const line of String(x.commands||'').split('\n').filter(Boolean))push({D:host,J:line},styles.command,line.length>65?29:19);
   if(x.note)push({D:host,J:`Note: ${x.note}`},styles.command,x.note.length>65?31:19);
   push({},styles.space,8);
  }
  const dim=allLocal(doc,'dimension')[0];if(dim)dim.setAttribute('ref',`B1:L${rn-1}`);
  zip.file(path,new XMLSerializer().serializeToString(doc));
 }
 return await zip.generateAsync({type:'blob',compression:'DEFLATE',compressionOptions:{level:6}});
}
function trigger(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),8000)}
const baseName=()=>`${bank().code}_${state.draft.env}_${state.draft.ctc||'DRAFT'}_${stamp()}`.replace(/[^a-zA-Z0-9_-]/g,'_');
async function doDownload(which){try{let blob,name;if(which==='itcr'){blob=await wordExport('itcr');name=`ITCR_${baseName()}.docx`;}else if(which==='release'){blob=await wordExport('release');name=`Release_Note_${baseName()}.docx`;}else{blob=await excelExport();name=`Deployment_Checklist_${baseName()}.xlsx`;}trigger(blob,name);notify(`${name} generated successfully.`,'success')}catch(e){console.error(e);notify(`Generation failed: ${e.message}`,'error')}}
function notify(msg,type='success'){const h=$('#alertHost');h.innerHTML=`<div class="notice ${type}">${escapeHtml(msg)}</div>`;clearTimeout(saveTimer);saveTimer=setTimeout(()=>{h.innerHTML=''},6000)}
function downloadJson(kind='all'){let payload=kind==='draft'?{format:'ReleaseDesk-Draft-v1',draft:state.draft}:{format:'ReleaseDesk-Backup-v1',...state};trigger(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),`${kind==='draft'?'deployment-draft':'releasedesk-backup'}-${stamp()}.json`)}
function ensureArtifacts(a){state.draft.artifacts[a.id]=activeArtifacts(a).map(x=>({...x}));}
function onDocChange(e){const el=e.target;
 if(el.dataset.signatureField){const role=el.dataset.signatureRole;state.draft.signatures[role][el.dataset.signatureField]=el.value;persist();if(el.dataset.signatureField==='mode')refreshSignaturePanels();return;}
 if(el.dataset.changeType!==undefined){const a=state.draft.changeTypes||[];state.draft.changeTypes=el.checked?[...new Set([...a,el.value])]:a.filter(x=>x!==el.value);persist();return;}
 if(el.dataset.draft){state.draft[el.dataset.draft]=el.value;if(el.dataset.draft==='sqlInvolved'&&el.value==='Yes'&&!state.draft.sqlFiles.length)state.draft.sqlFiles.push({name:'',fallbackName:''});if(el.dataset.draft==='bankId'){state.draft.selectedAppIds=[];state.draft.artifacts={};state.settingsBankId=el.value;}updateDetailBits();persist();}
 if(el.dataset.richField){state.draft[el.dataset.richField]=el.innerHTML;persist();}
 if(el.dataset.sqlField){const entry=state.draft.sqlFiles[Number(el.dataset.sqlIdx)];if(entry){entry[el.dataset.sqlField]=el.value;persist()}}
 if(el.dataset.xmlField){const entry=state.draft.xmlArtifacts[el.dataset.xmlApp]?.[Number(el.dataset.xmlIdx)];if(entry){entry[el.dataset.xmlField]=el.value;persist()}}
 if(el.dataset.object){const a=appById(el.dataset.aid);if(!a)return;ensureArtifacts(a);state.draft.artifacts[a.id][Number(el.dataset.idx)][el.dataset.object]=el.value;persist();}
 if(el.dataset.appField){const a=appById(el.dataset.app,state.banks.find(b=>b.id===state.settingsBankId));if(a){a[el.dataset.appField]=el.value;persist();}}
 if(el.dataset.nodeField){const a=appById(el.dataset.app,state.banks.find(b=>b.id===state.settingsBankId));if(a?.nodes[Number(el.dataset.node)]){a.nodes[Number(el.dataset.node)][el.dataset.nodeField]=el.value;persist();}}
 if(el.dataset.bankField){const b=state.banks.find(b=>b.id===el.dataset.bid);if(b){b[el.dataset.bankField]=el.value;persist();}}
}
function onClick(e){const t=e.target.closest('button');if(!t)return;
 if(t.dataset.view){showView(t.dataset.view);return}if(t.dataset.go){showView(t.dataset.go);return}
 if(t.dataset.tab){planTab=t.dataset.tab;renderPlanPreview();return}
 if(t.dataset.rich){const editor=$('#'+t.dataset.target);editor.focus();document.execCommand(t.dataset.rich,false,null);state.draft[t.dataset.target]=editor.innerHTML;persist();return}
 if(t.id==='startNextBtn'){if(cleanDocuments().length)showView('details');return}
 if(t.dataset.clearSignature){signatureImages[t.dataset.clearSignature]=null;const input=$(`[data-signature-upload="${t.dataset.clearSignature}"]`);if(input)input.value='';refreshSignaturePanels();return}
 if(t.id==='addSqlBtn'){state.draft.sqlFiles.push({name:'',fallbackName:''});persist();renderSqlFiles();return}
 if(t.dataset.removeSql!==undefined){state.draft.sqlFiles.splice(Number(t.dataset.removeSql),1);persist();renderSqlFiles();return}
 if(t.dataset.addXml){(state.draft.xmlArtifacts[t.dataset.addXml]??=[]).push({name:'',change:'new'});persist();renderApplications();return}
 if(t.dataset.removeXml){state.draft.xmlArtifacts[t.dataset.removeXml]?.splice(Number(t.dataset.xmlIdx),1);persist();renderApplications();return}
 if(t.dataset.addObject){const a=appById(t.dataset.addObject);if(a){ensureArtifacts(a);state.draft.artifacts[a.id].push({name:'',type:a.type,version:'',checksum:''});persist();renderApplications()}return}
 if(t.dataset.removeObject){const a=appById(t.dataset.removeObject);if(a){ensureArtifacts(a);if(state.draft.artifacts[a.id].length>1){state.draft.artifacts[a.id].splice(Number(t.dataset.idx),1);persist();renderApplications();}}return}
 const b=state.banks.find(x=>x.id===state.settingsBankId)||bank();
 if(t.dataset.addNode){const a=appById(t.dataset.addNode,b);if(a){const previous=a.nodes.at(-1)||defaultNode('','','','');a.nodes.push({...previous,host:'',ip:''});persist();renderConfig()}return}
 if(t.dataset.removeNode){const a=appById(t.dataset.removeNode,b);if(a&&a.nodes.length>1&&confirm(`Remove node ${Number(t.dataset.nodeIndex)+1} from ${a.name}?`)){a.nodes.splice(Number(t.dataset.nodeIndex),1);persist();renderConfig()}return}
 if(t.dataset.deleteApp){const a=appById(t.dataset.deleteApp,b);if(a&&confirm(`Delete ${a.name} from ${b.code}?`)){b.apps=b.apps.filter(x=>x.id!==a.id);state.draft.selectedAppIds=state.draft.selectedAppIds.filter(x=>x!==a.id);persist();renderConfig()}return}
 if(t.id==='addBankBtn'){const code=prompt('Bank code (e.g. KBANK):');if(!code)return;const name=prompt('Full bank name:',code);if(!name)return;const id=slug(code)+Date.now().toString(36);state.banks.push({id,code:code.toUpperCase(),name,apps:[]});state.settingsBankId=id;persist();initFields();renderConfig();return}
 if(t.id==='addAppBtn'){const name=prompt('New application name:');if(!name)return;const type=prompt('Artifact type: jar or war?','jar');if(type!=='jar'&&type!=='war'){notify('Only jar and war types are supported.','error');return}const id=slug(name)+Date.now().toString(36);b.apps.push(app(id,name,type,'',[defaultNode('','','','')],'','',''));persist();renderConfig();return}
 if(t.id==='importBtn'){ $('#fileImport').click();return}
 if(t.id==='resetBtn'){if(confirm('Clear this deployment draft? Bank configurations will be preserved.')){const id=state.draft.bankId;state.draft=freshDraft();state.draft.bankId=id;signatureImages={itcr:null,release:null};persist();initFields();showView('start')}return}
 if(t.id==='backupBtn'){downloadJson();return}
 if(t.id==='exportDraftBtn'){downloadJson('draft');return}
 if(t.id==='downloadITCR')return doDownload('itcr');if(t.id==='downloadChecklist')return doDownload('checklist');if(t.id==='downloadRelease')return doDownload('release');
 if(t.id==='downloadAll'){(async()=>{for(const type of cleanDocuments()){await doDownload(type);await new Promise(r=>setTimeout(r,250))}})();return}
}
async function fileImport(e){const f=e.target.files[0];if(!f)return;try{const parsed=JSON.parse(await f.text());if(parsed.format==='ReleaseDesk-Backup-v1'&&Array.isArray(parsed.banks)&&parsed.draft){if(!confirm('Replace current configuration and draft with this backup?'))return;state={banks:parsed.banks,draft:parsed.draft,settingsBankId:parsed.settingsBankId||parsed.draft.bankId};}else if(parsed.format==='ReleaseDesk-Draft-v1'&&parsed.draft){state.draft=parsed.draft;}else throw Error('Not a ReleaseDesk export file');Object.keys(freshDraft()).forEach(k=>{if(state.draft[k]===undefined)state.draft[k]=structuredClone(freshDraft()[k])});if(!Array.isArray(state.draft.sqlFiles))state.draft.sqlFiles=[];if(!state.draft.xmlArtifacts)state.draft.xmlArtifacts={};if(!state.draft.includeBinary)state.draft.includeBinary={};if(!Array.isArray(state.draft.changeTypes))state.draft.changeTypes=state.draft.changeType?[state.draft.changeType]:[];signatureImages={itcr:null,release:null};persist();initFields();if(!Array.isArray(state.draft.documents))state.draft.documents=[...DOCUMENT_TYPES];if(!state.draft.signatures)state.draft.signatures={};for(const role of ['itcr','release'])state.draft.signatures[role]={...signatureDefaults(),...(state.draft.signatures[role]||{})};showView('start');notify('Data restored successfully.')}catch(error){notify(`Import failed: ${error.message}`,'error')}finally{e.target.value=''}}
async function handleSignatureUpload(input){
 const file=input.files?.[0],role=input.dataset.signatureUpload;
 if(!file)return;
 if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>4*1024*1024){notify('Choose a PNG, JPG or WebP image smaller than 4 MB.','error');input.value='';return;}
 try{
  const bmp=await createImageBitmap(file);
  const ratio=Math.min(1,680/bmp.width,190/bmp.height);
  const canvas=document.createElement('canvas');canvas.width=Math.round(bmp.width*ratio);canvas.height=Math.round(bmp.height*ratio);
  const ctx=canvas.getContext('2d');ctx.drawImage(bmp,0,0,canvas.width,canvas.height);bmp.close();
  signatureImages[role]=canvas.toDataURL('image/png');refreshSignaturePanels();
 }catch(e){notify('Unable to read the selected signature image.','error');input.value='';}
}
document.addEventListener('input',onDocChange);document.addEventListener('change',e=>{
 if(e.target.dataset.documentChoice){const k=e.target.dataset.documentChoice,arr=state.draft.documents||[];
  state.draft.documents=e.target.checked?[...new Set([...arr,k])]:arr.filter(x=>x!==k);persist();refreshDocumentChoices();return;
 }
 if(e.target.dataset.signatureUpload){handleSignatureUpload(e.target);return;}

 if(e.target.dataset.affectedGroup){const key=e.target.dataset.affectedGroup,arr=state.draft[key]||[],value=e.target.value;state.draft[key]=e.target.checked?[...new Set([...arr,value])]:arr.filter(x=>x!==value);persist();}
 if(e.target.dataset.binaryApp){state.draft.includeBinary[e.target.dataset.binaryApp]=e.target.checked;persist();renderApplications()}
 if(e.target.dataset.chooseApp){const id=e.target.dataset.chooseApp,arr=state.draft.selectedAppIds;if(e.target.checked){if(!arr.includes(id))arr.push(id);const a=appById(id);if(a)ensureArtifacts(a);}else{state.draft.selectedAppIds=arr.filter(x=>x!==id)}persist();renderApplications()}
 if(e.target.dataset.draft==='xmlInvolved'){renderApplications()}
 if(e.target.id==='settingsBank'){state.settingsBankId=e.target.value;persist();renderConfig()}
 onDocChange(e);
});document.addEventListener('click',onClick);$('#fileImport').addEventListener('change',fileImport);
initFields();showView('start');
// Public regression-test hook, no server or remote execution.
window.ReleaseDeskTest={state,buildPlan,sourceData,wordExport,excelExport,showView,effectiveSqlFiles,downtimeSummary, signatureImages, cleanDocuments, setSignatureImage:(role,data)=>{signatureImages[role]=data;refreshSignaturePanels()}};
})();
