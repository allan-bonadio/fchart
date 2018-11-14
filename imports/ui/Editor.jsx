import React, { Component } from 'react';

import config from './config';
import Tile, {newTileObj} from './Tile';
import Arrow, {arrowObj} from './Arrow';
import TileBar from './TileBar';
import Flowchart from './Flowchart.jsx';

function newDummyGhostTile() {
	return newTileObj('begin', 0,  0, false);
}

// the main editing space for constructing a flowchart, including TileBar
class Editor extends Component {
	constructor(props) {
		super(props);
		Editor.me = this;
		
		this.state = {
			tiles: [
				// just for testing
				newTileObj('begin', 200, 100), 
				newTileObj('conditional', 400, 100), 
				newTileObj('statement', 200, 300), 
				newTileObj('end', 300, 300),
			],
			
			// non-null iff dragging
			sourceTileObj: null,  // where the mousedown was, won't move during drag
			
			//  invisible unless dragging; follows the mouse.  Just a dummy when not dragging.
			ghostTileObj: newDummyGhostTile(),
		};
		
		this.mouseDownCallback = this.mouseDownCallback.bind(this);
		this.mouseMoveEvt = this.mouseMoveEvt.bind(this);
		this.mouseUpEvt = this.mouseUpEvt.bind(this);
		this.mouseLeaveEvt = this.mouseLeaveEvt.bind(this);
	}
	
	render() {
console.info("------------------------------------------------------------- render edit start");////
		let tileComps = this.state.tiles.map(tileObj => 
			<Tile tileObj={tileObj} whHare='poiuytfuio'
				mouseDownCallback={this.mouseDownCallback} key={tileObj.tileSerial} />
		);
		let src = this.state.sourceTileObj;
		
		return <svg id='editor' width={config.editorWidth} height={config.editorHeight} 
					onMouseMove={this.mouseMoveEvt} 
					onMouseUp={this.mouseUpEvt} 
					onMouseLeave={this.mouseLeaveEvt}>
			<defs>
				<marker id="arrow-head"
					refX="0" refY="1.5" 
					markerWidth="4" markerHeight="3"
					orient="auto">
					<path d="M 0 0 L 4 1.5 L 0 3 z" stroke='none' fill='black' />
				</marker>
			</defs>
			<TileBar mouseDownCallback={this.mouseDownCallback} />
			<Flowchart mouseDownCallback={this.mouseDownCallback}>
				{tileComps}
			</Flowchart>
			<Tile tileObj={this.state.ghostTileObj} ghost
						mouseDownCallback={this.mouseDownCallback} />
		</svg>;
	}


	/* ************************************************************ dragging tiles */
	newGhostObj(srcTileObj, ev, innerX = this.state.innerX, innerY = this.state.innerY) {
		let nto = newTileObj(srcTileObj.type, 
				ev.clientX - innerX, 
				ev.clientY - innerY, true);
		nto.ghost = true;
		nto.serial = 'ghost';
		return nto;
	}
	
	// user has clicked down on a tile (whether in the TileBar or Flowchart)
	// actually called from clicked tile.  innerXY are coordinates of clickdown relative to center of tile.
	mouseDownCallback(tileComp, srcTileObj, ev, innerX, innerY) {
		if (! srcTileObj.proto) {
			srcTileObj.visible = false;
			this.setState({tiles: [...this.state.tiles]});  // so src tile goes invisible
		}
		
		this.setState({
			sourceTileObj: srcTileObj, 
			ghostTileObj: this.newGhostObj(srcTileObj, ev, innerX, innerY) ,
			innerX, innerY,
		});
	}
	
	// a mouse move relevant to a drag
	mouseMoveEvt(ev) {
		if (! this.state.sourceTileObj)
			return;
		this.setState({
			ghostTileObj: this.newGhostObj(this.state.sourceTileObj, ev) ,
		});
	}
	
	// the end of a drag, however
	mouseUpEvt(ev) {
		let s = this.state;
		let sto = s.sourceTileObj;
		let gto = s.ghostTileObj;
		if (! sto)
			return;
		
		// the mouse down location counts, too!
		this.mouseMoveEvt(ev);
		
		// now move it or clone it
		let newTiles = [...s.tiles];
		
		if (sto.proto) {
			// it's from the TileBar!  make a new one
			newTiles.push(newTileObj(sto.type, gto.x, gto.y, true));
		}
		else {
			// an existing one, that's been sitting there, hidden.  Set new coords and make it visible.
			let newObj = sto.clone();
			newObj.x = gto.x;
			newObj.y = gto.y;
			newObj.visible = true;

			let ix = newTiles.indexOf(sto);
			newTiles[ix] = newObj;
		}
		
		// end of dragging
		this.setState({
			sourceTileObj: null,
			tiles: newTiles,
			ghostTileObj: newDummyGhostTile(),
		});
	}

	// cancel it if user drags out of the editor
	mouseLeaveEvt(ev) {
		if (! this.state.sourceTileObj)
			return;
		
		// just kill it
		this.state.sourceTileObj.visible = true;
		this.setState({sourceTileObj: null, ghostTileObj: newDummyGhostTile()});
	}
	
	
		
	static lookupTileObj(serial) {
		return Editor.me.state.tiles[serial];
	}

	
	static lookupArrowObj(serial) {
		return Editor.me.state.arrows[serial];
	}


}

export default Editor;





