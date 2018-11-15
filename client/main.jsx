import React from 'react';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';
import App from '/imports/ui/App'

console.error("Please ignore errors about [Invalid DOM property `marker-end`] or [Each ...should have a unique 'key' prop.]  All such messages are bugs complaining about problems that don't exist.  I can't fix them.");

Meteor.startup(() => {
  render(<App />, document.getElementById('react-target'));
});
