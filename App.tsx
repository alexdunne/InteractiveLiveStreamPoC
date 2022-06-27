import React from 'react';
import * as eva from '@eva-design/eva';
import {ApplicationProvider} from '@ui-kitten/components';
import {VideoPlayer} from './src/video-player';

const App = () => {
  return (
    <ApplicationProvider {...eva} theme={eva.light}>
      <VideoPlayer />
    </ApplicationProvider>
  );
};

export default App;
