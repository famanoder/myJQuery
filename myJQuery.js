var Utils=function(){
  var ie=function(ua){
    var iebool=/msie/ig.test(ua);
    return {
      is:function(){
        return iebool;
      },
      v:iebool?ua.match(/msie (\d+)/)[1]:undefined,
      ie11:/\srv:\d+\.\d+\)\slike\sgecko$/i.test(ua)
    }
  }(navigator.userAgent.toLowerCase());
  var Browser={
    isIE:ie.is(),
    IEVersion:ie.v,
    isIE11:ie.ie11
  }
  function str(int,len) {
    int=int<2?2:int>32?32:Math.floor(int);
    len=Math.max(len,2);
    return Math.random().toString(int).slice(2,len+2);
  }
  return {
    Browser,
    str
  }
}();

var $events={};
function $(el){
  function parseHtm(html){
    // 解析html
    var $htm = String(html).match(/<(\w+).*?>(.*?)<\/\1>$/);
    var tag = null;
    if ($htm) {
      var attrs = html.match(/<.+?>/)[0].match(/[\w\-]+=["'].*?["']/g)
      tag = document.createElement($htm[1]);
      tag.innerHTML=$htm[2];
      if (attrs&&attrs.length) {
        attrs.forEach(function(item){
          var $item=item.split(/=/);
          tag.setAttribute($item[0], $item[1].replace(/'|"/g,''));
        });
      };
    }
    return tag||document.createTextNode(html);
  }
  function events(type,fn){
    Array.from($$(el)).forEach(function(el){
      el.addEventListener(type,function(evt){
        var f=Utils.str(20,10);
        el.setAttribute('data-f',f);
        var $el=$('[data-f="'+f+'"]');
        $el.removeAttr('data-f');
        fn&&fn.call($el,evt);
      },false);
    });
  }
  var evts={};
  ['click','focus','blur'].forEach(function(evt){
    evts[evt]=function(fn){
      events(evt,fn);
    }
  });
  var $obj = $$(el);
  var __fg__=0;
  return Object.assign($obj,{
    off:function(eventTypes){
      // 仅解绑on绑定的事件
      if (eventTypes==undefined) eventTypes='click';
      Array.from(this).forEach(function($this){
        for(var $type in $events[el].evtsPool){
          if (~eventTypes.split(/\s+|,/).indexOf($type)) {
            $this.removeEventListener($type,$events[el].evtsPool[$type].eventHandle);
          };
        }
      });
    },
    on:function(type,tar,fn){
      if (!$events[el]) {
        $events[el]={
          evtsPool:{}
        };
      };
      __fg__++;
      // 收集被委托方接收到的所有【事件类型，事件节点，事件处理函数】
      
      if ($events[el].evtsPool[type]) {
        $events[el].evtsPool[type].push({
          tar:tar,
          fn:fn
        });
      }else{
        $events[el].evtsPool[type]=[{
          tar:tar,
          fn:fn
        }]
      };
      if (__fg__<=1) {
        // 每一个被委托方仅执行一次
        var _this=this;
        setTimeout(function(){
          //所有事件委托收集完毕
          //阻止事件绑定多次执行
          Array.from(_this).forEach(function($el){
            for(var $type in $events[el].evtsPool){
              var eventHandle=function(evt){
                var $f=Utils.str(20,10);
                evt.target.setAttribute('data-f', $f);
                var $evt=$('[data-f="'+$f+'"]');
                var $evts=$events[el].evtsPool[$type];
                if ($evts.length) {
                  var _tar=null,_fn=null;
                  for(var i=0;i<$evts.length;i++){
                    if ($el.querySelectorAll($evts[i].tar).length>0) {
                      $evt.addClass('data-event-target');
                        Array.from($el.querySelectorAll($evts[i].tar)).forEach(function(ta){
                          if (evt.target==ta) {
                            _tar=ta;
                          }else{
                            if (ta.querySelectorAll('.data-event-target').length) {
                              _tar=ta;
                            }
                          };
                          if (_tar!=null) {
                            _fn=$evts[i].fn;
                            return false;
                          }
                        });
                      $evt.removeClass('data-event-target').removeAttr('data-f');
                        if (_tar!=null) {
                          _fn=$evts[i].fn;
                          break;
                        }
                    }
                  }
                  if (_tar!=null) {
                    var f=Utils.str(20,10);
                    _tar.setAttribute('data-f', f);
                    var $res=$('[data-f="'+f+'"]');
                    $res[0].removeAttribute('data-f');
                    _fn&&_fn.call($res,evt);
                  };
                };
              }
              $events[el].evtsPool[$type].eventHandle=eventHandle;
              $el.addEventListener($type,eventHandle,false);
            }
          });
        },0);
      };
      return this;
    },
    parent:function(){
      var f=Utils.str(20,10);
      Array.from(this).forEach(function($this){
        $this.parentNode.setAttribute('data-parent-node',f);
      });
      var res=$('[data-parent-node="'+f+'"]');
      res.removeAttr('data-parent-node');
      return res;
    },
    parents:function(el){
      if (el==undefined) {
        return this.parent();
      }else{
        var $els=Array.from($(el));
        if ($els.length) {
          var f=Utils.str(20,10);
          Array.from(this).forEach(function($this){
            if ($this.parentNode.tagName=='body'&&~$els.indexOf($this.parentNode)) {
              $this.parentNode.setAttribute('data-f', f);
            }else{
              var $tag='';
              while($tag!='body'){
                $this=$this.parentNode;
                $tag=$this.tagName;
                if (~$els.indexOf($this)) {
                  $this.setAttribute('data-f', f);
                  break;
                }
              }
            };
          });
          var $res=$('[data-f="'+f+'"]');
          $res.removeAttr('data-f');
          return $res;
        };
      };
    },
    hasClass:function(clas){
      return ~this[0].className.split(/\s+/).indexOf(clas);
    },
    addClass:function(clas){
      Array.from(this).forEach(function(elem){
        elem.className=Array.from(new Set(elem.className.split(/\s+/).concat([clas]))).join(' ');
      });
      return this;
    },
    removeClass:function(clas){
      Array.from(this).forEach(function(elem){
        elem.className=elem.className.split(/\s+/).filter(function($clas){return $clas!=clas}).join(' ');
      });
      return this;
    },
    attr:function(key,val){
      if (val==undefined) {
        var attrs = Array.from(this).map(function($this){
          return $this.getAttribute(key);
        });
        return attrs.length==1?attrs[0]:attrs;
      }else{
        Array.from(this).forEach(function($this){
          $this.setAttribute(key, val);
        });
        return this;
      };
    },
    removeAttr:function(attr){
      Array.from(this).forEach(function($this){
        $this.removeAttribute(attr);
      });
      return this;
    },
    html:function(str){
      var result=this;
      Array.from(this).forEach(function(elem){
        if (str==undefined) {
          result = elem.innerHTML;
        }else{
          elem.innerHTML=str;
        };
      });
      return result;
    },
    append:function(html){
      var tag=parseHtm(html);
      Array.from(this).forEach(function($this){
        $this.appendChild(tag);
      });
      return this;
    },
    remove:function(){
      Array.from(this).forEach(function($this){
        $this.parentNode.removeChild($this);
      });
      return this;
    },
    find:function(clas){
      var f=Utils.str(20,10);
      Array.from(this).forEach(function($this){
        Array.from($this.querySelectorAll(clas)).forEach(function($$this){
          $$this.setAttribute('data-f',f);
        });
      });
      var $res=$('[data-f="'+f+'"]');
      $res.removeAttr('data-f');
      return $res;
    },
    before:function(html){
      var node=parseHtm(html);
      Array.from(this).forEach(function($this){
        $this.parentNode.insertBefore(node, $this);
      });
      return this;
    },
    after:function(html){
      var node=parseHtm(html);
      Array.from(this).forEach(function($this){
        var $next=$this.nextSibling;
        if ($next) {
          var nextType=$next.nodeType;
          if (nextType==1) {
            //element
            $next.parentNode.insertBefore(node, $next);
          }else if(nextType==3){
            //#text
            $this.parentNode.replaceChild(node,$next);
            $this.parentNode.appendChild($next);
          };
        }else{
          //null
          $this.parentNode.appendChild(node);
        };
      });
      return this;
    },
    pre:function(){},
    next:function(){},
    css:function(cssText){
      Array.from(this).forEach(function($this){
        $this.style.cssText+=cssText;
      });
      return this;
    },
    val:function(v){
      if (v==undefined) {
        return this[0].value;
      }else{
        Array.from(this).forEach(function($this){
          $this.value=v;
        });
      };
      return this;
    }
  },evts,$.extend);
};

function $$(el){
  return document.querySelectorAll(el);
};