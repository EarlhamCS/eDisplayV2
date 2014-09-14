Buttons = function(texts, colors, columns) {
	this.initialize = function(texts, colors) {
		this.width = 100 / columns;
		this.width = this.width + "%";

		this.buttons = [];

		for(var i = 0; i < texts.length; i++) {
			var b = new Button(texts[i]);

			b.element.style.backgroundColor = this.getColor(texts[i]);
			b.element.style.color = "white";
			b.element.style.width = this.width;

			this.buttons.push(b);
		}
	}
	
	this.getColor = function(name) {
		var color = "";
		
		for(var i = 0; i < colors.length; i++) {
			if(name == colors[i][0]) {
				color = colors[i][1];
			}
		}
		
		return color;
	}
	
	this.parent = function(element) {
		for(i = 0; i < this.buttons.length; i++) {
			var e = this.buttons[i].element;
			element.appendChild(e);
		}
	}
	
	this.ToString = function() {
		var str = "";
		
		for(i = 0; i < buttons.length; i++) {
			str += buttons[i].ToString();
		}
		
		return str;
	}
	
	
	this.initialize(texts, colors);
	//console.log(this.ToString());
}

Button = function(text) {
	this.initialize = function(text) {
		this.element = document.createElement('input');
		this.element.type = "button";
		this.element.value = text;
		this.element.id = "btn" + text;
		this.enabled = true;
	}
	
	this.enable = function() {
		this.enabled = true;
		this.element.style.display = "block";
	}
	
	this.disable = function() {
		this.enabled = false;
		this.element.style.display = "none";
	}

	this.ToString = function() {
		var str = "";
		
		str += '<input type="button"';
		str += 'class="' + text;
		str += '" value="' + text
		str += '" />';

		return str;
	}

	this.initialize(text);
	this.enable();
}