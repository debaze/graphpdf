# GraphPDF

*Graphic library for PDF templates. Supports pie charts, bar charts and line charts.*

### Overview

The library is built for JavaScript 1.7, because PDF templates don't always support the lastest JS version.  
All diagrams extend the `Diagram` superclass. This class should be only used through its subclasses.

### Prerequisites

The `graphpdf.js` script must be imported before the execution of the script(s) that use it. To create a new diagram, instantiate one of the `Diagram` subclasses:
```js
const diagram = new PieChart({
	// options...
});

// `diagram` has now a canvas node which can be added to the DOM
document.body.appendChild(diagram.canvas);
```

### Diagrams

- `PieChart` - A camembert-shaped diagram.

	```js
	new PieChart({
		data: {
			name: .5,
			name2: .3,
			name3: .2,
		},
		margin: {
			top: 0,
			bottom: 0,
		},
		diagram: {
			rad: 0,
		},
		legend: {
			visible: true,
			origin: {
				x: 0,
				y: 0,
			},
		},
		// Custom colors
		colors: [],
	});
	```

https://github.com/keole/sf_oxygene_repit/blob/ff5b4b4906c64f5b65a20584afcec58d73eab884/templates/back/report/diagram.html.twig