
function wpbd_manager_new(bridge){
    return {
        "bridge":bridge,
        "ptr":{"next":null,"prev":null,"order":null}
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
function wpbd_manager_exchange(list,es){
    es.foreach(function(e){
        var tmp={};
        var el=list[e.index];
        jQuery.extend(tmp,e);
        jQuery.extend(e,el);
        jQuery.extend(el,tmp);
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
    var order=this.ptr.order;
    if(order==null){
        return;
    }
    this.ptr=this.ptr.next;
    wpbd_manager_add(this.bridge.joints,order.ja);
    wpbd_manager_exchange(this.bridge.joints,order.jc);
    wpbd_manager_remove(this.bridge.joints,order.jd);
    wpbd_manager_add(this.bridge.members,order.ma);
    wpbd_manager_exchange(this.bridge.members,order.mc);
    wpbd_manager_remove(this.bridge.members,order.md);
},
undo:function(){
    if(this.ptr.prev==null){
        return;
    }
    this.ptr=this.ptr.prev;
    var order=this.ptr.order;
    wpbd_manager_add(this.bridge.joints,order.j2);
    wpbd_manager_add(this.bridge.members,order.m2);
    wpbd_manager_remove(this.bridge.members,order.m1);
    wpbd_manager_remove(this.bridge.joints,order.j1);
},
undoable:function(){
    return this.ptr.prev!=null;
},
redoable:function(){
    return this.ptr.order!=null;
},
doOrder:function(order){
    this.ptr.order=order;
    this.ptr.next={"next":null,"prev":this.ptr,"order":null};
    this.redo();
}

};
function wpbd_order_new(ja,jd,jc,ma,md,mc){
    return {"ja":ja,"jd":jd,"jc":jc,"ma":ma,"md":md,"mc":mc};
}
