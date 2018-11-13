import React, { Component } from 'react';

// this is a separate pane with a text area that shows the json of the flowchart
class JsonView extends Component {
	constructor(props) {
		super(props);
	}
	
	render() {
		return <textarea className='json-view' ></textarea>
	}


}

export default JsonView;