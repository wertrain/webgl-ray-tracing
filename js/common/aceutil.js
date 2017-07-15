{
    'use strict';

    /** 
     * Ace ユーティリティ
     * @constructor 
     */
    let AceUtil = function() {

    };
    /**
     * Ace の初期表示テキストを設定する
     *
     */
    AceUtil.prototype.PresetEditorText = function(editorId, text) {
        let editorElement = document.getElementById(editorId);
        editorElement.innerHTML = text;
    }
    /** 
     * Ace の作成する
     *
     */
    AceUtil.prototype.Create = function(editorId) {
        var editor = ace.edit(editorId);
        editor.$blockScrolling = Infinity;
        editor.setOptions({
            showInvisibles: true
        });
        editor.setTheme('ace/theme/monokai');
        editor.getSession().setMode('ace/mode/javascript');
        editor.getSession().setUseWorker(false)
    };
    RayTracing.AceUtil = AceUtil;
}