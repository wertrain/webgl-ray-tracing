var RayTracing = {};
{
    'use strict';
    
    RayTracing.Common = {};
    let CreateShaderText = function(shaderElementId) {
        let shaderElement = document.getElementById(shaderElementId);
        let allCode = shaderElement.innerHTML;
        let allCodeArray = allCode.split(/\r\n|\r|\n/);
        // 現在のシェーダー記述方法にに合わせて
        // 先頭の半角スペースとタブを（半ば決め打ちで）カットする
        let editorText = '';
        for (let i = allCodeArray[0].length === 0 ? 1 : 0; i < allCodeArray.length - 1; ++i) {
            let temp = allCodeArray[i];
            let spaceSize = 4;
            if (temp[0] === ' ')
                temp = temp.substring(spaceSize * 2, temp.lenght)
            else if (temp[0] === '	')
                temp = temp.substring(1 * 2, temp.lenght)
            editorText += temp + '\r\n';
        }
        return editorText;
    };
    RayTracing.Common.Initialize = function() {
        let aceUtil = new RayTracing.AceUtil();
        let text = CreateShaderText('fs');
        aceUtil.presetEditorText('editor', text);
        aceUtil.create('editor');
    };
}