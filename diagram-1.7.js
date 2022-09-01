function Diagram(options) {
	const
		canvas = document.createElement("canvas"),
		ctx = canvas.getContext("2d");

	canvas.width = 880; // PDF inner-width
	canvas.height = options.height;
	canvas.style.marginTop = options.margin.top + "px";
	canvas.style.marginBottom = options.margin.bottom + "px";

	// Default context settings
	ctx.lineWidth = .5;
	ctx.fillStyle = "#9e9e9e";
	ctx.strokeStyle = ctx.fillStyle;
	ctx.font = "14px sans-serif";

	this.data = options.data;
	this.keys = Object.keys(this.data);
	this.diagram = options.diagram;
	this.legend = options.legend;
	this.colorList = options.colors.concat(COLORS.shuffle());
	this.colors = [];
	this.canvas = canvas;
	this.ctx = ctx;
	this.colorIndex = 0;
	this.getNextColor = function() {
		const color = this.colorList[this.colorIndex++];

		this.colors.push(color);

		return color;
	};

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
		rad = diagram.rad;
	var i, A = 0, a;

	ctx.strokeStyle = "rgba(1, 1, 1, 0.5)";

	// Diagram fill
	{
		ctx.globalCompositeOperation = "destination-over";

		for (i in data) {
			a = data[i] * 360 * Math.PI / 180;
			A += a;

			ctx.fillStyle = this.getNextColor();

			ctx.beginPath();
			ctx.arc(O.x, O.y, rad, 0, A);
			ctx.lineTo(O.x, O.y);
			ctx.fill();
		}
	}

	// Optional legend
	legend.visible && Utils.drawLegend(ctx, legend, keys, this.colors, data);
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
		ctx.font = "16px sans-serif";
		ctx.textBaseline = "middle";
		y = O.y + spacing / 2;

		for (i in data) {
			itemWidth = data[i] / max * diagram.width;
			
			ctx.fillStyle = this.getNextColor();
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
		max = Utils.getNearest10(data);
	var i, j, k, y, itemWidth;

	Utils.drawSemiGrid(ctx, diagram, length + 1, 6, max);

	// Generate the colors
	for (i in entries) this.getNextColor();

	// Diagram fill
	{
		y = O.y + spacing / 2;

		ctx.fillStyle = "#000";
		ctx.font = "16px sans-serif";
		ctx.textAlign = "right";
		ctx.textBaseline = "middle";

		for (i in data) {
			ctx.fillText(i, O.x - 15, y + itemHeight / 2 + 2);

			k = 0;
			for (j in data[i]) {
				itemWidth = data[i][j] / max * diagram.width;

				// Draw the line
				ctx.fillStyle = this.colors[k];
				ctx.fillRect(O.x, y, itemWidth, entryHeight);

				ctx.fillStyle = "#000";

				// Value indicator
				if (data[i][j]) {
					ctx.font = "14px sans-serif";
					ctx.fillText(data[i][j], O.x + itemWidth - 3, y + entryHeight / 2 + 2);

					// Reset properties for the next text
					ctx.font = "16px sans-serif";
				}

				k++;
				y += entryHeight;
			}

			y += spacing;
		}
	}

	// Optional legend
	legend.visible && Utils.drawLegend(ctx, legend, entries, this.colors);
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
		grid = Utils.drawGrid(ctx, diagram, max, keys),
		iw = grid.iw,
		ih = grid.ih;
	var i, j, x, y;

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

			ctx.strokeStyle = this.getNextColor();

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
	legend.visible && Utils.drawLegend(ctx, legend, Object.keys(lines), this.colors);
}

// Global csolor list
const COLORS = [
	"#2979ff",
	"#ff8a65",
	"#ffd600",
	"#8e24aa",
	"#4caf50",
	"#e64a19",
	"#009688",
	"#1de9b6",
	"#42a5f5",
	"#ef9a9a",
	"#6d4c41",
	"#ffa000",
	"#f06292",
	"#c5cae9",
	"#aed581",
	"#9575cd",
	"#f44336",
	"#607d8b",
];

// Utility functions
const Utils = {
	getNearest10: function(data) {
		var values = [];
	
		for (i in data) {
			values = values.concat(Object.values(data[i]));
		}
	
		return Math.ceil(Math.max.apply(null, values) / 10) * 10;
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
	
		ctx.font = "16px sans-serif";
		ctx.textAlign = "left";
		ctx.textBaseline = "middle";
	
		for (; i < entries.length; i++) {
			// Draw a filled color rectangle
			ctx.fillStyle = colors[i];
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
 * Array.prototype.includes implementation.
 * 
 * @see		{@link https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/includes}
 * @param	{mixed}		needle	The item to search
 * @returns	{boolean}
 */
Array.prototype.includes = function(needle) {
	const length = this.length;

	for (var i = 0; i < length; i++) {
		if (this[i] === needle) return true;
	}

	return false;
};

/**
 * Array.prototype.map implementation.
 * 
 * @see		{@link https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/map}
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
 * Array.prototype.shuffle implementation.
 * 
 * @returns	{array}
 */
Array.prototype.shuffle = function() {
	const shuffled = [];
	var length = this.length;

	while (length) {
		shuffled.push(this.splice(Math.random() * length--, 1)[0]);
	}

	return shuffled;
};

/**
 * Object.values implementation.
 * 
 * @see		{@link https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Object/values}
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
