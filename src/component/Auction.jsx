import React, { useState, useEffect } from 'react';
// You'll need to install these packages:
// npm install bootstrap react-bootstrap

// Import Bootstrap CSS in your main file (e.g., main.jsx):
// import 'bootstrap/dist/css/bootstrap.min.css';

import { Container, Row, Col, Card, Button, Nav, Navbar, Form, Badge, InputGroup, ListGroup } from 'react-bootstrap';
import NavbarComponent from './Navbar';

// Main App Component
const AuctionApp = () => {
  const [auctions, setAuctions] = useState([]);
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simulating API fetch
    setTimeout(() => {
      const mockAuctions = [
        {
          id: 1,
          title: "Vintage Rolex Watch",
          description: "A rare 1956 Rolex Submariner in excellent condition",
          startingPrice: 5000,
          currentBid: 7250,
          imageUrl: "/api/placeholder/300/200",
          endTime: new Date(Date.now() + 86400000), // 24 hours from now
          seller: "VintageCollector",
          bids: 12
        },
        {
          id: 2,
          title: "Abstract Oil Painting",
          description: "Original artwork by contemporary artist Jane Smith",
          startingPrice: 1200,
          currentBid: 1450,
          imageUrl: "/api/placeholder/300/200",
          endTime: new Date(Date.now() + 172800000), // 48 hours from now
          seller: "ArtGallery123",
          bids: 5
        },
        {
          id: 3,
          title: "First Edition Book Collection",
          description: "Set of 5 first-edition fantasy novels in mint condition",
          startingPrice: 850,
          currentBid: 900,
          imageUrl: "/api/placeholder/300/200",
          endTime: new Date(Date.now() + 259200000), // 72 hours from now
          seller: "RareBooks",
          bids: 2
        }
      ];
      setAuctions(mockAuctions);
      setIsLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="min-vh-100 bg-light">
      <Header user={user} setUser={setUser} />
      
      {isLoading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ height: "300px" }}>
          <p className="fs-4 text-secondary">Loading auctions...</p>
        </div>
      ) : (
        <Container className="py-4">
          {selectedAuction ? (
            <>
              <Button 
                variant="link"
                onClick={() => setSelectedAuction(null)}
                className="mb-3 text-decoration-none"
              >
                ← Back to all auctions
              </Button>
              <AuctionDetail 
                auction={selectedAuction} 
                user={user}
              />
            </>
          ) : (
            <>
              <h1 className="mb-4 fw-bold">Featured Auctions</h1>
              <Row xs={1} md={2} lg={3} className="g-4">
                {auctions.map(auction => (
                  <Col key={auction.id}>
                    <AuctionCard 
                      auction={auction}
                      onClick={() => setSelectedAuction(auction)}
                    />
                  </Col>
                ))}
              </Row>
            </>
          )}
        </Container>
      )}
      
      <Footer />
    </div>
  );
};

// Header Component
const Header = ({ user, setUser }) => {
  return (
    <NavbarComponent/>
  );
};

// AuctionCard Component
const AuctionCard = ({ auction, onClick }) => {
  // Format time remaining
  const getTimeRemaining = (endTime) => {
    const total = Date.parse(endTime) - Date.parse(new Date());
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const days = Math.floor(total / (1000 * 60 * 60 * 24));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m ${seconds}s`;
  };

  return (
    <Card className="h-100 shadow-sm hover-shadow" onClick={onClick} style={{ cursor: 'pointer' }}>
      <Card.Img 
        variant="top" 
        src={auction.imageUrl} 
        alt={auction.title} 
        style={{ height: "200px", objectFit: "cover" }}
      />
      <Card.Body>
        <Card.Title>{auction.title}</Card.Title>
        <Card.Text className="text-secondary" style={{ height: "48px", overflow: "hidden" }}>
          {auction.description}
        </Card.Text>
        
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="fw-bold fs-4 text-primary">${auction.currentBid.toLocaleString()}</span>
          <Badge bg="secondary">{auction.bids} bids</Badge>
        </div>
        
        <div className="d-flex justify-content-between align-items-center">
          <small className="text-muted">Seller: {auction.seller}</small>
          <small className="fw-bold text-danger">
            {getTimeRemaining(auction.endTime)} left
          </small>
        </div>
      </Card.Body>
    </Card>
  );
};

// AuctionDetail Component
const AuctionDetail = ({ auction, user }) => {
  const [bidAmount, setBidAmount] = useState(auction.currentBid + 10);
  const [bids, setBids] = useState([
    { id: 1, user: "BidMaster", amount: auction.currentBid, time: "2 hours ago" },
    { id: 2, user: "CollectorPro", amount: auction.currentBid - 50, time: "3 hours ago" },
    { id: 3, user: "AuctionFan99", amount: auction.currentBid - 100, time: "5 hours ago" },
  ]);

  const handleBid = () => {
    if (!user) {
      alert("Please log in to place a bid");
      return;
    }
    
    if (bidAmount <= auction.currentBid) {
      alert("Bid must be higher than current bid");
      return;
    }
    
    const newBid = {
      id: bids.length + 1,
      user: user.name,
      amount: bidAmount,
      time: "Just now"
    };
    
    setBids([newBid, ...bids]);
    auction.currentBid = bidAmount;
    auction.bids += 1;
    setBidAmount(bidAmount + 10);
  };

  return (
    <Card className="shadow border-0">
      <Row className="g-0">
        <Col md={6}>
          <Card.Img 
            src={auction.imageUrl} 
            alt={auction.title} 
            className="rounded-start" 
            style={{ height: "100%", objectFit: "cover" }}
          />
        </Col>
        
        <Col md={6}>
          <Card.Body className="p-4">
            <Card.Title className="fs-2 fw-bold mb-2">{auction.title}</Card.Title>
            <Card.Text className="text-secondary mb-4">{auction.description}</Card.Text>
            
            <Card className="bg-light mb-4">
              <Card.Body>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-secondary">Current bid:</span>
                  <span className="fs-3 fw-bold text-primary">${auction.currentBid.toLocaleString()}</span>
                </div>
                
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-secondary">Bids:</span>
                  <span>{auction.bids}</span>
                </div>
                
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-secondary">Time left:</span>
                  <span className="fw-bold text-danger">
                    {Math.floor((Date.parse(auction.endTime) - Date.now()) / (1000 * 60 * 60))} hours
                  </span>
                </div>
                
                <div className="d-flex justify-content-between mb-3">
                  <span className="text-secondary">Seller:</span>
                  <span>{auction.seller}</span>
                </div>
                
                <InputGroup className="mt-4">
                  <Form.Control
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(Number(e.target.value))}
                    min={auction.currentBid + 1}
                    step="1"
                  />
                  <Button 
                    variant="primary"
                    onClick={handleBid}
                    disabled={!user}
                  >
                    Place Bid
                  </Button>
                </InputGroup>
                
                {!user && (
                  <p className="text-center mt-2 text-danger small">Please log in to place a bid</p>
                )}
              </Card.Body>
            </Card>
            
            <div>
              <h4 className="mb-3">Bid History</h4>
              <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                <ListGroup variant="flush">
                  {bids.map(bid => (
                    <ListGroup.Item key={bid.id} className="d-flex justify-content-between py-2">
                      <span>{bid.user}</span>
                      <span className="fw-bold">${bid.amount.toLocaleString()}</span>
                      <span className="text-muted small">{bid.time}</span>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </div>
            </div>
          </Card.Body>
        </Col>
      </Row>
    </Card>
  );
};

// Footer Component
const Footer = () => {
  return (
    <footer className="bg-dark text-white py-3">
      <Container>
        <Row>
          <Col md={4} className="mb-4 mb-md-0">
            <h5 className="mb-3">AuctionHub</h5>
            <p className="text-muted">The premier platform for online auctions. Find unique items or sell your valuables.</p>
          </Col>
          
          <Col md={3} className="mb-4 mb-md-0">
            <h5 className="mb-3">Quick Links</h5>
            <Nav className="flex-column">
              <Nav.Link href="#" className="text-muted p-0 mb-2">Home</Nav.Link>
              <Nav.Link href="#" className="text-muted p-0 mb-2">Featured Auctions</Nav.Link>
              <Nav.Link href="#" className="text-muted p-0 mb-2">Sell an Item</Nav.Link>
              <Nav.Link href="#" className="text-muted p-0 mb-2">How It Works</Nav.Link>
            </Nav>
          </Col>
          
          <Col md={3} className="mb-4 mb-md-0">
            <h5 className="mb-3">Support</h5>
            <Nav className="flex-column">
              <Nav.Link href="#" className="text-muted p-0 mb-2">FAQ</Nav.Link>
              <Nav.Link href="#" className="text-muted p-0 mb-2">Contact Us</Nav.Link>
              <Nav.Link href="#" className="text-muted p-0 mb-2">Terms of Service</Nav.Link>
              <Nav.Link href="#" className="text-muted p-0 mb-2">Privacy Policy</Nav.Link>
            </Nav>
          </Col>
          
          <Col md={3}>
            <h5 className="mb-3">Subscribe</h5>
            <p className="text-muted mb-2">Get notified about new auctions</p>
            <InputGroup>
              <Form.Control
                type="email"
                placeholder="Your email"
              />
              <Button variant="primary">
                Subscribe
              </Button>
            </InputGroup>
          </Col>
        </Row>
        
        <hr className="my-4 border-secondary" />
        
        <p className="text-center text-muted mb-0">
          &copy; 2025 AuctionHub. All rights reserved.
        </p>
      </Container>
    </footer>
  );
};

export default AuctionApp;