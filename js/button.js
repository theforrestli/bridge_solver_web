function wpbdg_undo(){
    wpbdg.manager.undo();
    if(!wpbdg.manager.undoable()){
        $("wpbd_undo").button("disable");
    }
    wpbdg.update();
}
function wpbdg_redo(){
    wpbdg.manager.redo();
    if(!wpbdg.manager.redoable()){
        $("wpbd_redo").button("disable");
    }
    wpbdg.update();
}
function wpbdg_analyze(){
    wpbdg.result=wpbd_analyze(wpbdg.bridge,null);
    var members=wpbdg.bridge.members;
    var size=members.length;
    for(var i=0;i<size;i++){
        var m=members[i];
        m.compressionForceStrengthRatio=wpbdg.result.maxMemberCompressiveForces[i]/wpbd_compressiveStrength(m.material,m.shape,m.getLength());
        m.tensionForceStrengthRatio=wpbdg.result.maxMemberTensileForces[i]/wpbd_tensileStrength(m.material, m.shape);
    }
    wpbdg.updateFlag("analyze");
    wpbdg.update();
}
function wpbdg_delete(){
    var order=wpbdg.bridge.tryDelete();
    wpbdg.manager.doOrder(order);
    wpbdg.update();
}
function wpbdg_addjoint(){
    //TODO
}
function wpbdg_addmember(){
    var mt=wpbdg.mt_select.val();
    var cs=wpbdg.cs_select.val();
    var wd=wpbdg.wd_select.val();
    if(mt==-1||cs==-1||wd==-1){
        return;
    }
    var order=wpbdg.bridge.tryAddMember(mt,cs,wd);
    wpbdg.manager.doOrder(order);
    wpbdg.update();
}
