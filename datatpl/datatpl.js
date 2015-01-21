/*
 * https://github.com/adonpro/datatpl
 * */

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
        
    Template.prototype.render=function (Fod){
        if(typeof Fod==='function'){
            this.scope=new Fod();
        }else if(typeof Fod==='object'){
            this.scope=deepCopy(Fod);
        }

        analyze(this);    

        this.callback&&this.done();

        return this;
    };

    Template.prototype.done=function (callback){
        this.callback=callback;
        callback&&callback.call(this.scope);
    };

    function analyze(obj){
        var aRpt=obj.oTpl.querySelectorAll('[data-repeat]');

        for(var i=0;i<aRpt.length;i++){
            obj.oRpt=aRpt[i];
            obj.keyLen=obj.oRpt.dataset.repeat.split('*');
            spread(obj);
        }

        compile(obj);
    }

    function spread(obj){
        var oTmp=document.createElement('div');
        var key=obj.keyLen[0];
        var len=getLen.call(obj.scope,obj.keyLen[1]);

        insert(oTmp,obj.oRpt);
        oTmp.appendChild(obj.oRpt);

        var line=oTmp.innerHTML;
        var lines='';
        var re=new RegExp('\\['+key+'\\]','g');
        
        for(var i=0;i<len;i++){
            lines+=line.replace(re,'.'+i);
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

    function compile(obj){
        var re=/{[^{}]+}/g;
        var src=obj.oTpl.innerHTML;
        var html=src.replace(re,function (s){
            return getText(obj.scope,s.slice(1,-1));
        });

        obj.oTpl.innerHTML=html;
        delAttr(obj.oTpl,['data-tpl','data-tag']);
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

    function getLen(str){
        var num=parseInt(str);

        if(isNaN(num)){
            return getText(this,str);
        }else{
            return num;
        }
    }

    function getText(data,str){
        var name=judge(str);
        var reStr=/^'\w+'$/g;
        var reObj=/\./g;

        if(reStr.test(name)){
            return name.slice(1,-1);
        }else if(reObj.test(name)){
            var arr=name.split('.');
            var json=deepCopy(data);
            for(var i=0;i<arr.length;i++){
                json=json[arr[i]];
            }
            return json;
        }else{
            return data[name];
        }
    }

    function judge(name){
        var reg=/\?|\:/g;
        var arr=name.split(reg);

        if(arr.length===1){
            return arr[0];
        }else{
            if(arr[0]){
                return arr[1];
            }else{
                return arr[2];
            }
        }
    }

    function deepCopy(data){
        var json={};
        for(var key in data){
            if(typeof data[key]==='object'){
                json[key]=deepCopy(data[key]);
                if(Object.prototype.toString.call(data[key])==='[object Array]'){
                    json[key].length=data[key].length;
                }
            }else{
                json[key]=data[key];
            }
        }
        return json;
    }

})(this);
