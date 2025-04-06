import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Alert, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const CreateAuction = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startingPrice, setStartingPrice] = useState('');
  const [endTime, setEndTime] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  
  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/signin');
    }
  }, [navigate]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!title || !description || !startingPrice || !endTime) {
      setError('Please fill in all required fields');
      return;
    }
    
    // Validate price
    const price = parseFloat(startingPrice);
    if (isNaN(price) || price <= 0) {
      setError('Starting price must be a positive number');
      return;
    }
    
    // Validate end time
    const endDate = new Date(endTime);
    const now = new Date();
    if (endDate <= now) {
      setError('End time must be in the future');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auctions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          description,
          startingPrice: price,
          endTime,
          imageUrl: imageUrl || undefined
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess(true);
        // Reset form
        setTitle('');
        setDescription('');
        setStartingPrice('');
        setEndTime('');
        setImageUrl('');
        
        // Redirect after 2 seconds
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        setError(data.message || 'Failed to create auction');
      }
    } catch (err) {
      console.error('Error creating auction:', err);
      setError('Server error. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Calculate minimum end time (current time + 1 hour)
  const getMinEndTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    return now.toISOString().slice(0, 16); // Format: YYYY-MM-DDThh:mm
  };
  
  return (
    <Container className="py-5">
      <Card className="shadow-sm">
        <Card.Body>
          <h2 className="mb-4">Create New Auction</h2>
          
          {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
          {success && (
            <Alert variant="success" className="mb-3">
              Auction created successfully! Redirecting to home page...
            </Alert>
          )}
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Title <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter auction title"
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Description <span className="text-danger">*</span></Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter auction description"
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Starting Price ($) <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="number"
                min="0.01"
                step="0.01"
                value={startingPrice}
                onChange={(e) => setStartingPrice(e.target.value)}
                placeholder="Enter starting price"
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>End Time <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                min={getMinEndTime()}
                required
              />
              <Form.Text className="text-muted">
                Auction must end at least 1 hour from now
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-4">
              <Form.Label>Image URL (optional)</Form.Label>
              <Form.Control
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Enter image URL"
              />
            </Form.Group>
            
            <div className="d-flex justify-content-between">
              <Button 
                variant="outline-secondary" 
                onClick={() => navigate('/')}
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Creating...' : 'Create Auction'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default CreateAuction; 