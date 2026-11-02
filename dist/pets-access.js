// Transient host availability only. Ownership/acquisition remains in canonical services.
export function petsAccessAllowed({run=false,menu=false,returning=false,tutorial=false,dialogOpen=false,dialogKind=''}){
 return !run&&!menu&&!returning&&!tutorial&&(!dialogOpen||dialogKind==='pets');
}
