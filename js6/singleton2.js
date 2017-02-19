
window.wpbdg_singleton = () => {
    var f={};
    jQuery.extend(f,wpbdg_prototype);

    //core
    f.bridge=wpbd_bridge_new();
    f.manager=wpbd_manager_new(f.bridge);
    f.result=wpbd_analyze(f.bridge,null);
    f.cost=wpbd_cost(f.bridge);

    //settings
    f.gridSize=0.25;
    f.mt_select=$("#wpbd_mt-select");
    wpbd.materials.forEach(function(m){
        f.mt_select.append($("<option></option>").text(m.shortName).attr("value",m.index));
    });
    f.cs_select=$("#wpbd_cs-select");
    wpbd.crossSections.forEach(function(s){
        f.cs_select.append($("<option></option>").text(s.shortName).attr("value",s.index));
    });
    f.wd_select=$("#wpbd_wd-select");
    var i=0;
    wpbd.widths.forEach(function(w){
        f.wd_select.append($("<option></option>").text(w).attr("value",i++));
    });
    
    //buttons

    $("#wpbd_new").on("click",wpbdg_undo);
    $("#wpbd_load").on("click",wpbdg_load);
    $("#wpbd_save").on("click",wpbdg_save);
    $("#wpbd_undo").on("click",wpbdg_undo);
    $("#wpbd_redo").on("click",wpbdg_redo);
    $("#wpbd_analyze").on("click",wpbdg_analyze);
    $("#wpbd_delete").on("click",wpbdg_delete);
    $("#wpbd_addjoint").on("click",wpbdg_addjoint);
    $("#wpbd_addmember").on("click",wpbdg_addmember);

    //memberlist
    f.membertable=$("#wpbd_membertable");
    var tbody=f.membertable.children("tbody");
    Hammer(f.membertable[0],{prevent_default:true});
    var tmp=Hammer(tbody[0]);
    tmp.on("doubletap", wpbdg_doubletap);
    tmp.on("tap", wpbdg_tap);

    f.bridge.members.forEach(function(m){
        tbody.append(wpbdg_memberrow(m));
    });
    f.membertable.tablesorter();

    //gui
    f.hold=false;
    f.drag=false;
    f.deltaP={"x":0,"y":0};
    f.newP={"x":0,"y":0};
    f.cv1=document.getElementById("wpbd_cv1");
    f.cv11=document.createElement("canvas");
    f.cv12=document.createElement("canvas");
    f.cv13=document.createElement("canvas");
    f.transform={"r":1,"dx":0,"dy":0};
    f.flag=15;
    
    //listeners
    $(window).bind("orientationchange resize pageshow", wpbdg_update_geometry);
    var tmp=Hammer(f.cv1,{prevent_default:true});
    tmp.on("tap",wpbdg_tap);
    tmp.on("doubletap",wpbdg_doubletap);
    tmp.on("release",wpbdg_release);
    tmp.on("hold",wpbdg_hold);
    tmp.on("drag",wpbdg_drag);
    tmp.on("tap",wpbdg_tap);
    return f;
}
window.wpbdg_prototype={
update_transform:function (){
    var condition=this.bridge.condition;
    var rect1=wpbd_condition_getBounding(condition);
    var rect2={"x":0,"y":0,"width":this.cv1.width,"height":this.cv1.height};
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
updateDeltaP:function (e){
    var rect=this.cv1.getBoundingClientRect();
    this.deltaP.x=e.gesture.deltaX/rect.width*this.cv1.width*this.transform.r;
    this.deltaP.y=-e.gesture.deltaY/rect.height*this.cv1.height*this.transform.r;
},
updateFlag:function(flag){
    var tmp;
    switch(typeof flag){
    case "number":
        tmp=flag;
        break;
    case "string":
        tmp=wpbd.flags[flag];
        break;
    default:
        tmp=undefined;
    }
    if(tmp===undefined){
        return;
    }
    this.flag|=tmp;
},
update:function(flag){
    if(flag==undefined){
        flag=-1;
    }
    if(this.flag&1&flag){
        this.updateCondition();
        this.flag|=14;
    }
    if(this.flag&2&flag){
        this.updateBridge();
        this.flag|=12;
    }
    if(this.flag&4&flag){
        this.updateAnalyze();
        this.flag|=8;
    }
    if(this.flag&8&flag){
        this.updateSelect();
    }
    ctx=this.cv1.getContext("2d");
    ctx.drawImage(this.cv11,0,0);
    ctx.drawImage(this.cv12,0,0);
    ctx.drawImage(this.cv13,0,0);
    this.flag&=~flag;
},
updateCondition:function(){
    this.cv1.width=this.cv1.offsetWidth;
    this.cv1.height=this.cv1.offsetHeight;
    this.update_transform();
    this.cv11.width=this.cv1.width;
    this.cv11.height=this.cv1.height;
    var ctx=this.cv11.getContext("2d");
    ctx.fillStyle="FFF";
    ctx.fillRect(0,0,this.cv1.width,this.cv1.height);
},
updateBridge:function(){
    //update data
    this.cost=wpbd_cost(this.bridge);

    //update canvas
    this.cv12.width=this.cv1.width;
    this.cv12.height=this.cv1.height;
    var ctx=this.cv12.getContext("2d");
    var joints=this.bridge.joints;
    var members=this.bridge.members;

    ctx.save();
    ctx.translate(-this.transform.dx,-this.transform.dy);
    ctx.scale(1/this.transform.r,-1/this.transform.r);

    //draw members
    ctx.strokeStyle="#00FF00";
    ctx.lineWidth=0.3;
    this.bridge.members.forEach(function(m){
      var tmpj;
      var x,y;
      
      ctx.beginPath();
      tmpj=m.jointA;
      x=tmpj.x;y=tmpj.y;
      ctx.moveTo(tmpj.x,tmpj.y);
      tmpj=m.jointB;
      x+=tmpj.x;y+=tmpj.y;
      ctx.lineTo(tmpj.x,tmpj.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x/2,y/2,0.25,0,Math.PI*2);
    });
    
    
    //draw joints
    ctx.fillStyle="#0000FF";
    ctx.strokeStyle="#000000";
    this.bridge.joints.forEach(function(j){
        ctx.beginPath();
        ctx.arc(j.x,j.y,0.25,0,Math.PI*2);
        ctx.fill();
    });

    //update membertable
    var tbody=this.membertable.children("tbody");
    tbody.text("");

    this.bridge.members.forEach(function(m){
        tbody.append(wpbdg_memberrow(m));
    });
    this.membertable.trigger("update");

    //update cost
    $("#wpbd_cost").text("$"+this.cost.totalCost.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,'));
},
updateAnalyze:function(){
    var members=this.bridge.members;
    this.membertable.children("tbody").children().each(function(i,tr){
        var c=$(tr).children();
        var tmp=members[c[0].innerText].compressionForceStrengthRatio.toFixed(2);
        c[6].innerText=tmp;
        //TODO is equal fine?
        if(tmp>1){
            $(c[6]).addClass("compressionFail");
        }else{
            $(c[6]).removeClass("compressionFail");
        }
        tmp=members[c[0].innerText].tensionForceStrengthRatio.toFixed(2);
        c[7].innerText=tmp;
        //TODO is equal fine?
        if(tmp>1){
            $(c[7]).addClass("tensionFail");
        }else{
            $(c[7]).removeClass("tensionFail");
        }
    });
    this.membertable.trigger("update");
},
updateSelect:function(){
    ///////////////
    // gui
    ////////////////
    this.cv13.width=this.cv1.width;
    this.cv13.height=this.cv1.height;
    var ctx=this.cv13.getContext("2d");
    ctx.save();
    ctx.translate(-this.transform.dx,-this.transform.dy);
    ctx.scale(1/this.transform.r,-1/this.transform.r);

    //draw members
    ctx.strokeStyle="#000000";
    ctx.lineWidth=0.3;
    this.bridge.members.forEach(function(m){
        if(!m.selected){
            return;
        }
        var x=(m.jointA.x+m.jointB.x)/2;
        var y=(m.jointA.y+m.jointB.y)/2;
        ctx.beginPath();
        ctx.arc(x,y,0.25,0,Math.PI*2);
        ctx.stroke();
    });
    
    this.bridge.joints.forEach(function(j){
        if(!j.selected){
            return;
        }
        ctx.beginPath();
        ctx.arc(j.x,j.y,0.25,0,Math.PI*2);
        ctx.stroke();
    });
    if(this.hold){
        //draw select box
        ctx.fillStyle="rgba(0, 0, 200, 0.5)";
        ctx.fillRect(this.newP.x,this.newP.y,-this.deltaP.x,-this.deltaP.y);
    }else if(this.drag){
        //draw skeleton
        var dp={
            "x":wpbd_round(this.deltaP.x,this.gridSize),
            "y":wpbd_round(this.deltaP.y,this.gridSize)
        };
        this.bridge.joints.forEach(function(j){
            if(j.selected&&!j.fixed){
                j.x+=dp.x;
                j.y+=dp.y;
            }
        });
        ctx.save();
        ctx.lineWidth=0.1;
        ctx.strokeStyle="#F00";
        this.bridge.members.forEach(function(m){
            var tmpj;
            ctx.beginPath();
            tmpj=m.jointA;
            ctx.moveTo(tmpj.x,tmpj.y);
            tmpj=m.jointB;
            ctx.lineTo(tmpj.x,tmpj.y);
            ctx.stroke();
        });
        ctx.restore();
        this.bridge.joints.forEach(function(j){
            if(j.selected&&!j.fixed){
                j.x-=dp.x;
                j.y-=dp.y;
            }
        });
    }
    ///////////////
    // others
    ////////////////

    //select
    var mt=-2;
    var cs=-2;
    var wd=-2;
    this.bridge.members.forEach(function(m){
        if(!m.selected){
            return;
        }
        if(mt==-2){
            mt=m.material.index;
            cs=m.shape.section.index;
            wd=m.shape.sizeIndex;
            return;
        }
        if(mt!=m.material.index){
            mt=-1;
        }
        if(cs!=m.shape.section.index){
            cs=-1;
        }
        if(wd!=m.shape.sizeIndex){
            wd=-1;
        }
    });
    //something selected
    if(mt!=-2){
        this.mt_select.val(mt);
        this.cs_select.val(cs);
        this.wd_select.val(wd);
        this.mt_select.selectmenu("refresh");
        this.cs_select.selectmenu("refresh");
        this.wd_select.selectmenu("refresh");
    }

    var members=this.bridge.members;
    //membertable
    this.membertable.children("tbody").children().each(function(i,tr){
        if(members[tr.firstChild.innerText].selected){
            $(tr).addClass("selected");
        }else{
            $(tr).removeClass("selected");
        }
    });
},
debug:function(){
    this.cv12.width=this.cv1.width;
    this.cv12.height=this.cv1.height;
    var ctx=this.cv12.getContext("2d");
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
