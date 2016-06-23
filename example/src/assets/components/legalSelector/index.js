/**
 * 法律声明选择器 (Rodey)
 */
;(function(){
    'use strict';

    function LegalSelector(){
        this.selector = document.querySelector('#selector');
        this.container = document.querySelector('#legal-selector');
        this._init();
    }

    LegalSelector.prototype = {
        constructor: LegalSelector,
        _init: function(){
            this.container.addEventListener('click', this.legal_selector.bind(this), false);
        },
        check: function(flag){
            return !flag ? this.selector.getAttribute('checked')
                        : (this.selector.setAttribute('checked', 'checked'),
                            this.selector.classList.add('checked'));
        },
        legal_selector: function(evt){
            var selector = this.selector,
                checked = this.selector.getAttribute('checked'),
                chStr = 'checked';
            if(checked === chStr){
                selector.removeAttribute('checked');
                selector.classList.remove(chStr);
            }else{
                selector.setAttribute('checked', chStr);
                selector.classList.add(chStr);
            }
            evt.preventDefault();
            evt.stopPropagation();
        }
    };

    window['LegalSelector'] = new LegalSelector();
})();



//$(function(){
//
//    function LegalSelector(){
//        this.selector = $('#selector');
//        this.container = $('#legal-selector');
//        this._init();
//    }
//
//    LegalSelector.prototype = {
//        constructor: LegalSelector,
//        _init: function(){
//            this.container.on('click', this.legal_selector.bind(this));
//        },
//        check: function(flag){
//            return !flag ? this.selector.attr('checked')
//                : (this.selector.attr('checked', 'checked'), this.selector.addClass('checked'));
//        },
//        legal_selector: function(evt){
//            var selector = this.selector,
//                checked = this.selector.attr('checked'),
//                chStr = 'checked';
//            if(checked === chStr){
//                selector.removeAttr('checked');
//                selector.removeClass(chStr);
//            }else{
//                selector.attr('checked', chStr);
//                selector.addClass(chStr);
//            }
//            evt.preventDefault();
//            evt.stopPropagation();
//        }
//    };
//
//    window['LegalSelector'] = new LegalSelector();
//
//});
