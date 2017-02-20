const analyzeBridge = require('./analysis');
const _ = require('underscore');
window.wpbdg_new = () => {

}

$("#file").on('change', function(){
  var reader = new FileReader();

  reader.onload = function(e) {
      var rawData = reader.result;
      var str = wpbd_endecrypt_rc4(rawData, rawData.size);
  }

  reader.readAsBinaryString(this.files[0]);
});
window.wpbdg_load = () => {
    const options = {

        // Required. Called when a user selects an item in the Chooser.
        success: function(files) {
            $.ajax({
                url: files[0].link,
                type: 'get',
                async: false,
                beforeSend: function( xhr ) {
                    xhr.overrideMimeType( "text/plain; charset=x-user-defined" );xhr.responseType = "arraybuffer";
                },
                success: function(html) {
                    tmp2=[html,files[0]];
                    alert(wpbd_endecrypt_rc4(html,files[0].bytes));
                }
            });
        },

        // Optional. Called when the user closes the dialog without selecting a file
        // and does not include any parameters.
        cancel: function() {
        },

        // Optional. "preview" (default) is a preview link to the document for sharing,
        // "direct" is an expiring link to download the contents of the file. For more
        // information about link types, see Link types below.
        linkType: "direct", // or "direct"

        // Optional. A value of false (default) limits selection to a single file, while
        // true enables multiple file selection.
        multiselect: false, // or true

        // Optional. This is a list of file extensions. If specified, the user will
        // only be able to select files with these extensions. You may also specify
        // file types, such as "video" or "images" in the list. For more information,
        // see File types below. By default, all extensions are allowed.
        extensions: ['.bdc']
    };
    console.debug("choose");
    Dropbox.choose(options);
}
window.wpbdg_save = () => {

}
window.wpbdg_undo = () => {
    wpbdg.manager.undo();
    if(!wpbdg.manager.undoable()){
        $("wpbd_undo").button("disable");
    }
    wpbdg.update();
}
window.wpbdg_redo = () => {
    wpbdg.manager.redo();
    if(!wpbdg.manager.redoable()){
        $("wpbd_redo").button("disable");
    }
    wpbdg.update();
}
window.wpbdg_analyze = () => {
    wpbdg.result=analyzeBridge(wpbdg.bridge,null);
    var members=wpbdg.bridge.members;
    var size=members.length;
    _.each(wpbdg.result.members, (memberResult, im) => {
      members[im].compressionForceStrengthRatio = memberResult.maxCompressiveForce / memberResult.compressiveStrength;
      members[im].tensionForceStrengthRatio = memberResult.maxTensileForce / memberResult.tensileStrength;;
    });
    wpbdg.updateFlag("analyze");
    wpbdg.update();
}
window.wpbdg_delete = () => {
    var order=wpbdg.bridge.tryDelete();
    wpbdg.manager.doOrder(order);
    wpbdg.update();
}
window.wpbdg_addjoint = () => {
    //TODO
}
window.wpbdg_addmember = () => {
    var mt=wpbdg.mt_select.val();
    var cs=wpbdg.cs_select.val();
    var wd=wpbdg.wd_select.val();
    if(mt==-1||cs==-1||wd==-1){
        return;
    }
    var order=wpbdg.bridge.tryAddMember(mt,cs,wd);
    wpbdg.manager.doOrder(order);
    wpbdg.update();
}
