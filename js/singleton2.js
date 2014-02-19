
function wpbdg_singleton(){
    var f={};
    f.hold=false;
    f.drag=false;
    f.oldP={"x":0,"y":0};
    f.newP={"x":0,"y":0};
    f.bridge=wpbd_bridge_new();
    f.undoManager=wpbd_manager_new(f.bridge);
    //f.selecteds=[]; TODO what else?
    f.cv1=documents.getElementById("wpbd_cv1");
    var tmp=Hammer(f.cv1);
    tmp.on("tap",wpbdg_tap);
    tmp.on("doubletap",wpbdg_doubletap);
    tmp.on("release",wpbdg_release);
    tmp.on("hold",wpbdg_hold);
    tmp.on("drag",wpbdg_drag);
    tmp.on("tap",wpbdg_tap);
}
function wpbdg_cloneCanvas(canvas){
    var f=documents.createElement("canvas");
    f.width=canvas.width;
    f.height=canvas.height;
}
