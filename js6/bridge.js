/*
 * joints, members, condition will not change reference 
 * condition should only be modified by get_from_code method
 * this will return a valid bridge
 */
window.wpbd_bridge_new = () => {
    var f={};
    f.listener=[];
    f.joints=[];
    f.members=[];
    f.condition={};
    //TODO move this line to a more logical place
    jQuery.extend(f.condition,wpbd_condition_prototype);
    jQuery.extend(f,wpbd_bridge_prototype);
    //load default bridge
    f.parseByte(wpbd.defaultBridgeString);
    return f;
}

window.wpbd_bridge_prototype={
//hard coded
"parseByte":function (s){
    var f=this;
    //throws IOException
    var buf={"readBuf":s,"readPtr":0};

    f.joints.splice(0,Infinity);
    f.members.splice(0,Infinity);
    if (wpbd_scanUnsigned(4, "bridge designer version",buf) != 2014) {
        throw ("bridge design file version is not 2014");
    }
    var scenarioCode = wpbd_scanUnsigned(10, "scenario code",buf);

    wpbd_condition_get_from_code(f.condition,scenarioCode);
    if (f.condition== null) {
        throw ("invalid scenario " + scenarioCode);
    }
    var n_joints = wpbd_scanUnsigned(2, "number of joints",buf);
    var n_members = wpbd_scanUnsigned(3, "number of members",buf);
    for (var n = 1; n <= n_joints; n++){
        var x = wpbd_scanInt(3, "joint " + n + " x-coordinate",buf)/4.;
        var y = wpbd_scanInt(3, "joint " + n + " y-coordinate",buf)/4.;

        if (n <= f.condition.prescribedJoints.length){
            var joint = f.condition.prescribedJoints[n-1];
            if ((x != joint.x) || (y != joint.y)) {
                throw ("bad prescribed joint " + n);
            }
            f.joints.push(joint);
        }else{
            f.joints.push(wpbd_joint_new(n-1,x,y,false));
        }
    }
    for (var n = 1; n <= n_members; n++)
    {
        var jointANumber = wpbd_scanUnsigned(2, "first joint of member " + n,buf);
        var jointBNumber = wpbd_scanUnsigned(2, "second joint of member " + n,buf);
        var materialIndex = wpbd_scanUnsigned(1, "material index of member " + n,buf);
        var sectionIndex = wpbd_scanUnsigned(1, "section index of member " + n,buf);
        var sizeIndex = wpbd_scanUnsigned(2, "size index of member " + n,buf);

        f.members.push(wpbd_member_new(n-1, f.joints[jointANumber - 1], f.joints[jointBNumber - 1], wpbd.materials[materialIndex],wpbd.shapes[sectionIndex][sizeIndex]));
    }
    console.debug("parse test");
    for (var i = 0; i < n_members; i++){
        var member = f.members[i];
        member.compressionForceStrengthRatio=parseFloat(wpbd_scanToDelimiter("compression/strength ratio",buf));
        member.tensionForceStrengthRatio=parseFloat(wpbd_scanToDelimiter("tension/strength ratio",buf));
    }
    f.designedBy = wpbd_scanToDelimiter("name of designer",buf);
    f.projectId = wpbd_scanToDelimiter("project ID",buf);
    f.iterationNumber = parseInt(wpbd_scanToDelimiter("iteration",buf));
    f.labelPosition = parseFloat(wpbd_scanToDelimiter("label position",buf));
},
//hard coded, conform with file format
toString:function (){
  var bridge=this;
  var f="";
  f+="2014";

  f+=wpbd_writeNumber(10,bridge.condition.codeLong);
  f+=wpbd_writeNumber(2,bridge.joints.length);
  f+=wpbd_writeNumber(3,bridge.members.length);
  bridge.joints.forEach(function(joint){
    f+=wpbd_writeNumber(3,Math.floor(joint.x*4));
    f+=wpbd_writeNumber(3,Math.floor(joint.y*4));
  });
  bridge.members.forEach(function(member){
    f+=wpbd_writeNumber(2,member.jointA.index+1);
    f+=wpbd_writeNumber(2,member.jointB.index+1);

    f+=wpbd_writeNumber(1,member.material.index);
    f+=wpbd_writeNumber(1,member.shape.section.index);
    f+=wpbd_writeNumber(2,member.shape.sizeIndex);
  });
  bridge.members.forEach(function(member){
    f+=member.compressionForceStrengthRatio.toFixed(2)+"|"+member.tensionForceStrengthRatio.toFixed(2)+"|";
  });
  f+=bridge.designedBy+"|"+bridge.projectId+"|"+bridge.iterationNumber+"|"+bridge.labelPosition.toFixed(3)+"|";
  return f;
},

tryAddJoint:function(p){
    if(p==null){
        return null;
    }
    //joint is exist in that position?
    if(this.joints.some(function(j){
        return j.x==p.x&&j.y==p.y;
    })){
        return null;
    }
    //number of joint reach max?
    if(this.joints>=wpbd.maxJointCount){
        return null;
    }
    this.deselectAll();
    return wpbd_order_new([wpbd_joint_new(this.joints.length,p.x,p.y,false)],[],[],[],[],[]);
},
tryDelete:function(){
    var joints=this.joints.filter(function(j){return j.selected&&!j.fixed;});
    var members=this.members.filter(function(m){return m.selected||joints.indexOf(m.jointA)!=-1||joints.indexOf(m.jointB)!=-1;});
    if(joints.length==0&&members.length==0){
        return null;
    }
    return wpbd_order_new([],joints,[],[],members,[],[]);
},
//TODO less code?
//hard coded
checkMemberWithPier:function(m){
    if (this.condition.hiPier) {
        var pierLocation = this.condition.prescribedJoints[condition.pierJointIndex];
        var eps = 1e-6;
        if ((jointA.x < pierLocation.x && pierLocation.x < jointB.x) ||
            (jointB.x < pierLocation.x && pierLocation.x < jointA.x)) {
            var dx = jointB.x - jointA.x;
            if (Math.abs(dx) > eps) {
                var y = (pierLocation.x - jointA.x) * (jointB.y - jointA.y) / dx + jointA.y;
                if (y < pierLocation.y - eps) {
                    return true;
                }
            }
        }
    }
    return false;

},

tryAddMember:function(materialIndex,sectionIndex,sizeIndex){
    //selected joints
    var joints=this.joints.filter(function(j){return j.selected;});
    this.deselectAll();

    if(joints.length!=2){
        return null;
    }
    var jointA=joints[0];
    var jointB=joints[1];
    //member exist?
    if(this.members.some(function(m){
        return (m.jointA==jointA&&m.jointB==jointB)||(m.jointA==jointB&&m.jointB==jointA);
    })){
        return null;
    }
    //number of member reach max?
    if (this.members.length >= wpbd.maxMemberCount) {
        return null;
    }
    var member = wpbd_member_new(this.members.length,jointA,jointB,wpbd_material_get(materialIndex),wpbd_shape_get(sectionIndex,sizeIndex));
    // Reject members that intersect a pier.  This works in concert with DraftingCoordinates, which prevents 
    // joints from ever occurring on top of a pier.
    if(this.checkMemberWithPier(member)){
        return null;
    }
    return (wpbd_order_new([],[],[],[member],[],[]));
},
tryMove:function(dp){
    if(dp.x==0&&dp.y==0){
        return null;
    }
    //selected joints
    var joints=this.joints.filter(function(j){return j.selected&&!j.fixed});
    if(joints.length==0){
        //TODO smart select member?
        return null;
    }
    //joints in the same spot?
    if(joints.some(function(j1){
        return joints.some(function(j2){
            return j1.x+dp.x==j2.x&&j1.y+dp.y==j2.y&&j1!=j2;
        });
    })){
        return null;
    }

    var condition=this.condition;
    //out of boundary?
    if(joints.some(function(j1){
        //TODO check with condition
        return !condition.isLegalPosition(j1.x+dp.x,j1.y+dp.y);
    })){
        return null;
    }
    var bridge=this;
    //TODO more efficent
    //member cross pier?
    if(this.members.some(function(m){
        return bridge.checkMemberWithPier(m);
    })){
        return null;
    }
    
    //help create order
    joints=joints.map(function(j){
        var j2={};
        jQuery.extend(j2,j);
        j2.x+=dp.x;
        j2.y+=dp.y;
        return j2;
    });
    return wpbd_order_new([],[],joints,[],[],[]);
},
tryChangeType:function(materialIndex,sectionIndex,sizeIndex){
    var member = wpbd_member_new(this.members.length,jointA,jointB,wpbd_material_get(materialIndex),wpbd_shape_get(sectionIndex,sizeIndex));
    var members=this.members.filter(function(m){return m.selected;}).map(function(m){
        return wpbd_member_new(m.index,m.jointA,m.jointB,wpbd_material_get(materialIndex),wpbd_shape_get(sectionIndex,sizeIndex));
    });
    return wpbd_order_new([],[],[],members,[],[]);
},
deselectAll:function (){
    this.joints.forEach(function(e){
        e.selected=false;
    });
    this.members.forEach(function(e){
        e.selected=false;
    });
},
getNearestEntity:function(p,r){
    r*=r;
    //nearest entity
    var f=null;
    //check all joints
    this.joints.forEach(function(j){
        var x=p.x-j.x;
        var y=p.y-j.y;
        var d=x*x+y*y;
        if(d<r){
            f=j;
            r=d;
        }
    });
    //check members
    this.members.forEach(function(m){
        var x=(m.jointB.x+m.jointA.x)/2-p.x;
        var y=(m.jointB.y+m.jointA.y)/2-p.y;
        var d=x*x+y*y;
        if(d<r){
            f=m;
            r=d;
        }
    });
    return f;
},

getBoxEntities:function(x1,y1,x2,y2){
    var tmp;
    if(x1>x2){
        tmp=x1;
        x1=x2;
        x2=tmp;
    }
    if(y1>y2){
        tmp=y1;
        y1=y2;
        y2=tmp;
    }
    var debug="";
    var f=this.members.filter(function(m){
        var x=(m.jointB.x+m.jointA.x)/2;
        var y=(m.jointB.y+m.jointA.y)/2;
        debug+="("+x+"|"+y+")\m";
        return (x1<=x)&&(x<=x2)&&(y1<=y)&&(y<=y2);
    });
    console.debug(debug);
    console.debug("size: "+f.length);
    return f.concat(this.joints.filter(function(j){
        return (x1<=j.x)&&(j.x<=x2)&&(y1<=j.y)&&(j.y<=y2);
    }));
}

};//end of prototype
    
window.wpbd_scanUnsigned = (width,what,buf) => {
    //throws IOException
    /*
    val = 0;
    while ((width > 0) && (buf.readBuf[buf.readPtr] == " "))
    {
        width--;
        buf.readPtr += 1;
    }
    while (width > 0) {
        if (("0" <= buf.readBuf[buf.readPtr]) && (buf.readBuf[buf.readPtr] <= "9")){
            val = val * 10 + (buf.readBuf[buf.readPtr] - 48);
            width--;
            buf.readPtr += 1;
        }else{
            throw ("couldn't scan " + what);
        }
    }
    return val;
    */
    var f=parseInt(buf.readBuf.substring(buf.readPtr,buf.readPtr+width));
    buf.readPtr+=width;
    if(isNaN(f)){
        throw ("couldn't scan " + what);
    }
    return f;
}

window.wpbd_writeNumber = (width,number) => {
    var f=""+number;
    return Array(width-f.length+1).join(" ")+f;
}

window.wpbd_scanInt = (width,what,buf) => {
    //throws IOException
    /*
    var val = 0;
    var negate_p = false;
    while ((width > 0) && (buf.readBuf[buf.readPtr] == " ")){
        width--;
        buf.readPtr += 1;
    }
    if ((width >= 2) && (buf.readBuf[buf.readPtr] == "-")){
        width--;
        buf.readPtr += 1;
        negate_p = true;
    }
    while (width > 0) {
        if (("0" <= buf.readBuf[buf.readPtr]) && (buf.readBuf[buf.readPtr] <= "9")){
            val = val * 10 + (buf.readBuf[buf.readPtr] - 48);
            width--;
            buf.readPtr += 1;
        }else{
            throw ("couldn't scan " + what);
        }
    }
    return negate_p ? -val : val;
    */
    var f=parseInt(buf.readBuf.substring(buf.readPtr,buf.readPtr+width));
    buf.readPtr+=width;
    if(isNaN(f)){
        throw ("couldn't scan " + what);
    }
    return f;
}
window.wpbd_scanToDelimiter = (what,buf) => {
    var readPtrOld=buf.readPtr;
    while (buf.readBuf[buf.readPtr] != "|")
    {
        buf.readPtr += 1;
    }
    var f=buf.readBuf.substring(readPtrOld,buf.readPtr);
    buf.readPtr += 1;
    return f;
}
window.wpbd_joint_new = (i,x,y,fixed) => {
    return {"index":i,"x":x,"y":y,"fixed":fixed,"selected":false};
}
//TODO where is strength ratio?
window.wpbd_member_new = (i,j1,j2,material,shape) => {
    return {
        "index":i,
        "jointA":j1,
        "jointB":j2,
        "material":material,
        "shape":shape,
        "selected":false,
        "compressionForceStrengthRatio":0,
        "tensionForceStrengthRatio":0,
        "getLength":function(){
            var dx=this.jointB.x-this.jointA.x;
            var dy=this.jointB.y-this.jointA.y;
            return Math.sqrt(dx*dx+dy*dy);
        }
    };
}
/**
 * DesignCondition
 */




