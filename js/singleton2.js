
function wpbdg_singleton(){
    var f={};
    jQuery.extend(f,wpbdg_prototype);
    f.hold=false;
    f.drag=false;
    f.oldP={"x":0,"y":0};
    f.newP={"x":0,"y":0};
    f.bridge=wpbd_bridge_new();
    f.manager=wpbd_manager_new(f.bridge);
    //f.selecteds=[]; TODO what else?
    f.cv1=document.getElementById("wpbd_cv1");
    f.cv11=document.createElement("canvas");
    f.cv12=document.createElement("canvas");
    f.cv13=document.createElement("canvas");
    f.transform={"r":1,"dx":0,"dy":0};
    
    var tmp=Hammer(f.cv1);
    tmp.on("tap",wpbdg_tap);
    tmp.on("doubletap",wpbdg_doubletap);
    tmp.on("release",wpbdg_release);
    tmp.on("hold",wpbdg_hold);
    tmp.on("drag",wpbdg_drag);
    tmp.on("tap",wpbdg_tap);
    return f;
}
wpbdg_prototype={
update_transform:function (){
    var condition=this.bridge.condition;
    var rect1=wpbd_condition_getBounding(condition);
    var rect2={x:0,y:0,width:this.cv1.width,height:this.cv1.height};
    /*
    x1,y1,w1,w2
    x2,y2,w2,h2
    x'=r*(x+dx)
    
    x1=r*(x2+dx)
    y2+h2=-r*(y1+dy)
    */
    var rx=rect1.width/rect2.width;
    var ry=rect1.height/rect2.height;
    var rr;
    if(rx>ry){
      rr=rx;
      rect2.y+=(rect2.height-rect1.height/rr)/2;
      rect2.height=rect1.height/rr;
    }else{
      rr=ry;
      rect2.x+=(rect2.width-rect1.width/rr)/2;
      rect2.width=rect1.width/rr;
    }
    this.transform.r=rr;
    this.transform.dx=rect1.left/rr-rect2.x;
    this.transform.dy=-(rect1.bottom+rect1.height)/rr-rect2.y;
},
updateNewP:function (e){
    var rect=this.cv1.getBoundingClientRect();
    var p={
        "x":(e.gesture.center.pageX-rect.left)/rect.width*this.cv1.width,
        "y":(e.gesture.center.pageY-rect.top)/rect.height*this.cv1.height};
    
    this.newP.x= this.transform.r*(p.x+this.transform.dx);
    this.newP.y=-this.transform.r*(p.y+this.transform.dy);
},
update_condition:function(){
    this.update_transform();
    this.cv11.width=this.cv1.width;
    this.cv11.height=this.cv1.height;
},
update_bridge:function(){
    this.cv12.width=this.cv1.width;
    this.cv12.height=this.cv1.height;
    var ctx=this.cv12.getContext("2d");
    var bridge=this.bridge;
    
    //paint background
    var p;
    ctx.save();
    ctx.translate(-this.transform.dx,-this.transform.dy);
    ctx.scale(1/this.transform.r,-1/this.transform.r);

    //draw members
    ctx.strokeStyle="#00FF00";
    ctx.lineWidth=0.3;
    var joints=this.bridge.joints;
    var members=this.bridge.members;
    for(var t=0;t<members.length;++t){
      var tmpj;
      var x,y;
      
      ctx.beginPath();
      tmpj=members[t].jointA;
      x=tmpj.x;y=tmpj.y;
      ctx.moveTo(tmpj.x,tmpj.y);
      tmpj=members[t].jointB;
      x+=tmpj.x;y+=tmpj.y;
      ctx.lineTo(tmpj.x,tmpj.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x/2,y/2,0.25,0,Math.PI*2);
      if(members[t].select){
        ctx.save();
        ctx.strokeStyle="#00F";
        ctx.stroke();
        ctx.restore();
      }
    }
    
    
    //draw joints
    ctx.fillStyle="#0000FF";
    ctx.strokeStyle="#000000";
    for(var t=0;t<joints.length;++t){
      ctx.beginPath();
      ctx.arc(joints[t].x,joints[t].y,0.25,0,Math.PI*2);
      ctx.fill();
      if(joints[t].select){
        ctx.save();
        ctx.beginPath();
        ctx.arc(joints[t].x,joints[t].y,0.25,0,Math.PI*2);
        ctx.strokeStyle="#00F";
        ctx.stroke();
        ctx.restore();
      }
    }
    //TODO debug
    ctx=this.cv1.getContext("2d");
    ctx.drawImage(this.cv12,0,0);
},
update_select:function(){
    
},
debug:function(){
    this.cv12.width=this.cv1.width;
    this.cv12.height=this.cv1.height;
    var ctx=this.cv12.getContext("2d");
    console.debug(this.transform);
    ctx.translate(-this.transform.dx,-this.transform.dy);
    ctx.scale(1/this.transform.r,-1/this.transform.r);

    //ctx.translate(100,100);
    //ctx.scale(10,-10);
    var bridge=this.bridge;

    ctx.fillStyle="#0000FF";
    ctx.fillRect(0,0,4,1);

    ctx=this.cv1.getContext("2d");
    ctx.drawImage(this.cv12,0,0);
}

} //end of prototype
