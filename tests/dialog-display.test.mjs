import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const runtime=fs.readFileSync(new URL('../dist/run.js',import.meta.url),'utf8');
function fixture(){
 const events={},tasks=[],nodes={};let cleanup=0,returned=0;
 const dialog=nodes.dialog={open:false,inert:false,dataset:{},classList:{toggle(){}},querySelector(){return null;},addEventListener(type,fn){events[type]=fn;},showModal(){this.open=true;},close(){this.open=false;tasks.push(()=>events.close());}};
 nodes.dialogBody={children:[],set innerHTML(value){this.children=value?[value]:[];},replaceChildren(...children){this.children=children;}};
 nodes.dialogLabel={};nodes.close={};nodes.world={};nodes.openPets={};
 const ctx=vm.createContext({$:id=>nodes[id],s:{run:null},world:{cancelRefugeMovement(){}},document:{activeElement:nodes.world},music:{silence(){}},captureControlFocus(){},releaseForgePresentation(){},releaseReliquaryPresentation(){},installGlobalFinish(){},applyDialogUI(){},cancelDialogUI(){},queueMicrotask:fn=>tasks.push(fn),tutorial:null,minerGame:{leave(){}},zagGame:{leave(){}},stopRecordPreview(){},treeSound:{setOpen(){}},performance:{now:()=>1},syncPetsAccess(){},restoreControlFocus(){},restoreDialogOpener(){returned++;},petsHostEligible:()=>true});
 const start=runtime.indexOf('let dialogOpener=null;'),end=runtime.indexOf('function showResult()',start);
 assert(start>0&&end>start);vm.runInContext("let dialogKind='',lastFrame=0,finishMode=false;\n"+runtime.slice(start,end),ctx);
 const exec=code=>vm.runInContext(code,ctx),flush=()=>{while(tasks.length)tasks.shift()();};
 return {dialog,nodes,ctx,exec,flush,open(kind='tree'){exec(`openDialog('Test','','${kind}')`);nodes.dialogBody.children.push(kind);ctx.countCleanup=()=>cleanup++;exec('approvedServiceCleanup=countCleanup');},get cleanup(){return cleanup;},get returned(){return returned;},nativeEscape(){dialog.open=false;tasks.push(()=>events.close());}};
}
test('X closes and disables the approved host immediately, then releases its retained UI',()=>{
 const f=fixture();f.open();f.flush();assert.equal(f.dialog.open,true);assert.equal(f.dialog.inert,false);f.nodes.close.onclick();assert.equal(f.dialog.open,false);assert.equal(f.dialog.inert,true);f.flush();assert.deepEqual(f.nodes.dialogBody.children,[]);assert.equal(f.cleanup,1);assert.equal(f.returned,1);
});
test('native Escape performs cleanup; repeated services never retain interactive closed content',()=>{
 const f=fixture();for(const kind of ['tree','forge','missions','pets','records','stars','wardrobe','rest','lift','help']){f.open(kind);f.flush();f.nativeEscape();f.flush();assert.equal(f.dialog.inert,true);assert.deepEqual(f.nodes.dialogBody.children,[]);}assert.equal(f.cleanup,10);
});
test('queued old close cannot delete a new service opened in the same task',()=>{
 const f=fixture();f.open('tree');f.nodes.close.onclick();f.open('forge');f.flush();assert.equal(f.dialog.open,true);assert.equal(f.dialog.inert,false);assert.equal(f.dialog.dataset.service,'forge');assert.deepEqual(f.nodes.dialogBody.children,['forge']);assert.equal(f.cleanup,1);f.nodes.close.onclick();f.flush();assert.equal(f.cleanup,2);
});
test('elevator descent clears the modal while the cave continues independently',()=>{
 const f=fixture();f.open('lift');f.flush();f.exec('closeDialog();s.run={room:{cleared:false}}');f.flush();assert.equal(f.dialog.open,false);assert.equal(f.dialog.inert,true);assert.deepEqual(f.nodes.dialogBody.children,[]);assert.equal(f.ctx.s.run.room.cleared,false);
});
test('approved sizing only forces display for open dialogs; closed host is explicitly non-interactive',()=>{
 const css=fs.readFileSync(new URL('../dist/approved-services-shell.css',import.meta.url),'utf8');
 assert.match(css,/body #dialog\.approved-ui-dialog\[data-service\]\[open\]\s*\{\s*display:block!important/);
 assert.match(css,/body #dialog\.approved-ui-dialog\[data-service\]:not\(\[open\]\)\s*\{\s*display:none!important;pointer-events:none!important/);
 assert.doesNotMatch(css,/body #dialog\.approved-ui-dialog\[data-service\]\s*\{\s*display:block/);
});
