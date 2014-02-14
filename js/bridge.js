
function BridgeModel_parseByte(f,s){
  //throws IOException
  var buf={"readBuf":s,"readPtr":0};
  //TODO
  f.joints=[];
  f.members=[];
  if (scanUnsigned(4, "bridge designer version",buf) != 2014) {
    throw ("bridge design file version is not 2014");
  }
  var scenarioCode = scanUnsigned(10, "scenario code");
  //TODO
  f.condition = condition_get_from_code(scenarioCode);
  if (f.condition== null) {
    throw ("invalid scenario " + scenarioCode);
  }
  var n_joints = scanUnsigned(2, "number of joints");
  var n_members = scanUnsigned(3, "number of members");
  for (var n = 1; n <= n_joints; n++)
  {
    var x = scanInt(3, "joint " + n + " x-coordinate")/4.;
    var y = scanInt(3, "joint " + n + " y-coordinate")/4.;
    //TODO getNPrescribedJoints
    if (i < f.condition.joints.length){
      var joint = f.condition.joints[n-1];
      if ((x != joint.x) || (y != joint.y))) {
        throw ("bad prescribed joint " + n);
      }
      f.joints.push(joint);
    }
    else
    {
      f.joints.push(Joint_new(n-1,x,y,false));
    }
  }
  for (var n = 1; n <= n_members; n++)
  {
    var jointANumber = scanUnsigned(2, "first joint of member " + n,buf);
    var jointBNumber = scanUnsigned(2, "second joint of member " + n,buf);
    var materialIndex = scanUnsigned(1, "material index of member " + n,buf);
    var sectionIndex = scanUnsigned(1, "section index of member " + n,buf);
    var sizeIndex = scanUnsigned(2, "size index of member " + n,buf);
    //TODO
    f.members.add(Member_new(n-1, f.joints[jointANumber - 1], f.joints[jointBNumber - 1], this.inventory.getMaterial(materialIndex), this.inventory.getShape(sectionIndex, sizeIndex)));i++;
  }
  Iterator<Member> e = this.members.iterator();
  while (e.hasNext())
  {
    Member member = (Member)e.next();
    member.setCompressionForceStrengthRatio(parseRatioEncoding(scanToDelimiter("compression/strength ratio")));
    member.setTensionForceStrengthRatio(parseRatioEncoding(scanToDelimiter("tension/strength ratio")));
  }
  this.designedBy = scanToDelimiter("name of designer");
  this.projectId = scanToDelimiter("project ID");
  this.iterationNumber = Integer.parseInt(scanToDelimiter("iteration"));
  this.labelPosition = Double.parseDouble(scanToDelimiter("label position"));
}
    
function scanUnsigned(width,what,buf){
  //throws IOException
  val = 0;
  while ((width > 0) && (buf.readBuf[buf.readPtr] == 32))
  {
    width--;
    buf.readPtr += 1;
  }
  while (width > 0) {
    if ((48 <= buf.readBuf[buf.readPtr]) && (buf.readBuf[buf.readPtr] <= 57))
    {
      val = val * 10 + (buf.readBuf[buf.readPtr] - 48);
      width--;
      buf.readPtr += 1;
    }
    else
    {
      throw ("couldn't scan " + what);
    }
  }
  return val;
}
function scanInt(width,what,buf){
  //throws IOException
  var val = 0;
  var negate_p = false;
  while ((width > 0) && (buf.readBuf[buf.readPtr] == 32))
  {
    width--;
    buf.readPtr += 1;
  }
  if ((width >= 2) && (buf.readBuf[buf.readPtr] == 45))
  {
    width--;
    buf.readPtr += 1;
    negate_p = true;
  }
  while (width > 0) {
    if ((48 <= buf.readBuf[buf.readPtr]) && (buf.readBuf[buf.readPtr] <= 57))
    {
      val = val * 10 + (buf.readBuf[buf.readPtr] - 48);
      width--;
      buf.readPtr += 1;
    }
    else
    {
      throw ("couldn't scan " + what);
    }
  }
  return negate_p ? -val : val;
}
function Joint_new(i,x,y,fixed){
    return {"index":i,"x":x,"y":y,"fixed":fixed};
}
