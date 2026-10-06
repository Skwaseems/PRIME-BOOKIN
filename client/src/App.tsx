import {useSelector} from 'react-redux';

import {RootState} from './store';
import {StackNavigator} from './navigation/StackNavigator';

function App() {
  const color = useSelector((state: RootState) => state.bgSlice.color);
  return (
    <div
      id='app'
      style={{backgroundColor: color}}
    >
      <StackNavigator />
    </div>
  );
}

export default App;
