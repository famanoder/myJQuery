
function inArray(v,arr){
	var k=-1;
	for(var i=0;i<arr.length;i++){
		if (arr[i]===v) {
			k=i;
			break;
		}
	}
	return k;
}
String.prototype.startWith=function(str){
	return !!~this.indexOf(str);
}
function matchClass(selector){
	var clas=[];
	selector.replace(/\.([\w-]+)/gi,function(a,b){
		clas.push(b);
	});
	return clas;
}
function matchId(selector){
	var id=selector.match(/#([\w-]+)/i);
	return id?[id[0].slice(1)]:[];
}
function matchElement(selector){
	var els=selector.match(/^\w+/i);
	return els?[els[0]]:[];
}
function matchAttr(selector){
	var attrs=[];
	selector.replace(/\[([\w-]+=["'].*?["'])\]/gi,function(a,b){
		attrs.push(b.replace(/"|'/g,''));
	});
	return attrs;
}
function parseOneLevelSelector(selector){
	return {
		clas:matchClass(selector),
		id:matchId(selector),
		els:matchElement(selector),
		attrs:matchAttr(selector)
	}
}
function matchSibling(selector,nodes){
	var siblings=[],next=null;
	for(var i=0;i<nodes.length;i++){
		next=nodes[i].nextSibling;
		while(next&&next.nodeType!==1){
			next=next.nextSibling;
		}
		siblings.push(next);
	}
	return matchNodes(selector,siblings);
}
function matchChildren(selector,nodes){
	var children=[];
	for(var i=0;i<nodes.length;i++){
		if (onlyId(selector)) {
			children.push(getById(selector));
		}else if (onlyElement(selector)) {
			children=children.concat(getByTag(selector));
		}else{
			var elems=nodes[i].getElementsByTagName('*');
			children=children.concat(matchNodes(selector,elems));
		}
	}
	return children;
}
function matchSon(selector,nodes){
	var son=[];
	for(var i=0;i<nodes.length;i++){
		if (nodes[i].hasChildNodes()) {
			var childs=nodes[i].childNodes;
			for(var j=0;j<childs.length;j++){
				if (childs[j].nodeType===1) son=son.concat(matchNodes(selector,[childs[j]]));
			}
		}
	}
	return son;
}
function parseManyLevelSelector(selectors,nodes){
	// 兄弟选择器分隔符（+）
	// 子孙选择器分隔符（空格）
	// 子选择器分隔符（>）
	var levelType={
		sibling:'+',
		children:' ',
		son:'>'
	}
	//切分多级选择器：第一个符号作为分隔符，之后为选择器
	//每级选择器由单个选择器组合
	selectors=selectors.replace(/([\+\s>])/g,'\\$1$&').split(/\\[\+\s>]/);
	var _selectors=selectors.slice(1);
	var res=matchNodes(selectors[0],nodes);
	while(_selectors.length){
		var selector=_selectors.shift();
		if (selector.startWith(levelType.sibling)) {
			res=matchSibling(selector.slice(1),res);
		}
		if (selector.startWith(levelType.children)) {
			res=matchChildren(selector.slice(1),res);
		}
		if (selector.startWith(levelType.son)) {
			res=matchSon(selector.slice(1),res);
		}
	}
	return res;
}
function matchNodes(selector,nodes) {
	var // class id element attribute
		parsedSelector=parseOneLevelSelector(selector),
		clas=parsedSelector.clas,
		id=parsedSelector.id,
		els=parsedSelector.els,
		attrs=parsedSelector.attrs,
		res=[];
	for(var i=0;i<nodes.length;i++){
		var el=nodes[i],types=0,passed=0;
		if (clas.length) {
			types++;
			var _c=0;
			for(var c=0;c<clas.length;c++){
				if (!~inArray(clas[c],nodes[i].className.split(/\s+/))) {
					_c++;
				}
			}
			if (_c) {
				continue;
			}else{
				passed++;
			};
		}
		if (id.length) {
			types++;
			if(nodes[i].id!==id[0]) {
				continue;
			}else{
				passed++;
			}
		}
		if (els.length) {
			types++;
			if (nodes[i].tagName.toLowerCase()!==els[0].toLowerCase()) {
				continue;
			}else{
				passed++;
			};
		}
		if (attrs.length) {
			types++;
			var _a=0;
			for(var c=0;c<attrs.length;c++){
				var attr=attrs[c].split('=');
				if (nodes[i].getAttribute(attr[0])!==attr[1]) {
					_a++;
				}
			}
			if (_a) {
				continue;
			}else{
				passed++;
			};
		}
		if (passed>0&&types>0&&passed===types) {
			res.push(nodes[i]);
		}
	}
	return res;
};
function getById(id){
	return document.getElementById(id);
}
function getByTag(elem){
	return [].slice.call(document.getElementsByTagName(elem),0);
}
function onlyId(selector){
	return /^#[\w-]+$/i.test(selector);
}
function onlyElement(selector){
	return /^[\w-]+$/i.test(selector);
}
function querySelectorAll(selector){
	if (onlyId(selector)) return getById(selector);
	if (onlyElement(selector)) return getByTag(selector);
	var elems=document.getElementsByTagName('*');
	
	return parseManyLevelSelector(selector,elems);
};

document.querySelectorAll=document.querySelectorAll||querySelectorAll;