
function extendType(type){
  /*
  type.name
  type.e
  type.fy
  type.density
  type.area
  type.moment
  type.cost_vol
  */
  type.fyArea=type.fy*type.area;
  type.weight=type.density*type.area*inventory.gravity*inventory.deadLoadFactor/2/1000;
  type.ae=type.area*type.e;
  type.cost=type.density*type.area*type.cost_vol*2;
  type.tenstionStrength=type.fyArea*inventory.tensionResistanceFactor;
  type.inverseRadiusOfGyration=Math.sqrt(type.area/type.moment);
  type.fyArea_d_CEMoment=type.fyArea/(inventory.c*type.e*type.moment);
  jQuery.extend(type,TypePrototype);
}

TypePrototype={
  getCompressionStrength: function(length){
    lambda=length*length*this.fyArea_d_CEMoment;
    return (lambda <= 2.25) ? 
      inventory.compressionResistanceFactor * Math.pow(0.66, lambda) * this.fyArea : 
      inventory.compressionResistanceFactor * 0.88 * this.fyArea / lambda;
  },
  ifPass: function(compression,tension,length,slenderness){
    return tension<this.tensionStrength&&length*this.inverseOfGyration<slenderness&&(-compression<this.getCompressionStrength(length));
  }
};

function extendInventory(inventory){
  inventory.conditionMap={};
  inventory.jointCost=inventory.jointSingleCost;
  var size;
  var t;
  size=inventory.deckTypes.length;
  for(t=0;t<size;t++){
    var deckType=inventory.deckTypes[t];
    deckType.weight=eval(deckType.weightExpr);
  }
  size=inventory.truckTypes.length;
  for(t=0;t<size;t++){
    var trucType=inventory.truckTypes[t];
    truckType.front=truckType.frontRaw*inventory.liveLoadFactor;
    truckType.back=truckType.backRaw*inventory.liveLoadFactor;
  }
  size=inventory.types.length;
  for(t=0;t<size;t++){
    var type=inventory.types[t];

    //TODO assign global inventory
    extendType(type);
  }
}

function extendCondition(condition){
  condition.joints.forEach(function(joint){
    joint.hover=false;
    joint.select=false;
    joint.dx=0;
    joint.dy=0;
  });
  var tmp=condition.boundingRect;
  tmp.x2=tmp.x+tmp.width;
  tmp.y2=tmp.y+tmp.height;
  tmp.xm=tmp.x+tmp.width/2;
  jQuery.extend(condition,ConditionPrototype);
}
ConditionPrototype={
  isLegalPosition:function(p){
    var bound=this.boundingPoly;
    if(bound[0].y>p.y||bound[bound.length-1].y<p.y){
      return false;
    }
    var t=0;
    while(bound[t].y<p.y){
      t++;
    }
    if(t===0){
      return bound[0].minX<=p.x&&p.x<=bound[0].maxX;
    }
    t--;
    var r=(p.y-bound[t].y)/(bound[t+1].y-bound[t].y);
    return bound[t+1].minX*r+bound[t].minX*(1-r)<=p.x&&p.x<=bound[t+1].maxX*r+bound[t].maxX*(1-r);
  }
};

function extendBridge(bridge){
  //TODO handle condition being undefined
  /*
  */
  bridge.condition=singleton.condition;
  for(var t=0;t<bridge.members.length;t++){
    member=bridge.members[t];
    //TODO singleton.joints is no longer avaliable
    member.J1=getJointByIndex(bridge,member.j1);
    member.J2=getJointByIndex(bridge,member.j2);
    delete member.j1;
    delete member.j2;
    member.forces=[];
    member.forceMin=0;
    member.forceMax=0;
    member.hover=false;
    member.select=false;
    member.type=bridge.type.bundle[bridge.type.member[t]];
  }
  bridge.joints.forEach(function(joint){
    joint.hover=false;
    joint.select=false;
    joint.dx=0;
    joint.dy=0;
  });
  bridge.entities=bridge.joints.concat(bridge.members);
  jQuery.extend(bridge,BridgePrototype);
  bridge.updateMemberP();
  console.debug(JSON.stringify(bridge));
}


function getJointByIndex(bridge,i){
  var length=bridge.condition.joints.length;
  if(i<length){
    return bridge.condition.joints[i];
  }else{
    return bridge.joints[i-length];
  }
}

BridgePrototype={
  //TODO do it when display and others are done
  addJoint:function(position){
    this.joints.push(position);
  },
  /**
   * precondition: joints have to be in this.joints
   */
  removeJoints:function(joints){
    var tmp=[];
    this.members=this.members.filter(function(member){
      return joints.contains(member.J1)||joints.contains(member.J2)
    });
    this.joints=this.joints.filter(function(joint){
      return joints.indexOf(joint)==-1;
    });
  },
  
  updateMemberP:function(){
    this.members.forEach(function(member){
      member.x=(member.J1.x+member.J2.x)/2;
      member.y=(member.J1.y+member.J2.y)/2;
    });
  },
  
  addMember:function(J1,J2,type){
    this.members.push({
      "J1":J1,
      "J2":J2,
      "forces":[],
      "forceMin":0,
      "forceMax":0,
      "x":(J1.x+J2.x)/2,
      "y":(J1.y+J2.y)/2,
      "type":type
    });
  },
  
  removeMember:function(members){
    var size=members.length;
    for(var t=0;t<size;t++){
      this.members.splice(this.members.indexOf(members[t]),1);
    }
    this.members=this.members.filter(function(member){
      return members.indexOf(member)==-1;
    });
  },
  
  setMemberType:function(members,type){
    members.forEach(function(member){
      member.type=type;
    });
  }
};

function distance(p1,p2){
  var f={
    dx:p2.x-p1.x,
    dy:p2.y-p1.y
  };
  f.r=Math.sqrt(f.dx*f.dx+f.dy*f.dy);
  return f;
}

function extendSingleton(f,canvas){
  f.bridge=f.inventory.bridges[f.bridgeName];
  f.condition=f.inventory.conditions[f.bridge.conditionName];
  extendBridge(f.bridge);
  extendCondition(f.condition);
  //handle canvas
  f.canvas=canvas;
  jQuery.extend(true,canvas,CanvasPrototype);
  canvas.updateTransform();
  /*
  switch(singleton.mode){
    case "select":
    case "selectBox":
    case "move":
    case "createJoint":
    case "createJoint2":
    case "createMember":
    case "createMember2":
  }
  */
  f.mode="select";
  /*
  switch(singleton.status){
    case "unsynced":
    case "pass":
    case "fail":
    case "illegal":
  }
  */
  f.status="unsynced";
  f.cost=0;
  f.selectEntities=[];
  f.hoverEntities=[];
  jQuery.extend(f,SingletonPrototype);
}
function extendCanvas(canvas){
  canvas.newP={x:0,y:0};
  canvas.oldP={x:0,y:0};
  canvas.mouseDown=false;
  canvas.mouseIn=false;
  canvas.transform={r:0,dx:0,dy:0};
  jQuery.extend(canvas,CanvasPrototype);
}
CanvasPrototype={
  updateNewP:function(e){
    var newCanvas={
      x:e.offsetX,
      y:e.offsetY
    };
    this.newP=this.getPFromCanvas(newCanvas);
  },
  
  updateTransform:function(){
    var rect1=singleton.condition.boundingRect;
    var rect2={x:0,y:0,width:this.width,height:this.height};
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
    this.transform={
      r:rr,
      dx:rect1.x/rr-rect2.x,
      dy:-(rect1.y+rect1.height)/rr-rect2.y
    };
  },
  
  getNearEntities:function(entities){
    //TODO change to preference
    var min=1;
    var fentity=null;
    var p=this.newP;
    entities.forEach(function(entity){
      var d=distance(entity,p).r;
      if(d<min){
        min=d;
        fentity=entity;
      }
    });
    if(fentity===null){
      return [];
    }else{
      return [fentity];
    }
  },
  
  getBoxEntities:function(entities){
    var tmp=[0,0,0,0];
    var p1=this.oldP;
    var p2=this.newP;
    if(p1.x<p2.x){
      tmp[0]=p1.x;
      tmp[1]=p2.x;
    }else{
      tmp[0]=p2.x;
      tmp[1]=p1.x;
    }
    if(p1.y<p2.y){
      tmp[2]=p1.y;
      tmp[3]=p2.y;
    }else{
      tmp[2]=p2.y;
      tmp[3]=p1.y;
    }
    var f=[];
    entities.forEach(function(entity){
      if((tmp[0]<=entity.x)&&(entity.x<=tmp[1])&&(tmp[2]<=entity.y)&&(entity.y<=tmp[3])){
        f.push(entity);
      }
    });
    return f;
  },
  
  printTest:function(e){
    var ctx=canvas.getContext("2d");
    ctx.fillStyle="#FFFFFF";
    ctx.fillRect(0,0,500,500);
    ctx.fillStyle="#00FF00";
    ctx.save();
    ctx.translate(-this.transform.dx,-this.transform.dy);
    ctx.scale(1/this.transform.r,-1/this.transform.r);
    var tmpRect=singleton.condition.boundingRect;
    ctx.fillRect(tmpRect.x,tmpRect.y,tmpRect.width,tmpRect.height);
    ctx.restore();
    ctx.fillStyle="#FF0000";
    ctx.font="10px Monospace";
    ctx.fillText("("+Math.floor(this.newP.x)+","+Math.floor(this.newP.y)+")",10,20);
    ctx.fillText("("+JSON.stringify(this.transform)+")",10,30);
    var lines=stringifyS(e).split("\n");
    for(var t=0;t<lines.length;++t){
      ctx.fillText(lines[t],10,t*10+40);
    }
  },
  
  getPFromCanvas:function(p){
    return {
      x: this.transform.r*(p.x+this.transform.dx),
      y:-this.transform.r*(p.y+this.transform.dy)
    };
  },
  
  getCanvasFromP:function(p){
    return {
      x:p.x/this.transform.r-this.transform.dx,
      y:-p.y/this.transform.r-this.transform.dy
    };
  },
  
  repaint:function(){
    //paint background
    var ctx=this.getContext("2d");
    ctx.fillStyle="#FFF";
    ctx.fillRect(0,0,this.width,this.height);
    var p;
    ctx.save();
    ctx.translate(-this.transform.dx,-this.transform.dy);
    ctx.scale(1/this.transform.r,-1/this.transform.r);

    //paint grid
    ctx.save();
    ctx.strokeStyle="#CCC";
    ctx.lineWidth=0.1;
    var boundingRect=singleton.condition.boundingRect;
    var x=Math.floor(boundingRect.x);
    while(x<=boundingRect.x2){
      ctx.beginPath();
      ctx.moveTo(x,boundingRect.y);
      ctx.lineTo(x,boundingRect.y2);
      ctx.stroke();
      x+=1;
    }
    var y=Math.floor(boundingRect.y);
    while(y<=boundingRect.y2){
      ctx.beginPath();
      ctx.moveTo(boundingRect.x,y);
      ctx.lineTo(boundingRect.x2,y);
      ctx.stroke();
      y+=1;
    }
    ctx.lineWidth=0.2;
    ctx.strokeStyle="red";
    ctx.beginPath();
    ctx.moveTo(boundingRect.xm,boundingRect.y);
    ctx.lineTo(boundingRect.xm,boundingRect.y2);
    ctx.stroke();

    
    ctx.restore();
    
    //draw valid zone
    ctx.fillStyle="rgba(255,128,128,0.5)";
    var boundingPoly=singleton.condition.boundingPoly;
    ctx.moveTo(boundingPoly[0].minX,boundingPoly[0].y);
    for(t=0;t<boundingPoly.length;++t){
      ctx.lineTo(boundingPoly[t].maxX,boundingPoly[t].y);
    }
    for(t=boundingPoly.length-1;t>=0;--t){
      ctx.lineTo(boundingPoly[t].minX,boundingPoly[t].y);
    }
    ctx.fill();
    
    
    var joints=singleton.condition.joints;
    joints=joints.concat(singleton.bridge.joints);
    
    //draw members
    ctx.strokeStyle="#00FF00";
    ctx.lineWidth=0.3;
    var members=singleton.bridge.members;
    for(var t=0;t<members.length;++t){
      var tmpj;
      
      ctx.beginPath();
      tmpj=members[t].J1;
      ctx.moveTo(tmpj.x,tmpj.y);
      tmpj=members[t].J2;
      ctx.lineTo(tmpj.x,tmpj.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(members[t].x,members[t].y,0.25,0,Math.PI*2);
      if(members[t].select){
        ctx.save();
        ctx.strokeStyle="#00F";
        ctx.stroke();
        ctx.restore();
      }
      if(members[t].hover){
        ctx.save();
        ctx.strokeStyle="#000";
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
      if(joints[t].hover){
        ctx.save();
        ctx.beginPath();
        ctx.arc(joints[t].x,joints[t].y,0.25,0,Math.PI*2);
        ctx.strokeStyle="#000";
        ctx.stroke();
        ctx.strokeStyle="#0F0";
        ctx.lineWidth=0.06;
        drawCross(ctx,joints[t].x,joints[t].y,boundingRect);
        ctx.restore();
      }
    }

    //draw box
    switch(singleton.mode){
      case "move":
        var tmp={};
        var gridSize=singleton.inventory.gridSize;
        tmp.x=Math.floor((this.newP.x-this.oldP.x)/gridSize)*gridSize;
        tmp.y=Math.floor((this.newP.y-this.oldP.y)/gridSize)*gridSize;
        if(tmp.x===0&&tmp.y===0){
          break;
        }
        singleton.selectEntities.forEach(function(entity){
          entity.x+=tmp.x;
          entity.y+=tmp.y;
        });
        ctx.save();
        ctx.lineWidth=0.1;
        ctx.strokeStyle="#F00";
        singleton.bridge.members.forEach(function(member){
          var tmpj;
          ctx.beginPath();
          tmpj=member.J1;
          ctx.moveTo(tmpj.x,tmpj.y);
          tmpj=member.J2;
          ctx.lineTo(tmpj.x,tmpj.y);
          ctx.stroke();
        });
        ctx.strokeStyle="#F00";
        ctx.lineWidth=0.06;
        singleton.bridge.joints.forEach(function(joint){
          if(joint.select){
            drawCross(ctx,joint.x,joint.y,boundingRect);
          }
        });
        ctx.restore();

        singleton.selectEntities.forEach(function(entity){
          entity.x-=tmp.x;
          entity.y-=tmp.y;
        });

        break;
      case "selectBox":
        ctx.fillStyle="rgba(0,255,0,0.3)";
        ctx.rect(this.newP.x,this.newP.y,this.oldP.x-this.newP.x,this.oldP.y-this.newP.y);
        ctx.fill();
    }
    ctx.restore();
  },
  
  onmousemove:function(e){
    this.updateNewP(e);
    switch(singleton.mode){
      case "select":
        singleton.setHover(this.getNearEntities(singleton.bridge.entities));
        break;
      case "selectBox":
        singleton.setHover(this.getBoxEntities(singleton.bridge.entities));
        break;
      case "move":
        //TODO
        break;
      case "createJoint":
      case "createJoint2":
        break;
      case "createMember":
      case "createMember2":
        singleton.setHover(this.getNearEntities(singleton.bridge.joints.concat(singleton.condition.joints)));
        break;
    }
    this.repaint();
  },
  
  onmousedown:function(e){
    this.updateNewP(e);
    console.debug(stringifyS(e));
    if(e.button!==0){
      return;
    }
    this.oldP=jQuery.extend({},this.newP);
    switch(singleton.mode){
      case "select":
        var entities=this.getNearEntities(singleton.bridge.entities);
        if(entities.length===0){
          singleton.mode="selectBox";
        }else{
          singleton.setHover(entities);
          if(e.shiftKey&singleton.selectEntities.indexOf(entities[0])!==-1){
            
          }else{
            singleton.setSelect(e.shiftKey);
          }
          singleton.mode="move";
        }
        break;
      case "createJoint":
        singleton.mode="createJoint2";
        break;
      case "createMemeber":
        var entities=this.getNearEntities(singleton.bridge.joints.concat(singleton.condition.joints));
        if(entities.length===0){
          
        }else{
          singleton.setSelect(entities);
          singleton.mode="createMember2";
        }
        break;
      case "createJoint2":
      case "createMember2":
        break;
    }
  },
  
  onmouseup:function(e){
    console.debug(e.button);
    if(e.button!==0){
      return;
    }
    switch(singleton.mode){
      case "select":
        break;
      case "move":
        var tmp={};
        var gridSize=singleton.inventory.gridSize;
        tmp.x=Math.floor((this.newP.x-this.oldP.x)/gridSize)*gridSize;
        tmp.y=Math.floor((this.newP.y-this.oldP.y)/gridSize)*gridSize;
        singleton.mode="select";
        singleton.tryMoveJoints(tmp);
        break;
      case "selectBox":
        singleton.setSelect(e.shiftKey);
        singleton.setHover([]);
        singleton.mode="select";
        break;
      case "createJoint":
        break;
      case "createJoint2":
        singleton.tryAddJoint(jQuery.extend({},this.newP));
        singleton.mode="createJoint";
      case "createMember":
        break;
      case "createMember2":
        var entities=this.getNearEntities(singleton.bridge.joints.concat(singleton.condition.joints));
        if(entities.length!==0&&singleton.selectEntities.length!==0){
          singleton.tryAddMember(singleton.selectEntities[0],entities[0]);
        }
        singleton.mode="createMember";
        break;
    }
  },
  
  onmouseover:function(e){
    this.mouseIn=true;
  },
  
  onmouseout:function(e){
    this.mouseDown=false;
    this.mouseIn=false;
  },
  
  onkeydown:function(e){
    
  },
  
  onkeyup:function(e){
    
  }
};
SingletonPrototype={
  setHover: function(entities){
    //TODO stop and do not draw when it's not changed
    this.hoverEntities.forEach(function(entity){
      entity.hover=false;
    });
    entities.forEach(function(entity){
      entity.hover=true;
    });
    this.hoverEntities=entities;
    this.repaintBridge();
  },
  
  setSelect: function(shift){
    //use this.hoverEntities
    if(shift){
      var selectEntities=this.selectEntities;
      var hoverEntities=this.hoverEntities;
      var allSelected=true;
      this.hoverEntities.forEach(function(entity){
        if(entity.select===false){
          allSelected=false;
          entity.select=true;
          selectEntities.push(entity);
        }
      });
      if(allSelected){
        this.hoverEntities.forEach(function(entity){
          entity.select=false;
        });
        this.selectEntities=this.selectEntities.filter(function(entity){
          return hoverEntities.indexOf(entity)===-1;
        });
      }
    }else{
      this.selectEntities.forEach(function(entity){
        entity.select=false;
      });
      this.hoverEntities.forEach(function(entity){
        entity.select=true;
      });
      this.selectEntities=[].concat(this.hoverEntities);
    }
    this.repaintBridge();
  },
  /**
   * selectEntities can contain members
   */
  tryMoveJoints: function(dp){
    var joints2=this.bridge.joints;
    joints1=this.selectEntities.filter(function(entity){
      return joints2.indexOf(entity)!==-1;
    });
    joints2=joints2.filter(function(joint){
      return joints1.indexOf(joint)===-1;
    });
    var condition=this.condition;
    if(joints1.some(function(joint1){
      return (!condition.isLegalPosition({"x":joint1.x+dp.x,"y":joint1.y+dp.y}))
    })){
      return false;
    }
    if(joints1.some(function(joint1){
      return joints2.some(function(joint2){
        return joint1.x===joint2.x&&joint1.y==joint2.y;
      });
    })){
      return false;
    }
    joints1.forEach(function(joint1){
      joint1.x+=dp.x;
      joint1.y+=dp.y;
    });
    this.bridge.updateMemberP();
    this.repaintBridge();
    return true;
  },
  tryAddJoint: function(p){
    
  },
  tryAddMember: function(J1,J2){
    
  },
  
  deleteSelect: function(){
    
  },
  setCondition: function(condition){
    
  },
  
  loadBridge: function(bridgeBinary){
    
  },
  saveBridge: function(){
    
  },
  
  repaintBridge: function(){
    this.canvas.repaint();
  }
};

function transformCoordinate(element,e){
  var rect = element.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
    debug:rect
  };
}

function repaint(singleton){
  
}

function stringifyS(o){
  var f="(";
  for(var key in o){
    f+=key+":"+o[key]+"\n";
  }
  return f;
}

function drawCross(ctx, x, y, rect){
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x,rect.y);
  ctx.lineTo(x,rect.y2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(rect.xm*2-x,rect.y);
  ctx.lineTo(rect.xm*2-x,rect.y2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(rect.x,y);
  ctx.lineTo(rect.x2,y);
  ctx.stroke();
  ctx.restore();
}










