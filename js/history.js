
function wpbd_manager_new(bridge){
    return {
        "bridge":bridge,
        "ptr":{"next":null,"prev":null,"data":null}
}
function wpbd_manager_add(list,es){
    es.foreach(function(e){
        if(e.index==list.length){
            list.push(e);
        }else{
            list.push(list[e.index]);
            list[e.index]=e;
        }
    }
}
function wpbd_manager_remove(list,es){
    es=es.slice(0).reverse();
    es.forEach(function(e){
        el=list.pop();
        if(el==e){
            return;
        }else{
            list[e.index]=el;
            el.index=e.index;
        }
    });
}
wpbd_manager_prototype={

redo:function(){
    var data=this.ptr.data;
    if(data==null){
        return;
    }
    this.ptr=this.ptr.next;
    wpbd_manager_add(this.bridge.joints,data.j1);
    wpbd_manager_add(this.bridge.members,data.m1);
    wpbd_manager_remove(this.bridge.members,data.m2);
    wpbd_manager_remove(this.bridge.joints,data.j2);
},
undo:function(){
    if(this.ptr.prev==null){
        return;
    }
    this.ptr=this.ptr.prev;
    var data=this.ptr.data;
    wpbd_manager_add(this.bridge.joints,data.j2);
    wpbd_manager_add(this.bridge.members,data.m2);
    wpbd_manager_remove(this.bridge.members,data.m1);
    wpbd_manager_remove(this.bridge.joints,data.j1);
},
undoable:function(){
    return this.ptr.prev!=null;
},
redoable:function(){
    return this.ptr.data!=null;
}

};
