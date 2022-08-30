function Diagram(options) {
	const
		canvas = document.createElement("canvas"),
		ctx = canvas.getContext("2d");

	canvas.width = options.width;
	canvas.height = options.height;
	canvas.style.marginTop = options.margin.top + "px";
	canvas.style.marginBottom = options.margin.bottom + "px";

	// Default context settings
	ctx.lineWidth = .5;
	ctx.fillStyle = "#9e9e9e";
	ctx.strokeStyle = ctx.fillStyle;
	ctx.font = "14px system-ui";

	this.data = options.data;
	this.keys = Object.keys(this.data);
	this.diagram = options.diagram;
	this.legend = options.legend;
	this.canvas = canvas;
	this.ctx = ctx;

	// Append the canvas to the body
	document.body.appendChild(canvas);
}

function PieChart() {
	Diagram.call(this, arguments[0]);

	const
		ctx = this.ctx,
		data = this.data,
		keys = this.keys,
		diagram = this.diagram,
		legend = this.legend,
		O = diagram.origin,
		rad = diagram.rad,
		colors = {};
	var i, A = 0, a, color;

	ctx.strokeStyle = "rgba(1, 1, 1, 0.5)";

	// Diagram fill
	{
		ctx.globalCompositeOperation = "destination-over";

		for (i in data) {
			a = data[i] * 360 * Math.PI / 180;
			A += a;

			color = "rgb(" + [
				Math.floor(Math.random() * 255),
				Math.floor(Math.random() * 255),
				Math.floor(Math.random() * 255),
			] + ")";
			colors[i] = color;
			ctx.fillStyle = color;

			ctx.beginPath();
			ctx.arc(O.x, O.y, rad, 0, A);
			ctx.lineTo(O.x, O.y);
			ctx.fill();
		}
	}

	// Optional legend
	legend.visible && Utils.drawLegend(ctx, legend, keys, colors, data);
};

function BarChart() {
	Diagram.call(this, arguments[0]);

	const
		ctx = this.ctx,
		data = this.data,
		keys = this.keys,
		values = [],
		length = keys.length,
		diagram = this.diagram,
		O = diagram.origin,
		spacing = diagram.spacing,
		itemHeight = (diagram.height - (spacing * length)) / length;
	var i, y, itemWidth, max;

	// Get the max value, rounded up to the nearest 10
	{
		for (i in data) values.push(data[i]);

		max = Math.ceil(Math.max.apply(null, values) / 10) * 10;
	}

	Utils.drawSemiGrid(ctx, diagram, length + 1, 6, max);

	// Diagram fill
	{
		ctx.font = "16px system-ui";
		ctx.textBaseline = "middle";
		y = O.y + spacing / 2;

		for (i in data) {
			itemWidth = data[i] / max * diagram.width;
			
			ctx.fillStyle = Utils.getRandomColor();
			ctx.fillRect(O.x, y, itemWidth, itemHeight);
			
			ctx.fillStyle = "#000";
			ctx.textAlign = "right";
			ctx.fillText(i, O.x - 15, y + itemHeight / 2 + 2);
			ctx.fillText(data[i], O.x + itemWidth - 5, y + itemHeight / 2 + 2);
	
			y += itemHeight + spacing;
		}
	}
}

function BarChartMultiple() {
	Diagram.call(this, arguments[0]);

	const
		ctx = this.ctx,
		data = this.data,
		keys = this.keys,
		length = keys.length,
		diagram = this.diagram,
		legend = this.legend,
		O = diagram.origin,
		spacing = diagram.spacing,
		itemHeight = (diagram.height - (spacing * length)) / length,
		entries = Object.keys(Object.values(data)[0]),
		entryLength = entries.length,
		entryHeight = itemHeight / entryLength,
		max = Utils.getNearest10(data),
		colors = {};
	var i, j, y, itemWidth;

	Utils.drawSemiGrid(ctx, diagram, length + 1, 6, max);

	// Generate the colors
	for (i in entries) colors[entries[i]] = Utils.getRandomColor();

	// Diagram fill
	{
		y = O.y + spacing / 2;

		ctx.fillStyle = "#000";
		ctx.font = "16px system-ui";
		ctx.textAlign = "right";
		ctx.textBaseline = "middle";

		for (i in data) {
			ctx.fillText(i, O.x - 15, y + itemHeight / 2 + 2);

			for (j in data[i]) {
				itemWidth = data[i][j] / max * diagram.width;

				// Draw the line
				ctx.fillStyle = colors[j];
				ctx.fillRect(O.x, y, itemWidth, entryHeight);

				ctx.fillStyle = "#000";

				// Value indicator
				if (data[i][j]) {
					ctx.font = "14px system-ui";
					ctx.fillText(data[i][j], O.x + itemWidth - 3, y + entryHeight / 2 + 2);

					// Reset properties for the next text
					ctx.font = "16px system-ui";
				}

				y += entryHeight;
			}

			y += spacing;
		}
	}

	// Optional legend
	legend.visible && Utils.drawLegend(ctx, legend, entries, colors);
}

function LineChart() {
	Diagram.call(this, arguments[0]);

	const
		ctx = this.ctx,
		data = this.data,
		keys = this.keys,
		diagram = this.diagram,
		legend = this.legend,
		O = diagram.origin,
		max = Utils.getNearest10(data),
		lines = {},
		colors = {},
		grid = Utils.drawGrid(ctx, diagram, max, keys),
		iw = grid.iw,
		ih = grid.ih;
	var i, j, x, y, color;

	// Get the line data
	{
		for (i in data) {
			for (j in data[i]) {
				lines[j] === undefined && (lines[j] = []);
				lines[j].push(data[i][j]);
			}
		}
	}

	// Diagram fill
	{
		ctx.lineWidth = 2;

		for (i in lines) {
			x = O.x;
			y = O.y + (max - lines[i][0]) * ih;

			color = Utils.getRandomColor();
			colors[i] = color;
			ctx.strokeStyle = color;

			ctx.beginPath();
			ctx.moveTo(x, y);
			for (j = 1; j < lines[i].length; j++) {
				x += iw;
				y = O.y + (max - lines[i][j]) * ih;

				ctx.lineTo(x, y);
			}
			ctx.stroke();
		}
	}

	// Optional legend
	legend.visible && Utils.drawLegend(ctx, legend, Object.keys(lines), colors);
}

// Utility functions
const Utils = {
	getNearest10: function(data) {
		var values = [];
	
		for (i in data) {
			values = values.concat(Object.values(data[i]));
		}
	
		return Math.ceil(Math.max.apply(null, values) / 10) * 10;
	},
	getRandomColor: function() {
		return [
			"#E57373",
			"#F06292",
			"#BA68C8",
			"#9575CD",
			"#7986CB",
			"#64B5F6",
			"#4FC3F7",
			"#4DD0E1",
			"#4DB6AC",
			"#81C784",
			"#AED581",
			"#DCE775",
			"#FFF176",
			"#FFD54F",
			"#FFB74D",
			"#FF8A65",
			"#A1887F",
			"#E0E0E0",
			"#90A4AE",
		][Math.floor(Math.random() * 19)];
	},
	drawGrid: function(ctx, diagram, rows, cols) {
		const
			O = diagram.origin,
			w = diagram.width,
			h = diagram.height,
			r = typeof rows === "number" ? rows : rows.length - 1,
			c = typeof cols === "number" ? cols : cols.length - 1,
			iw = w / c,
			ih = h / r;
		var i = 0,
			x = O.x,
			y = O.y;
	
		// Rows
		{
			ctx.textAlign = "right";
			ctx.textBaseline = "middle";
	
			ctx.beginPath();
			for (; i <= r; i++, y += ih) {
				ctx.moveTo(x, y);
				ctx.lineTo(x + w, y);
				r - i && ctx.fillText(r - i, x - 5, y + 2);
			}
			ctx.stroke();
		}
	
		// Columns
		{
			i = 0;
			y = O.y;
	
			ctx.textAlign = "center";
			ctx.textBaseline = "top";
	
			ctx.beginPath();
			for (; i <= c; i++, x += iw) {
				ctx.moveTo(x, y);
				ctx.lineTo(x, y + h);
	
				ctx.fillText(cols[i], x, y + h + 5);
			}
			ctx.stroke();
		}
	
		return {iw: iw, ih: ih};
	},
	drawSemiGrid: function(ctx, diagram, rows, cols, max) {
		const
			O = diagram.origin,
			w = diagram.width,
			h = diagram.height,
			iw = w / (cols - 1),
			ih = h / (rows - 1);
		var i = 0,
			x = O.x,
			y = O.y;
	
		ctx.textAlign = "center";
		ctx.textBaseline = "bottom";
	
		// Rows
		{
			ctx.beginPath();
			for (; i < rows; i++, y += ih) {
				ctx.moveTo(x, y);
				ctx.lineTo(x + w, y);
			}
			ctx.stroke();
		}
	
		// Columns
		{
			i = 0;
			y = O.y;
	
			ctx.beginPath();
			for (; i < cols; i++, x += iw) {
				ctx.moveTo(x, y);
				ctx.lineTo(x, y + h);
				ctx.fillText(i / w * 100 * max, x, y - 2);
			}
			ctx.stroke();
		}
	},
	drawLegend: function(ctx, legend, entries, colors, percents) {
		var x = legend.origin.x,
			y = legend.origin.y,
			i = 0,
			entry;
	
		ctx.font = "16px system-ui";
		ctx.textAlign = "left";
		ctx.textBaseline = "middle";
	
		for (; i < entries.length; i++) {
			// Draw a filled & stroked color rectangle
			ctx.fillStyle = colors[entries[i]];
			ctx.fillRect(x, y, 50, 20);
	
			// Describe the entry
			entry = entries[i];
			legend.percentages && (entry += " (" + percents[entries[i]] * 100 + "%)");
	
			ctx.fillStyle = "#000";
			ctx.fillText(entry, x + 60, y + 13);
	
			y += 30;
		}
	},
};

// Polyfills for JS 1.7
/**
 * Array.prototype.map implementation.
 * 
 * @see {@link https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Array/map}
 * 
 * @param	{function}	callback	The modifier called for each item of the array
 * @returns	{array}
 */
Array.prototype.map = function(callback) {
	const length = this.length, mapped = [];

	for (var i = 0; i < length; i++) {
		mapped[i] = callback(this[i], i, this);
	}

	return mapped;
};

/**
 * Object.values implementation.
 * 
 * @see {@link https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Object/values}
 * 
 * @param	{object}	object	The object to extract values from
 * @returns	{array}
 */
Object.values = function(object) {
	const values = [];

	for (var i in object) {
		values.push(object[i]);
	}

	return values;
};