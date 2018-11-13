import React from 'react';

import config from './config';
import Editor from './Editor';
import JsonView from './JsonView';

const App = () => (
	<div>
		<defs>
			<marker id="arrow-head"
				refX="0" refY="1.5" 
				markerWidth="4" markerHeight="3"
				orient="auto">
				<path d="M 0 0 L 4 1.5 L 0 3 z" stroke='none' fill='black' />
			</marker>
		</defs>
		
		<Editor />
		<JsonView />
	</div>
);

export default App;
