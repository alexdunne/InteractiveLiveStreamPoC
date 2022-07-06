import React from 'react';
import * as eva from '@eva-design/eva';
import {ApplicationProvider} from '@ui-kitten/components';
import {QueryClient, QueryClientProvider} from 'react-query';

import {VideoPlayer} from './src/video-player';

const queryClient = new QueryClient();

const App = () => {
  return (
    <ApplicationProvider {...eva} theme={eva.light}>
      <QueryClientProvider client={queryClient}>
        <VideoPlayer />
      </QueryClientProvider>
    </ApplicationProvider>
  );
};

export default App;
