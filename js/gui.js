

function wpbdg_getEntity(){
    //TODO get single nearest entity
}
function wpbdg_tap(e){
    wpbdg_upateNewP(e);
    var element=wpbdg_getEntity(e);  
    if(element!=null){
        element.selected^=true;
        wpbdg.update_select();
    }
}
function wpbdg_doubletap(e){
    var element=wpbdg_getEntity(e);  
    wpbdg_deselectAll();
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
    wpbdg_deselectAll();
    wpbdg_updateNewP(e);
    wpbdg.oldP.x=wpbdg.newP.x;
    wpbdg.oldP.y=wpbdg.newP.y;
    wpbdg.update_select();
}
function wpbdg_drag(e){
    wpbdg.drag=true;
    wpbdg_updateNewP(e);
    
    if(wpbdg.hold==true){
        //TODO draw box
    }else{
        //TODO draw skeleton
    }

}
function wpbdg_deselectAll(){
    wpbdg.bridge.joints.forEach(function(e){
        e.selected=false;
    });
    wpbdg.bridge.members.forEach(function(e){
        e.selected=false;
    });
}
function wpbdg_updateNewP(e){
    //TODO update wpbdg.newP
}
