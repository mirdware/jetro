/** FUNCIONES DEPRECATED DE STD.JS **/
function isEmail(dato) {
	return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,4})+std.$/.test(dato);
}

function validateNum() {
	var e = std.evt.get();
	if(!/\d/.test(String.fromCharCode(e.charCode))) {
		e.preventDefault();
	}
}

/** PRUEBAS STD.JS **/
function ajaxReq() {
	std.evt.get().preventDefault();
	var form = std.ajax.form(this.form);
	std.ajax.request(this.form.action,function(r) {
		alert(r);
	},{
		data: form,
		method:form.method
	});
}

var i = 4;
function addItem() {
	std.$("#list").innerHTML += "<li><a href='modal.html' rel='modal' title='Ventana Modal'  id='Item"+i+"'>Item"+i+"</a></li>";
	i++;
}

/** EMILE.JS **/
(function(emile, container){
	var parseEl = document.createElement('div'),
		props = ('backgroundColor borderBottomColor borderBottomWidth borderLeftColor borderLeftWidth '+
				'borderRightColor borderRightWidth borderSpacing borderTopColor borderTopWidth bottom color fontSize '+
    			'fontWeight height left letterSpacing lineHeight marginBottom marginLeft marginRight marginTop maxHeight '+
    			'maxWidth minHeight minWidth opacity outlineColor outlineOffset outlineWidth paddingBottom paddingLeft '+
    			'paddingRight paddingTop right textIndent top width wordSpacing zIndex').split(' ');
				
	function interpolate(source,target,pos){
		return (source+(target-source)*pos).toFixed(3);
	}
	
	function s(str, p, c){
		return str.substr(p,c||1);
	}
	
	function color(source,target,pos){
		var i = 2,
			j, c,
			tmp,
			v = [],
			r = [];
		
		while(j=3,c=arguments[i-1],i--) {
			if(s(c,0)=='r') {
				c = c.match(/\d+/g);
				while(j--){
					v.push(~~c[j]);
				}
			} else {
				if(c.length==4){
					c='#'+s(c,1)+s(c,1)+s(c,2)+s(c,2)+s(c,3)+s(c,3);
				}
				while(j--) {
					v.push(parseInt(s(c,1+j*2,2), 16));
				}
			}
		}
	while(j--) {
		tmp = ~~(v[j+3]+(v[j]-v[j+3])*pos);
		r.push(tmp<0?0:tmp>255?255:tmp);
	}
	console.log('rgb('+r.join(',')+')');
    return 'rgb('+r.join(',')+')';
	}
	
	function parse(prop){
		var p = parseFloat(prop),
			q = prop.replace(/^[\-\d\.]+/,'');
		if(isNaN(p)){
			 return { v: q, f: color, u: ''};
		} else {
			return { v: p, f: interpolate, u: q };
		}
	}
	
	function normalize(style){
		var css,
			rules = {},
			i = props.length,
			v;
		parseEl.innerHTML = '<div style="'+style+'"></div>';
		css = parseEl.childNodes[0].style;
		while(i--){
			if(v = css[props[i]]){
				rules[props[i]] = parse(v);
			}
		}
		return rules;
	}
	
	container[emile] = function(el, style, opts, after){
		if(typeof el == 'string') {
			el = document.getElementById(el);
		}
		opts = opts || {};
		var target = normalize(style),
			comp = el.currentStyle ? el.currentStyle : getComputedStyle(el, null),
			prop,
			current = {},
			start = +new Date,
			dur = opts.duration||200,
			finish = start+dur,
			interval,
			easing = opts.easing || function(pos){ return (-Math.cos(pos*Math.PI)/2) + 0.5; };
		for(prop in target){
			current[prop] = parse(comp[prop]);
		}
		interval = setInterval(function(){
			var time = +new Date,
				pos = time>finish ? 1 : (time-start)/dur;
			for(prop in target) {
				el.style[prop] = target[prop].f(current[prop].v,target[prop].v,easing(pos)) + target[prop].u;
			}
			if(time>finish) {
				clearInterval(interval);
				opts.after && opts.after();
				after && setTimeout(after,1);
			}
		},10);
	}

})('emile', this);

/** stdQuery **/
std.query = (function(window, undefined) {
	var core = {
		click: function(fn, capture) {
			if(this.length) {
				for(var i=0,el; el = this[i]; i++) {
					std.evt.add(el, "click", fn, capture);
				}
			} else {
				std.evt.add(this, "click", fn, capture);
			}
		}
	};
	
	return function (id, node, tag) {
		return std.extend(std.$(id, node, tag), core);
	}
})(window);

std.ready(function() {
	std.query("#hijo").click(function() {
		alert("Probando un nuevo plugin");
	});
});

/** Funciones pruebas **/
function type (obj) {
  return ({}).toString.call(obj).match(/\s([a-z|A-Z]+)/)[1].toLowerCase()
}

std.ready(function() {
	std.evt.add(std.$("#modalcache"), "click",std.modal.show);
	std.evt.add(std.$("#std"),"click",ajaxReq);
	std.evt.add(std.$("#showHide"),"click",function() {
		std.evt.get().preventDefault();
		var opt = std.ajax.form(this.form);
		if(isNaN(opt.duracion) || isNaN(opt.fps)) {
			return;
		}
		var target = std.$("#mover");
		if(!target.block) {
			std.sfx.fade(std.$('#mover'),opt.duracion,opt.fps);
			target.block = true;
			setTimeout(function() {
				target.block = false;
			}, opt.duracion);
		}
	});
	std.evt.add(std.$("#mover"),"mousedown",function(){
		std.sfx.dyd(std.evt.get(), std.$("#mover"),std.$("#prueba"));
	});
	std.evt.add(std.$("#target"),{
		click: function () {
			if(std.css(this).get("width") == "20px") {
				std.sfx.anim(this, {
					width:"100px",
					height:"100px"
				}, {
					duration:500
				});
			} else {
				std.sfx.anim(this, {
					width:"20px",
					height:"20px"
				}, {
					duration:500
				});
			}
		},
		mouseover: function() {
			std.sfx.anim(this, {
				backgroundColor: "#F00"
			}, {
				duration: 500
			});
		},
		mouseout: function() {
			std.sfx.anim(this, {
				backgroundColor: "#0CC"
			}, {
				duration:500
			});
		}
	});
	std.evt.add(std.$("#prototype"),"click",function() {
		var str = '{"hola":[1,2,3,4],"mundo":{"uno":1,"dos":"dos"}}';
		alert(JSON.parse(str));
		var obj = {"hola":[1,2,3,4],"mundo":{"uno":1,"dos":"dos"}};
		alert(JSON.stringify(obj));
		window.sessionStorage.clear();
	});
	std.evt.add(std.$("@duracion")[0],"keypress",validateNum);
	std.evt.add(std.$("@fps")[0],"keypress",validateNum);
	
	std.evt.add(std.$("#target2"), {
		mouseover: function() {
			emile(this, "background-color: #F00", {
				duration: 500
			});
		},
		mouseout: function() {
			emile(this, "background-color: #0CC", {
				duration: 500
			});
		},
		click: function() {
			if(std.css(this).get("width") == "20px") {
				emile(this, "width:100px;height:100px;", {
					duration: 500
				});
			} else {
				emile(this, "width:20px;height:20px;", {
					duration: 500
				});
			}
		}
	});
	std.evt.add([std.$("#hijo"), std.$("#prototype")], "click", function(){alert("multiapt")});
	std.evt.on(std.$("#list"),"#Item5","click", onPrueba);
	std.evt.on(std.$("#observador"), "a", "click",  onPrueba);
	std.evt.add(std.$(".pruebaCSS"), "click", function() {
		var color = std.css(this).get("background-color");
		std.$("#result").innerHTML = "Este div es de color <span style='color:" +
						 color + ";'>" + color + "</span>.";
	});
});

function onPrueba() {
	alert(this.nodeName+" - "+this.id);
	std.evt.get().preventDefault();
}