import React, { Component } from 'react';

import config from './config';

// the main editing space for constructing a flowchart, excluding TileBar
class Flowchart extends Component {
	constructor(props) {
		super(props);
	}
	
	render() {
	console.info("render Flo start");////

		return <g className='flowchart' 
				transform={'translate('+ config.tileBarWidth +')'} >
			<rect x='0' width={config.editorWidth - config.tileBarWidth} 
				y='0' height={config.editorHeight} 
				fill='#ffe' stroke='#fa5' >
			</rect>
			{this.props.children}
		</g>;
	}


}

export default Flowchart;
