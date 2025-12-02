import {Routes, Route} from 'react-router'
import Home from './pages/Home';
import Nav from './components/Nav';
// import Nav from './components/Nav';
// import Post from './pages/Post';
// import Console from './pages/Console';

function App() {
  return (
    <div className="App">
      <Nav />
      <Routes >
        <Route path="/" element={<Home />} />
      </Routes>
    </div>
  );
}

export default App;