import React, { useState, useEffect } from 'react';
// You'll need to install these packages:
// npm install bootstrap react-bootstrap

// Import Bootstrap CSS in your main file (e.g., main.jsx):
// import 'bootstrap/dist/css/bootstrap.min.css';

import { Container, Row, Col, Card, Button, Nav, Navbar, Form, Badge, InputGroup, ListGroup, Alert } from 'react-bootstrap';
import NavbarComponent from './Navbar';
import { useNavigate } from 'react-router-dom';

// Main App Component
const AuctionApp = () => {
  const [auctions, setAuctions] = useState([]);
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const userId = localStorage.getItem('userId');
    
    if (token && username) {
      setUser({ 
        name: username, 
        id: userId,
        token: token
      });
    }
  }, []);
  
  // Fetch auctions
  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('http://localhost:5000/api/auctions');
        
        if (!response.ok) {
          throw new Error('Failed to fetch auctions');
        }
        
        const data = await response.json();
        setAuctions(data);
      } catch (err) {
        console.error("Error fetching auctions", err);
        setError('Failed to load auctions. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAuctions();
  }, []);

  // Fetch a single auction
  const fetchAuctionById = async (id) => {
    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:5000/api/auctions/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch auction details');
      }
      
      const data = await response.json();
      setSelectedAuction(data);
    } catch (err) {
      console.error("Error fetching auction", err);
      setError('Failed to load auction details. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle auction selection
  const handleAuctionSelect = (auction) => {
    setSelectedAuction(auction);
    // Optionally fetch fresh data for the selected auction
    fetchAuctionById(auction._id);
  };

  return (
    <div className="min-vh-100 bg-light">
      <Container className="py-4">
        {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
        
        {isLoading ? (
          <div className="d-flex justify-content-center align-items-center" style={{ height: "300px" }}>
            <p className="fs-4 text-secondary">Loading auctions...</p>
          </div>
        ) : (
          <>
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
                  onBidSuccess={() => fetchAuctionById(selectedAuction._id)}
                />
              </>
            ) : (
              <>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h2>Active Auctions</h2>
                  {user && (
                    <Button 
                      variant="primary"
                      onClick={() => navigate('/create-auction')}
                    >
                      Create New Auction
                    </Button>
                  )}
                </div>
                
                {auctions.length === 0 ? (
                  <Alert variant="info">No active auctions found.</Alert>
                ) : (
                  <Row xs={1} md={2} lg={3} className="g-4">
                    {auctions.map((auction) => (
                      <Col key={auction._id}>
                        <AuctionCard 
                          auction={auction} 
                          onClick={() => handleAuctionSelect(auction)} 
                        />
                      </Col>
                    ))}
                  </Row>
                )}
              </>
            )}
          </>
        )}
      </Container>
    </div>
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
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  return (
    <Card className="h-100 shadow-sm" style={{ cursor: 'pointer' }} onClick={onClick}>
      {auction.imageUrl && (
        <Card.Img 
          variant="top" 
          src={auction.imageUrl} 
          alt={auction.title}
          style={{ height: '200px', objectFit: 'cover' }}
        />
      )}
      <Card.Body>
        <Card.Title className="mb-2">{auction.title}</Card.Title>
        <Card.Text className="text-muted small mb-2">
          {auction.description.length > 100 
            ? `${auction.description.substring(0, 100)}...` 
            : auction.description}
        </Card.Text>
        
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="text-secondary small">Current bid:</span>
          <span className="fw-bold text-primary">${auction.currentBid.amount.toLocaleString()}</span>
        </div>
        
        <div className="d-flex justify-content-between align-items-center">
          <span className="text-secondary small">Time left:</span>
          <Badge bg="danger">{getTimeRemaining(auction.endTime)}</Badge>
        </div>
      </Card.Body>
      <Card.Footer className="bg-white text-muted small">
        Seller: {auction.owner?.username || 'Unknown'}
      </Card.Footer>
    </Card>
  );
};

// AuctionDetail Component
const AuctionDetail = ({ auction, user, onBidSuccess }) => {
  const [bidAmount, setBidAmount] = useState(auction.currentBid.amount + 10);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleBid = async () => {
    if (!user) {
      setError("Please log in to place a bid");
      return;
    }
  
    if (bidAmount <= auction.currentBid.amount) {
      setError("Bid must be higher than current bid");
      return;
    }
  
    setIsLoading(true);
    setError('');
    setSuccessMessage('');
    
    try {
      const response = await fetch(`http://localhost:5000/api/auctions/${auction._id}/bid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ amount: bidAmount })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccessMessage("Bid placed successfully!");
        // Call the callback to refresh auction data
        if (onBidSuccess) {
          onBidSuccess();
        }
      } else {
        setError(data.message || "Failed to place bid");
      }
    } catch (error) {
      console.error("Error placing bid:", error);
      setError("Server error. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Format time remaining
  const getTimeRemaining = (endTime) => {
    const total = Date.parse(endTime) - Date.parse(new Date());
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const days = Math.floor(total / (1000 * 60 * 60 * 24));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  // Check if user is the owner of the auction
  const isOwner = user && auction.owner && user.id === auction.owner._id;

  return (
    <Card className="shadow">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-4">
          <div>
            <h2 className="mb-2">{auction.title}</h2>
            <p className="text-muted mb-0">Seller: {auction.owner?.username || 'Unknown'}</p>
          </div>
          <Badge bg={auction.status === 'active' ? 'success' : 'secondary'}>
            {auction.status === 'active' ? 'Active' : 'Ended'}
          </Badge>
        </div>
        
        {auction.imageUrl && (
          <div className="mb-4">
            <img 
              src={auction.imageUrl} 
              alt={auction.title} 
              className="img-fluid rounded"
              style={{ maxHeight: '300px', width: 'auto' }}
            />
          </div>
        )}
        
        <p className="mb-4">{auction.description}</p>
        
        <div className="bg-light p-3 rounded mb-4">
          <div className="d-flex justify-content-between mb-2">
            <span className="text-secondary">Current bid:</span>
            <span className="fs-3 fw-bold text-primary">${auction.currentBid.amount.toLocaleString()}</span>
          </div>
          
          <div className="d-flex justify-content-between mb-2">
            <span className="text-secondary">Starting price:</span>
            <span className="fw-bold">${auction.startingPrice.toLocaleString()}</span>
          </div>
          
          <div className="d-flex justify-content-between">
            <span className="text-secondary">Time left:</span>
            <span className="fw-bold text-danger">
              {getTimeRemaining(auction.endTime)}
            </span>
          </div>
        </div>
        
        {auction.status === 'active' && !isOwner && (
          <div className="mb-4">
            <h4 className="mb-3">Place a Bid</h4>
            {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
            {successMessage && <Alert variant="success" className="mb-3">{successMessage}</Alert>}
            <InputGroup className="mb-3">
              <InputGroup.Text>$</InputGroup.Text>
              <Form.Control
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(Number(e.target.value))}
                min={auction.currentBid.amount + 1}
                step="1"
              />
              <Button 
                variant="primary" 
                onClick={handleBid}
                disabled={isLoading || !user}
              >
                {isLoading ? 'Placing Bid...' : 'Place Bid'}
              </Button>
            </InputGroup>
            <small className="text-muted">
              Your bid must be higher than the current bid of ${auction.currentBid.amount.toLocaleString()}
            </small>
            {!user && (
              <Alert variant="warning" className="mt-2">
                Please <a href="/signin">sign in</a> to place a bid
              </Alert>
            )}
          </div>
        )}
        
        {isOwner && (
          <div className="mb-4">
            <Alert variant="info">
              You are the owner of this auction. You cannot place bids on your own auction.
            </Alert>
            <Button 
              variant="danger" 
              className="mt-2"
              onClick={async () => {
                try {
                  const response = await fetch(`http://localhost:5000/api/auctions/${auction._id}/close`, {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${user.token}`
                    }
                  });
                  
                  if (response.ok) {
                    alert('Auction closed successfully');
                    window.location.reload();
                  } else {
                    const data = await response.json();
                    alert(data.message || 'Failed to close auction');
                  }
                } catch (error) {
                  console.error('Error closing auction:', error);
                  alert('Server error. Please try again later.');
                }
              }}
            >
              Close Auction
            </Button>
          </div>
        )}
        
        <div>
          <h4 className="mb-3">Bid History</h4>
          <div style={{ maxHeight: "200px", overflowY: "auto" }}>
            <ListGroup variant="flush">
              {auction.bids && auction.bids.length > 0 ? (
                auction.bids.map((bid, index) => (
                  <ListGroup.Item key={index} className="d-flex justify-content-between py-2">
                    <span>{bid.user?.username || 'Anonymous'}</span>
                    <span className="fw-bold">${bid.amount.toLocaleString()}</span>
                  </ListGroup.Item>
                ))
              ) : (
                <ListGroup.Item className="text-center text-muted py-3">
                  No bids yet
                </ListGroup.Item>
              )}
            </ListGroup>
          </div>
        </div>
      </Card.Body>
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