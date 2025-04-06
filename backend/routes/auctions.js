const express = require("express");
const Auction = require("../models/Auction");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Create Auction
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, description, startingPrice, endTime, imageUrl } = req.body;
    
    // Validate required fields
    if (!title || !description || !startingPrice || !endTime) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    
    // Create auction
    const auction = new Auction({
      title,
      description,
      startingPrice,
      currentBid: { 
        amount: startingPrice,
        user: req.userId,
        time: new Date()
      },
      endTime: new Date(endTime),
      owner: req.userId,
      imageUrl
    });
    
    await auction.save();
    res.status(201).json(auction);
  } catch (error) {
    console.error("Create auction error:", error);
    res.status(500).json({ message: "Server error creating auction" });
  }
});

// Get all auctions
router.get("/", async (req, res) => {
  try {
    const auctions = await Auction.find({ status: 'active' })
      .populate('owner', 'username')
      .sort({ createdAt: -1 });
    res.json(auctions);
  } catch (error) {
    console.error("Get auctions error:", error);
    res.status(500).json({ message: "Server error fetching auctions" });
  }
});

// Get auction by ID
router.get("/:id", async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id)
      .populate('owner', 'username')
      .populate('bids.user', 'username');
    
    if (!auction) {
      return res.status(404).json({ message: "Auction not found" });
    }
    
    res.json(auction);
  } catch (error) {
    console.error("Get auction error:", error);
    res.status(500).json({ message: "Server error fetching auction" });
  }
});

// Place bid
router.post("/:id/bid", authMiddleware, async (req, res) => {
  try {
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid bid amount" });
    }
    
    const auction = await Auction.findById(req.params.id);
    
    if (!auction) {
      return res.status(404).json({ message: "Auction not found" });
    }
    
    if (auction.status !== 'active') {
      return res.status(400).json({ message: "Auction is no longer active" });
    }
    
    if (auction.owner.toString() === req.userId) {
      return res.status(400).json({ message: "You cannot bid on your own auction" });
    }
    
    if (amount <= auction.currentBid.amount) {
      return res.status(400).json({ message: "Bid must be higher than current bid" });
    }
    
    // Update current bid
    auction.currentBid = {
      amount,
      user: req.userId,
      time: new Date()
    };
    
    // Add to bids history
    auction.bids.push({
      user: req.userId,
      amount,
      time: new Date()
    });
    
    await auction.save();
    res.json(auction);
  } catch (error) {
    console.error("Place bid error:", error);
    res.status(500).json({ message: "Server error placing bid" });
  }
});

// Close auction
router.post("/:id/close", authMiddleware, async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    
    if (!auction) {
      return res.status(404).json({ message: "Auction not found" });
    }
    
    if (String(auction.owner) !== req.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    auction.status = 'ended';
    await auction.save();
    res.json({ message: "Auction closed", auction });
  } catch (error) {
    console.error("Close auction error:", error);
    res.status(500).json({ message: "Server error closing auction" });
  }
});

// Get auctions created by a specific user
router.get('/user/:userId', authMiddleware, async (req, res) => {
  try {
    const auctions = await Auction.find({ owner: req.params.userId })
      .populate('owner', 'username')
      .populate('currentBid.user', 'username')
      .populate('bids.user', 'username')
      .sort({ createdAt: -1 });
    
    res.json(auctions);
  } catch (error) {
    console.error('Error fetching user auctions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get auctions that a user has bid on
router.get('/bids/:userId', authMiddleware, async (req, res) => {
  try {
    const auctions = await Auction.find({
      'bids.user': req.params.userId
    })
      .populate('owner', 'username')
      .populate('currentBid.user', 'username')
      .populate('bids.user', 'username')
      .sort({ createdAt: -1 });
    
    res.json(auctions);
  } catch (error) {
    console.error('Error fetching bidded auctions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
