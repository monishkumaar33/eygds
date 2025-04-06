import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavbarComponent from './components/Navbar';
import SignIn from './components/Signin';
import AuctionApp from './components/Auction';
import 'bootstrap/dist/css/bootstrap.min.css';
import Register from './components/register';
import CreateAuction from './components/CreateAuction';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <Router>
      <NavbarComponent />
      <Routes>
        <Route path="/" element={<AuctionApp/>} />
        <Route path="/signin" element={<SignIn/>} />
        <Route path="/register" element={<Register/>} />
        <Route path="/dashboard" element={<Dashboard/>} />
        <Route path="/create-auction" element={<CreateAuction/>} />
      </Routes>
    </Router>
  );
}

export default App;
