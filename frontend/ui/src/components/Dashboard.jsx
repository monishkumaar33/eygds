import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Tab, Nav, Alert, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [userAuctions, setUserAuctions] = useState([]);
  const [biddedAuctions, setBiddedAuctions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    if (!token || !userId) {
      navigate('/signin');
      return;
    }

    const fetchUserAuctions = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`http://localhost:5000/api/auctions/user/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user auctions');
        }

        const data = await response.json();
        setUserAuctions(data);
      } catch (err) {
        console.error('Error fetching user auctions:', err);
        setError('Failed to load your auctions');
      }
    };

    const fetchBiddedAuctions = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/auctions/bids/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch bidded auctions');
        }

        const data = await response.json();
        setBiddedAuctions(data);
      } catch (err) {
        console.error('Error fetching bidded auctions:', err);
        setError('Failed to load auctions you bid on');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserAuctions();
    fetchBiddedAuctions();
  }, [navigate]);

  const formatTimeRemaining = (endTime) => {
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

  const AuctionCard = ({ auction }) => (
    <Card className="mb-3 shadow-sm">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <h5 className="card-title mb-2">{auction.title}</h5>
            <p className="card-text text-muted small mb-2">
              {auction.description.length > 100 
                ? `${auction.description.substring(0, 100)}...` 
                : auction.description}
            </p>
            <div className="d-flex justify-content-between align-items-center">
              <span className="text-secondary small">Current bid:</span>
              <span className="fw-bold text-primary">${auction.currentBid.amount.toLocaleString()}</span>
            </div>
            <div className="d-flex justify-content-between align-items-center mt-2">
              <span className="text-secondary small">Time left:</span>
              <span className={`badge ${auction.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                {auction.status === 'active' ? formatTimeRemaining(auction.endTime) : 'Ended'}
              </span>
            </div>
          </div>
          {auction.imageUrl && (
            <img 
              src={auction.imageUrl} 
              alt={auction.title}
              style={{ width: '100px', height: '100px', objectFit: 'cover' }}
              className="ms-3 rounded"
            />
          )}
        </div>
      </Card.Body>
    </Card>
  );

  if (isLoading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <p className="fs-4">Loading your dashboard...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <h2 className="mb-4">My Dashboard</h2>
      
      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
      
      <Tab.Container defaultActiveKey="my-auctions">
        <Row>
          <Col sm={3}>
            <Nav variant="pills" className="flex-column">
              <Nav.Item>
                <Nav.Link eventKey="my-auctions">My Auctions</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="my-bids">Auctions I Bid On</Nav.Link>
              </Nav.Item>
            </Nav>
          </Col>
          <Col sm={9}>
            <Tab.Content>
              <Tab.Pane eventKey="my-auctions">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4>My Auctions</h4>
                  <Button 
                    variant="primary"
                    onClick={() => navigate('/create-auction')}
                  >
                    Create New Auction
                  </Button>
                </div>
                
                {userAuctions.length === 0 ? (
                  <Alert variant="info">
                    You haven't created any auctions yet.
                    <Button 
                      variant="link" 
                      className="p-0 ms-2"
                      onClick={() => navigate('/create-auction')}
                    >
                      Create your first auction
                    </Button>
                  </Alert>
                ) : (
                  userAuctions.map(auction => (
                    <AuctionCard key={auction._id} auction={auction} />
                  ))
                )}
              </Tab.Pane>
              
              <Tab.Pane eventKey="my-bids">
                <h4 className="mb-4">Auctions I Bid On</h4>
                
                {biddedAuctions.length === 0 ? (
                  <Alert variant="info">
                    You haven't bid on any auctions yet.
                    <Button 
                      variant="link" 
                      className="p-0 ms-2"
                      onClick={() => navigate('/')}
                    >
                      Browse auctions
                    </Button>
                  </Alert>
                ) : (
                  biddedAuctions.map(auction => (
                    <AuctionCard key={auction._id} auction={auction} />
                  ))
                )}
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    </Container>
  );
};

export default Dashboard;
