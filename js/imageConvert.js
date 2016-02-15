

!function() {
	// default char values
	var chars = ['@','#','$','=','*','!',';',':','~','-',',','.','&nbsp;', '&nbsp;'];
	var charLen = chars.length-1;
	function getChar(val) { 
		return chars[parseInt(val*charLen, 10)]; 
	}

	function logError(err) { 
		if(console && console.log) console.log('Error!', err); return false; 
	}

	function setChars(arr){
		chars = arr;
		charLen = chars.length-1;
	}
	
	function imageConvert(params) {
		var self = this;
		setChars(params.chars);
		var el = this.el = params.el;
		this.container = params.container;
		this.fn = typeof params.fn === 'function' ? params.fn : null;
		this.width = typeof params.width === 'number' ? params.width : 150;
		this.color = !!params.color;
		this.canvas = document.createElement('canvas');
		this.ctx = this.canvas.getContext('2d');
		self.render(); 
		
	}

	imageConvert.prototype.dimension = function(width, height) {
		if(typeof width === 'number' && typeof height === 'number') {
			this._scaledWidth = this.canvas.width = width;
			this._scaledHeight = this.canvas.height = height;
			return this;
		} else {
			return { width: this._scaledWidth, height: this._scaledHeight };
		}
	};

	imageConvert.prototype.render = function() {
		var el = this.el, ratio;
		var dim = this.dimension(), width, height;
		if(!dim.width || !dim.height) {
			ratio = el.height/el.width;
			this.dimension(this.width, parseInt(this.width*ratio, 10));
			dim = this.dimension();
		}
		width = dim.width;
		height = dim.height;

		if(!width || !height) return;
		this.ctx.drawImage(this.el, 0, 0, width, height);
		this.imageData = this.ctx.getImageData(0, 0, width, height).data;
		var asciiStr = this.getAsciiString();
		if(this.container) this.container.innerHTML = asciiStr;
		if(this.fn) this.fn(asciiStr);
	};


	imageConvert.prototype.getAsciiString = function() {
		var dim = this.dimension(), width = dim.width, height = dim.height;
		var len = width*height, d = this.imageData, str = '';
		var getRGB = function(i) { 
			return [d[i=i*4], d[i+1], d[i+2]]; 
		};

		for(var i=0; i<len; i++) {
			if(i%width === 0) str += '\n';
			var rgb = getRGB(i);
			var val = Math.max(rgb[0], rgb[1], rgb[2])/255;
			if(this.color) str += '<font style="color: rgb('+rgb.join(',')+')">'+getChar(val)+'</font>';
			else str += getChar(val);
		}
		return str;
	};

	window.imageConvert = imageConvert;

}();




$(document).ready(function(){
	// Use proxy for the CORS headers
	var proxy = 'http://crossorigin.me/';
	var imageElement = $('#thisimage');
	
	var image = {
		getChars  : function(){
			var counter = 0; 
			var x = [];
			$('input[name="chars[]"]').each(function() {
				x[counter] = $(this).val(); 
				counter++; 
			});
			return x;
		},
		make : function(){
			$('#copyButton , #coloronoff').show();
			var myChars  = image.getChars();
			var newImage = new imageConvert({
				chars: myChars,
				width: 200,
				color: true,
				el: document.getElementById('thisimage'),
				fn: function(str) {
					document.getElementById('wrapper').innerHTML = str;
				}
			});
		},
		submit : function(){
			$('html, body').animate({
				scrollTop: $("#imageUri").offset().top - 10
			}, 0);
			var str = $('#wait').val();
			$('#wrapper').html(str)
			var url = $('#imageUri').val();
			if (url && !url.match(/^http([s]?):\/\/.*/)) {
				url = 'http://' + url;
			}
			imageElement.attr('src', proxy + $('#imageUri').val());
			imageElement.one("load", function(event) {
				image.make();
				$( this ).off( event );
			});
		}
	};
	
	
	$('#imageUri').on('keypress', function(ev){
		var keycode = (ev.keyCode ? ev.keyCode : ev.which);
		if (keycode == '13') {
			$(this).blur();
			image.submit();
		}
	});
	
	$('#turncolor').on('change', function(ev){
		if($('#wrapper').hasClass('colorOff')){
			$('#wrapper').removeClass('colorOff');
		}else{
			$('#wrapper').addClass('colorOff');
		}

	});
	
	$('.chars').each(function(){
		$(this).on('keypress', function(ev){
			image.submit();
		});
	});	
	
	$('#Run').on('click', function(event){
		image.submit();
	});
	
	if(!$('body').hasClass('home')){
		imageElement.attr('src', proxy + $('#imageUri').val());
		imageElement.one("load", function(event) {
			image.make();
			$( this ).off( event );
		});
	}
	
	
	
	document.getElementById("copyButton").addEventListener("click", function() {
		copyToClipboardMsg(document.getElementById("wrapper"), document.getElementById("wrapper"));
	});
	
	function copyToClipboardMsg(elem, msgElem) {
		var succeed = copyToClipboard(elem);
		var msg;
		if (!succeed) {
			msg = "Copy not supported or blocked.  Press Ctrl+c to copy."
		} else {
			msg = "Text copied to the clipboard."
		}
		if (typeof msgElem === "string") {
			msgElem = document.getElementById(msgElem);
		}
		console.log(msg);
	}
	
	function copyToClipboard(elem) {
		  // create hidden text element, if it doesn't already exist
		var targetId = "_hiddenCopyText_";
		var isInput = elem.tagName === "INPUT" || elem.tagName === "TEXTAREA";
		var origSelectionStart, origSelectionEnd;
		
		target = document.getElementById(targetId);
		if (!target) {
			var target = document.createElement("textarea");
			target.style.position = "absolute";
			target.style.left = "-9999px";
			target.style.top = "0";
			target.id = targetId;
			document.body.appendChild(target);
		}
		var thisStr = elem.textContent;
		$('#_hiddenCopyText_').val(thisStr);
		var currentFocus = document.activeElement;
		$('#_hiddenCopyText_').focus();
		$('#_hiddenCopyText_')[0].setSelectionRange(0, $('#_hiddenCopyText_').val().length);
		
		// copy the selection
		var succeed;
		try {
			succeed = document.execCommand("copy");
		} catch(e) {
			succeed = false;
		}
		// restore original focus
		if (currentFocus && typeof currentFocus.focus === "function") {
			currentFocus.focus();
		}
		
		return succeed;
	
		
			
	}
	
});
