import Router from './router';
import { ThemeProvider } from './theme/ThemeProvider';
import './index.css';

function App() {
  return (
    <ThemeProvider>
      <Router />
    </ThemeProvider>
  );
}

export default App;
