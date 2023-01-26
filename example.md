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
		/**
		 * If `true`, displays the percent of each data row onto the legend.
		* Defaults to `null`.
		* 
		* @var {?Boolean}
		*/
		percentages: false,
	},
	// Custom colors
	colors: [],
});
```