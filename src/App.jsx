import Rotas from './rotas/Rotas';
import { useAuth, usePaletaTema } from './hooks';

function App() {
  const { usuario } = useAuth();
  usePaletaTema(usuario?.email);

  return <Rotas />;
}

export default App;
