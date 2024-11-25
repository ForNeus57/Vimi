# List of features that need implementation
1. Add the list of predicted classes (< 10) with probability by each neural network
	1. Small window that displays probabilities and classes, when the cursor hovers on it
	2. Implement it as a reusable component
2. Add button to switch from the model viewer page to model compere page
3. Implement some way to compare two activations:
	1. Model the same
	2. Layer the same
	3. Feature Map Number the same
	4. Inputs choose one of may
	5. At the ability to see
		1. Predicted classes (< 10)
		2. Metrics:
			1. Mean Square Error
			2. Mean Absolute Error
		3. Visual representation of booth selections (select colour map)
	6. Add different frontend URL from model preview
	7. Add the ability to query already processed data
		1. Available Models
		2. Available Layers
		3. Available Feature Maps
		4. Only these that have computed activations (!)
4. Using "django" storage API make use of ftp-server project module
5. Make image fetching faster:
	1. Out of ideas how to make it faster
	2. Experiment with different ways to make it faster
6. Add the ability to select previously uploaded files to reuse them.