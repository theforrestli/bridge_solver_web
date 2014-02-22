

function wpbdg_getEntity(){
    //TODO get single nearest entity
    
}
function wpbdg_tap(e){
    wpbdg.upateNewP(e);
    var element=wpbdg.bridge.getNearestEntity(wpbdg.newP,2);  
    if(element!=null){
        element.selected^=true;
        wpbdg.update_select();
    }
}
function wpbdg_doubletap(e){
    var element=wpbdg.bridge.getNearestEntity(wpbdg.newP,2);  
    wpbdg.bridge.deselectAll();
    if(element!=null){
        element.selected=true;
    }
    wpbdg.update_select();
}
function wpbdg_release(e){
    if(wpbdg.drag){
        //TODO move joint
    }
    wpbdg.hold=false;
    wpbdg.drag=false;
}
function wpbdg_hold(e){
    wpbdg.hold=true;
    wpbdg.bridge.deselectAll();
    wpbdg.updateNewP(e);
    wpbdg.oldP.x=wpbdg.newP.x;
    wpbdg.oldP.y=wpbdg.newP.y;
    wpbdg.update_select();
}
function wpbdg_drag(e){
    wpbdg.drag=true;
    wpbdg.updateNewP(e);
    
    if(wpbdg.hold==true){
        //TODO draw box
    }else{
        //TODO draw skeleton
    }
}
