/**
 * 法律声明选择器 (Rodey)
 */
;(function(){
    'use strict';

    function LegalSelector(){
        this.selector = $('#selector');
        this.container = $('#legal-selector');
        this._init();
    }

    LegalSelector.prototype = {
        constructor: LegalSelector,
        _init: function(){
            this.container.on('click', $.proxy(this.legal_selector, this));
        },
        check: function(flag){
            if(typeof flag === 'undefined'){
                return this.selector.checked || this.selector.prop('checked');
            }
            else if(flag){
                this._addChecked();
            }else{
                this._removeChecked();
            }
        },
        legal_selector: function(evt){
            if(this.selector.attr('checked') === 'checked'){
                this._removeChecked();
            }else{
                this._addChecked();
            }
            console.log(this.check());
            evt.preventDefault();
            evt.stopPropagation();
        },
        _addChecked: function(){
            var selector = this.selector,
                chStr = 'checked';
            selector.attr(chStr, chStr).prop(chStr, true);
            selector.addClass(chStr);
            //selector.checked = true;
        },
        _removeChecked: function(){
            var selector = this.selector,
                chStr = 'checked';
            selector.removeAttr(chStr).removeProp(chStr);
            selector.removeClass(chStr);
            //selector.checked = false;
        }
    };

    window['LegalSelector'] = new LegalSelector();
}).call(this);