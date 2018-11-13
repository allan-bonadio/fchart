// the toolbar on the left with prototype tiles in it, 
// for the user to drag and drop onto the Flowchart

import React, { Component } from 'react';

import config from './config';
import Tile, {newTileObj} from './Tile';

// line them up along the middle
let w1 = config.tileBarWidth;
let w12 = config.tileBarWidth / 2;


// each box/diamond on the flowchart is a 'tile'.  Also on the TileBar
class TileBar extends Component {
	constructor(props) {
		super(props);
		
		// the tile objects for the proto tiles in the tilebar
		this.tileObjs = [
			newTileObj('begin'      , w12, w12),
			newTileObj('statement'  , w12, 3 * w12),
			newTileObj('conditional', w12, 5 * w12),
			newTileObj('end'        , w12, 7 * w12),
		];
	}
	
	render() {
		// unlike those in the flowchart, these have proto
		let tiles = this.tileObjs.map(tob => <Tile tileObj={tob} proto key={tob.tileSerial}
				mouseDownCallback={this.props.mouseDownCallback}  />);

		return <g className='tile-bar' >
			<rect x='0' width={config.tileBarWidth} 
				y='0' height={config.editorHeight} 
				fill='#666' stroke='#444' />
			{tiles}
		</g>;
	}


}

export default TileBar;