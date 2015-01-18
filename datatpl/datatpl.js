;(function (context){
    ;(function (tpl){
        if(typeof define==='undefined'){
            context.tpl=tpl;
        }else{
            define(function (require,exports){
                exports.tpl=tpl;
            });
        }
    })(tpl);

    function tpl(selector){
        return new Template(selector);
    }

    function Template(selector){
        var oTpl=document.querySelector('[data-tpl='+selector+']');
        var oTmp=document.createElement('div');
        insert(oTmp,oTpl);
        oTmp.appendChild(oTpl);

        var tag=oTpl.dataset.tag;
        oTmp.innerHTML=oTmp.innerHTML.replace(/(<|<\/)template(?=[\s>])/g,function ($0,$1){
            return $1+tag;
        });

        this.oTpl=oTmp.children[0];
        insert(this.oTpl,oTmp);
        remove(oTmp);
    }

    Template.prototype.render=function (data,callback){
        var oRpt=this.oTpl.querySelectorAll('[data-repeat]')[0];
        var keyLen=oRpt.dataset.repeat.split('*');
        var key=keyLen[0];
        var len=parseInt(keyLen[1]);
        var re=/{[^{}]+}/g;

        analyze();
        compile.call(this);

        callback&&callback();

        function analyze(){
            var oTmp=document.createElement('div');

            insert(oTmp,oRpt);
            oTmp.appendChild(oRpt);

            var line=oTmp.innerHTML;
            var lines='';
            
            for(var i=0;i<len;i++){
                lines+=line.replace(re,function (s){
                    return s.replace(key,i);
                });
            }

            oTmp.innerHTML=lines;

            var aElems=[];

            for(var i=0;i<len;i++){
                var obj=oTmp.children[i]
                obj.removeAttribute('data-repeat');
                aElems.push(obj);
            }

            for(var i=0;i<len;i++){
                insert(aElems[i],oTmp);
            }

            remove(oTmp);    
        }

        function compile(oTpl){
            var src=this.oTpl.innerHTML;
            var html=src.replace(re,function (s){
                return getText(data,s.slice(1,-1));
            });

            this.oTpl.innerHTML=html;
            delAttr(this.oTpl,['data-tpl','data-tag']);
        }
    }

    function delAttr(obj,arr){
        for(var i=0;i<arr.length;i++){
            obj.removeAttribute(arr[i]);
        }
    }

    function insert(obj1,obj2){
        obj2.parentNode.insertBefore(obj1,obj2);
    }

    function remove(obj){
        obj.parentNode.removeChild(obj);
    }

    function getText(data,name){
        if(name.indexOf('.')!==-1){
            var arr=name.split('.');
            var json=deepCopy(data);
            for(var i=0;i<arr.length;i++){
                json=json[arr[i]];
            }
            return json;
        }else{
            return data.name;
        }
    }

    function deepCopy(data){
        var json={};
        for(var key in data){
            if(typeof data[key]==='object'){
                json[key]=deepCopy(data[key]);
            }else{
                json[key]=data[key];
            }
        }
        return json;
    }

})(this);
