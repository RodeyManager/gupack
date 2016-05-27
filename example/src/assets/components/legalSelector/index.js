/**
 * 法律声明选择器 (Rodey)
 */
;(function(){
    'use strict';

    function LegalSelector(){
        this.selector = document.querySelector('#selector');
        this.container = document.querySelector('#legal-selector');
        this.eventType = 'ontouchstart' in window ? 'ontouchend' : 'onclick';
        this._init();
    }

    LegalSelector.prototype = {
        constructor: LegalSelector,
        _init: function(){
            this.selector.addEventListener('click', this.legal_selector.bind(this), false);
        },
        check: function(flag){
            return !flag ? this.selector.getAttribute('checked')
                        : (this.selector.setAttribute('checked', 'checked'), this.selector.classList.add('checked'));
        },
        legal_selector: function(evt){
            evt.preventDefault();
            evt.stopPropagation();
            var target = evt.target;
            if(target.tagName === 'A'){
                location.href = target.href;
                return false;
            }
            var selector = this.selector,
                checked = this.selector.getAttribute('checked'),
                chStr = 'checked';
            if(checked === 'checked'){
                selector.removeAttribute('checked');
                selector.classList.remove(chStr);
            }else{
                selector.setAttribute('checked', chStr);
                selector.classList.add(chStr);
            }
        }
    };

    window['LegalSelector'] = new LegalSelector();
})();
