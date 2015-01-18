;(function (context){
    var oTpl=document.querySelector('[data-tpl]');
    var oRpt=oTpl.querySelectorAll('[data-repeat]')[0];
    var keyLen=oRpt.dataset.repeat.split('*');
    var oTmp=document.createElement('div');
    var oPar=oRpt.parentNode;
    var re=/{[^{}]+}/g;
    var key=keyLen[0];
    var len=parseInt(keyLen[1]);
    var html='';
    var aElems=[];
    
    function render(data,callback){
        oPar.insertBefore(oTmp,oRpt);
        oTmp.appendChild(oRpt);
        
        var line=oTmp.innerHTML;
        
        for(var i=0;i<10;i++){
            var iLine=line.replace(re,function (s){
                return s.replace(key,i);
            });
            html+=iLine;
        }

        oTmp.innerHTML=html;

        for(var i=0;i<len;i++){
            var obj=oTmp.children[i]
            obj.removeAttribute('data-repeat');
            aElems.push(obj);
        }

        for(var i=0;i<len;i++){
            oPar.insertBefore(aElems[i],oTmp);
        }

        oPar.removeChild(oTmp);

        var src=oTpl.innerHTML;
        
        var html=src.replace(re,function (s){
            var name=s.slice(1,-1);
            return getText(data,name);
        });
        oTpl.innerHTML=html;

        oTpl.removeAttribute('data-tpl');

        callback&&callback();

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

    (function (render){
        if(typeof define==='undefined'){
            context.render=render;
        }else{
            define(function (require,exports){
                exports.render=render;
            });
        }
    })(render);
})(this);
