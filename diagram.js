/**
 * Initializes a generic diagram.
 * This function should not be used outside of this program.
 * 
 * @param	{object}	data	Diagram data
 * @param	{number}	width	Width of the final image, greater than 0
 * @param	{number}	height	Height of the final image, greater than 0
 * @param	{object}	diagram	Diagram options, different for each specific diagram
 * @param	{object}	legend	Legend options, different for each specific diagram
 */
function Diagram({data, width, height, diagram, legend}) {
	if (
		typeof data		!== "object" ||
		typeof width	!== "number" ||
		typeof height	!== "number" ||
		typeof diagram	!== "object" ||
		typeof legend	!== "object" ||
		width			< 0 ||
		height			< 0
	) return console.error(`${this.constructor.name}: Param requirements not met to draw.`);

	const
		// Data key names, displayed on the legend
		keys = Object.keys(data),
		// Data values, used in calculations
		values = Object.values(data),
		canvas = document.createElement("canvas"),
		ctx = canvas.getContext("2d"),
		// The buffer serves as a pre-drawer to apply filters before rendering
		buffer = typeof OffscreenCanvas !== "undefined" ? new OffscreenCanvas(0, 0) : document.createElement("canvas"),
		bctx = buffer.getContext("2d");

	Object.assign(canvas, {width, height});
	Object.assign(buffer, {width, height});
	Object.assign(this, {keys, values, width, height, diagram, legend, canvas, ctx, buffer, bctx});
}

/**
 * Creates a pie-chart diagram.
 * The parameters are that of the Diagram class; no additional parameter is requested.
 * 
 * @constructor
 * @param	{number}	diagram.origin.x	Pie-chart origin X
 * @param	{number}	diagram.origin.y	Pie-chart origin Y
 * @param	{number}	diagram.rad			Pie-chart radius
 * @param	{boolean}	legend.visible		Determines whether the legend is drawed
 * @param	{number}	legend.origin.x		Legend origin X
 * @param	{number}	legend.origin.y		Legend origin Y
 * @param	{boolean}	legend.percentage	Determines whether to display the percentages on the legend items
 * @return	{PieChart}
 */
function PieChart() {
	Diagram.call(this, ...arguments);

	const sum = this.values.reduce((a, b) => a + b);

	if (sum <= .999 && sum >= .999) return console.error(`${this.constructor.name}: Can't draw; the sum of the values must be equal to 1.`);

	this.draw = () => {
		const
			{keys, values, diagram, legend, canvas, buffer, bctx, ctx} = this,
			O = diagram.origin,
			{rad} = diagram,
			colors = [];
		let A = 0, a, rgb;

		bctx.globalCompositeOperation = "destination-over";
		ctx.strokeStyle = "#0002";
		ctx.save();
		ctx.filter = "blur(20px)";

		// Draw the pie chart on the buffer, unfiltered
		{
			for (const value of values) {
				a = value * 360 * Math.PI / 180;
				A += a;
		
				rgb = `rgb(${Array.from({length: 3}, () => Math.floor(Math.random() * 255))})`;
	
				// Save the color for the legend descriptions
				colors.push(rgb);
		
				bctx.fillStyle = rgb;
				bctx.beginPath();
				bctx.arc(
					O.x, O.y,
					rad, 0,
					A,
					false,
				);
				bctx.lineTo(O.x, O.y);
				bctx.fill();
			}
		}

		// Draw the blurred pie outline
		ctx.drawImage(buffer, 0, 0);

		// Draw the actual pie
		ctx.restore();
		ctx.drawImage(buffer, 0, 0);

		// Draw the pie light gray outline
		{
			ctx.beginPath();
			ctx.arc(
				O.x, O.y,
				rad, 0,
				A,
				false,
			);
			ctx.stroke();
		}

		// Draw the legend, if needed
		if (legend.visible) {
			let {x, y} = legend.origin, description;

			// The font used is the system one, at 20px size (unchangeable)
			ctx.font = "20px system-ui";

			for (const i in keys) {
				// Draw a filled color rectangle
				ctx.fillStyle = colors[i];
				ctx.fillRect(x, y, 75, 30);

				// Draw the color rectangle light gray outline, in case it's too bright
				ctx.strokeRect(x, y, 75, 30);

				// Generate the description text
				description = keys[i];
				legend.percentage && (description += ` (${values[i] * 100}%)`);

				// Draw the description associated with the color (with a little X offset)
				ctx.fillStyle = "#000";
				ctx.fillText(description, x + 90, y + 22);

				// Update the Y offset for the next line
				y += 50;
			}
		}

		// Append the canvas to the body
		document.body.appendChild(canvas);
	};

	return this;
};