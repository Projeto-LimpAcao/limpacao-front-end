import { ToastContainer } from 'react-toastify';
import Rotas from './rotas/Rotas';
import { useAuth, usePaletaTema } from './hooks';

function App() {
  const { usuario } = useAuth();
  usePaletaTema(usuario?.email);

  return (
    <>
      <Rotas />
      <ToastContainer position="top-right" autoClose={4000} theme="colored" />
    </>
  );
}

export default App;
