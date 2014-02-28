
function wpbdg_update_geometry() {
    /* Some orientation changes leave the scroll position at something
     * that isn't 0,0. This is annoying for user experience. */
    scroll(0, 0);

    /* Calculate the geometry that our content area should take */
    var header = $("#wpbd_header");
    var content = $("#wpbd_content");
    var viewport_height = $(window).height();
    
    var content_height = viewport_height - header.outerHeight();
    
    /* Trim margin/border/padding height */
    content_height -= (content.outerHeight() - content.height());
    content.height(content_height);
    //$(".wpbd_row").css("height",content_height);
    wpbdg.cv1.height=0;
    wpbdg.updateFlag(1);
    wpbdg.update();
}

function wpbdg_tap(e){
    if(e.srcElement==wpbdg.cv1){
        wpbdg.updateNewP(e);
        var element=wpbdg.bridge.getNearestEntity(wpbdg.newP,2);  
    }else{
        var element=wpbdg.bridge.members[wpbdg_get_row_index(e.srcElement)];
    }
    if(element!=null){
        element.selected^=true;
        wpbdg.updateFlag("select");
    }
    wpbdg.update();
}
function wpbdg_doubletap(e){
    if(e.srcElement==wpbdg.cv1){
        wpbdg.updateNewP(e);
        var element=wpbdg.bridge.getNearestEntity(wpbdg.newP,2);  
    }else{
        var element=wpbdg.bridge.members[wpbdg_get_row_index(e.srcElement)];
    }
    wpbdg.bridge.deselectAll();
    wpbdg.updateFlag("select");
    //invoke wpbdg_tap
}
function wpbdg_release(e){
    if(wpbdg.drag){
        if(wpbdg.hold){
            var x=wpbdg.newP.x;
            var y=wpbdg.newP.y;
            wpbdg.bridge.getBoxEntities(x,y,x-wpbdg.deltaP.x,y-wpbdg.deltaP.y).forEach(function(e){
                e.selected=true;
            });
            wpbdg.updateFlag("select");
        }else{
            //TODO move joint
            var order=wpbdg.bridge.tryMove(wpbdg.deltaP);
            wpbdg.manager.doOrder(order);
        }
    }
    wpbdg.deltaP.x=0;
    wpbdg.deltaP.y=0;
    wpbdg.hold=false;
    wpbdg.drag=false;
    wpbdg.update();
}
function wpbdg_hold(e){
    wpbdg.hold=true;
    wpbdg.bridge.deselectAll();
    wpbdg.updateNewP(e);
    wpbdg.updateFlag("select");
    wpbdg.update();
}
function wpbdg_drag(e){
    wpbdg.drag=true;
    wpbdg.updateNewP(e);
    wpbdg.updateDeltaP(e);
    
    if(wpbdg.hold==true){
        //update box
    }else{
        //draw skeleton
    }
    //both case need flag 2
    wpbdg.updateFlag("select");
    wpbdg.update();
}
function wpbdg_memberrow(m){
    var a=m.jointA;
    var b=m.jointB;
    var dx=b.x-a.x;
    var dy=b.y-a.y;
    var len=Math.sqrt(dx*dx+dy*dy);
    var f=$("<tr>")
        .append($("<th>").text(m.index))
        .append($("<td>").text(m.material.shortName))
        .append($("<td>").text(m.shape.section.shortName))
        .append($("<td>").text(m.shape.width))
        .append($("<td>").text(len.toPrecision(3)))
        .append($("<td>").text((len*m.shape.inverseRadiusOfGyration).toPrecision(4)))
        .append($("<td>").text(0))
        .append($("<td>").text(0));
    return f;
}
function wpbdg_get_row_index(e){
    var tbody=wpbdg.membertable.children("tbody")[0];
    if(e==tbody){
        return -1;
    }
    while(e.parentElement!=tbody){
        e=e.parentElement;
    }
    return parseInt(e.firstChild.innerText);
}
