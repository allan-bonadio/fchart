import React, { Component } from 'react';

import config from './config';
import Tile, {newTileObj} from './Tile';
import Arrow, {arrowObj} from './Arrow';
import TileBar from './TileBar';
import Flowchart from './Flowchart.jsx';

// the main editing space for constructing a flowchart, including TileBar
class Editor extends Component {
	constructor(props) {
		super(props);
		Editor.me = this;
		
		let a, b;
		this.state = {
			tiles: [
				// just for testing
				a = newTileObj('begin', 100, 100), 
				newTileObj('conditional', 300, 100), 
				b = newTileObj('statement', 100, 300), 
				newTileObj('end', 200, 300),
			],
			arrows: [
				// test data
				new arrowObj(a, 0, b, 0),
			],
			
			// non-null iff dragging
			sourceTileObj: null,  // where the mousedown was, won't move during drag
			
			//  invisible unless dragging
			ghostTileObj: newTileObj('statement', 0, 0, false),
			
			// where the ghost is, only while dragging
			ghostX: 0,
			ghostY: 0,
		};
		
		this.mouseDownCallback = this.mouseDownCallback.bind(this);
		this.mouseMoveEvt = this.mouseMoveEvt.bind(this);
		this.mouseUpEvt = this.mouseUpEvt.bind(this);
		this.mouseLeaveEvt = this.mouseLeaveEvt.bind(this);
	}
	
	render() {
console.info("render edit start");////
		let tileComps = this.state.tiles.map(tileObj => 
			<Tile tileObj={tileObj} whHare='poiuytfuio'
				mouseDownCallback={this.mouseDownCallback} key={tileObj.tileSerial} />
		);
		let src = this.state.sourceTileObj;
		let arrowComps = this.state.arrows.map(arrowObj =>
			<Arrow arrowObj={arrowObj} />
		);
		
		return <svg id='editor' width={config.editorWidth} height={config.editorHeight} 
					onMouseMove={this.mouseMoveEvt} onMouseUp={this.mouseUpEvt} onMouseLeave={this.mouseLeaveEvt}>
			<TileBar mouseDownCallback={this.mouseDownCallback} />
			<Flowchart mouseDownCallback={this.mouseDownCallback}>
				{tileComps}
			</Flowchart>
			<Tile tileObj={this.state.ghostTileObj} x={this.state.ghostX} y={this.state.ghostY} ghost
						mouseDownCallback={this.mouseDownCallback} />
		</svg>;
	}


	/* ************************************************************ dragging tiles */
	// user has clicked down on a tile (whether in the TileBar or Flowchart)
	// actually called from clicked tile
	mouseDownCallback(tileComp, tileObj, ev, innerX, innerY, proto) {
		if (! proto) {
			tileObj.visible = false;
			this.setState({tiles: [...this.state.tiles]});  // so src tile goes invisible
		}
		
		this.setState({
			sourceTileObj: tileObj, 
			ghostX: ev.clientX - innerX, 
			ghostY: ev.clientY - innerY, 
			ghostTileObj: newTileObj(tileObj.type, 0, 0, true),
			innerX, innerY, proto,
		});
	}
	
	// a mouse move relevant to a drag
	mouseMoveEvt(ev) {
		if (! this.state.sourceTileObj)
			return;
		
		this.setState({ghostX: ev.clientX - this.state.innerX, ghostY: ev.clientY - this.state.innerY, });
	}
	
	// the end of a drag, however
	mouseUpEvt(ev) {
		let s = this.state;
		let st = s.sourceTileObj;
		if (! st)
			return;
		
		// the mouse down location counts, too!
		this.mouseMoveEvt(ev);
		
		// now move it or clone it
		let newTiles = [...s.tiles];
		st.visible = true;
		
		let tileObj = st;
		if (this.state.proto) {
			// it's from the TileBar!  make a new one
			tileObj = newTileObj(st.type, s.ghostX - config.tileBarWidth, s.ghostY, true);
			newTiles.push(tileObj);
		}
		else {
			// an existing one
			tileObj.x = s.ghostX - config.tileBarWidth;
			tileObj.y = s.ghostY;
		}
		
		this.setState({
			sourceTileObj: null,
			tiles: newTiles,
			ghostTileObj: newTileObj(st.type, 0, 0, false),
		});  // end of dragging
	}

	// cancel it if user drags out of the editor
	mouseLeaveEvt(ev) {
		if (! this.state.sourceTileObj)
			return;
		
		// just kill it
		this.state.sourceTileObj.visible = true;
		this.setState({sourceTileObj: null});
	}
	
	
		
	static lookupTileObj(serial) {
		return Editor.me.state.tiles[serial];
	}

	
	static lookupArrowObj(serial) {
		return Editor.me.state.arrows[serial];
	}


}

export default Editor;





