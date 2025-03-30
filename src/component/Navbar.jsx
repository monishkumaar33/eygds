import { useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Form, Button } from 'react-bootstrap';
import { useState } from 'react';

function NavbarComponent() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  return (
    <Navbar bg="white" expand="lg" className="shadow-sm">
      <Container>
        <Navbar.Brand href="#" className="fw-bold text-primary">AuctionHub</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="#">Home</Nav.Link>
            <Nav.Link href="#">Categories</Nav.Link>
            <Nav.Link href="#">Sell</Nav.Link>
            <Nav.Link href="#">About</Nav.Link>
          </Nav>

          <Form className="d-flex me-3">
            <Form.Control
              type="search"
              placeholder="Search auctions..."
              className="me-2"
            />
          </Form>

          {user ? (
            <div className="d-flex align-items-center">
              <span className="me-2">Hello, {user.name}</span>
              <Button
                variant="outline-secondary"
                onClick={() => setUser(null)}
              >
                Logout
              </Button>
            </div>
          ) : (
            <Button 
              variant="primary"
              onClick={() => navigate('/signup')}
            >
              Login
            </Button>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavbarComponent;
