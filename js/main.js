function test2_1_1(){
  var f=function (){
    return this.a;
  }
  f.a="b";
  return f;
}
function test2(input){
  return test2_1(input);
}
function test2_1(input){
  f="";
  for(var t=0;t<100;t++){
    f+=(1<<t)+"\n";
  }
  return f;
}
function test2_2(input){
  f="{\n";
  tmp1=input.split("\n");
  size=tmp1[0];
  for (t1=0;t1<size;t1++){
    line=tmp1[t1*2+2];
    tmp2=line.split(" ");
    f2="  "+tmp2[0]+": {";
    f2+="\"name\": "+tmp2[0]+", ";
    f2+="\"e\": "+tmp2[1]+", ";
    f2+="\"fy\": "+tmp2[2]+", ";
    f2+="\"density\": "+tmp2[3]+", ";
    f2+="\"area\": "+tmp2[4]+", ";
    f2+="\"moment\": "+tmp2[5]+", ";
    f2+="\"cost_vol\": "+tmp2[6]+" ";
    f2+="},\n";
    f+=f2;
    return f;
  }
  return f+"}";
}
function test2_3(input){
  var lines=input.split("\n");
  var f="";
  var f2="";
  for(var t=0;t<lines.length;t++){
    var line=lines[t];
    f2+="("+line+")\n";
    xy=line.split(" ");
    f+="    {\"x\":"+xy[0]+",\"y\":"+xy[1]+"},\n";
  }
  return f;
}
function TTT(a,b){
  a.forEach(function(x){
    x.x+=b;
  });
}
//canvas=document.getElementById("canvas_test1");
canvas=$('#canvas_test1')[0];
//canvas.addEventListener("mousemove",mouseMoveListener);
gWidth=-1;
extendSingleton(singleton,canvas);

function transformCoordinate(element,e){
  var rect = element.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
    debug:rect
  };
}
function mouseMoveListener(e){
  var ctx=canvas.getContext("2d");
  ctx.fillStyle="#FFFFFF";
  ctx.fillRect(0,0,500,500);
  ctx.fillStyle="#FF0000";
  ctx.font="30px Arial";
  p=transformCoordinate(canvas,e);
  ctx.fillText("("+p.x+","+p.y+")("+p.debug.left+","+p.debug.top+","+p.debug.width+","+p.debug.height+")"+e.shiftKey,10,50);
  ctx.fillRect(100,100,p.x/10,p.x/10);
  ctx.beginPath();
  ctx.arc(120,100,4,0,2*Math.PI);
  ctx.fillStyle="#00FF00";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(150,100,4,0,2*Math.PI);
  ctx.fillStyle="#00FF00";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(120,100,4,0,2*Math.PI);
  ctx.fillStyle="#000000";
  ctx.stroke();
  
}
