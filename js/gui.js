

function wpbdg_getEntity(){
    //TODO get single nearest entity
    
}
function wpbdg_tap(e){
    wpbdg.updateNewP(e);
    var element=wpbdg.bridge.getNearestEntity(wpbdg.newP,2);  
    console.debug(element);
    if(element!=null){
        element.selected^=true;
        wpbdg.update_select();
    }
}
function wpbdg_doubletap(e){
    var element=wpbdg.bridge.getNearestEntity(wpbdg.newP);  
    wpbdg.bridge.deselectAll();
    if(element!=null){
        element.selected=true;
    }
    wpbdg.update_select();
}
function wpbdg_release(e){
    if(wpbdg.drag){
        if(wpbdg.hold){
            //TODO select box
            var x=wpbdg.newP.x;
            var y=wpbdg.newP.y;
            wpbdg.bridge.getBoxEntities(x,y,x-wpbdg.deltaP.x,y-wpbdg.deltaP.y).forEach(function(e){
                e.selected=true;
            });
        }else{
            //TODO move joint
        }
    }
    wpbdg.deltaP.x=0;
    wpbdg.deltaP.y=0;
    wpbdg.hold=false;
    wpbdg.drag=false;
    wpbdg.update_select();
}
function wpbdg_hold(e){
    wpbdg.hold=true;
    wpbdg.bridge.deselectAll();
    wpbdg.updateNewP(e);
    wpbdg.update_select();
}
function wpbdg_drag(e){
    wpbdg.drag=true;
    wpbdg.updateNewP(e);
    wpbdg.updateDeltaP(e);
    
    if(wpbdg.hold==true){
        //TODO draw box
    }else{
        //TODO draw skeleton
    }
    wpbdg.update_select();
}
