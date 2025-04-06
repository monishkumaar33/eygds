const express = require('express');
const router = express.Router();
const Auction = require('../models/Auction'); // adjust if path differs
const authenticateToken = require('../middleware/authMiddleware'); // JWT middleware

// POST route for placing a bid
router.post('/:id/bid', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { bidAmount } = req.body;
  const userId = req.user.id;

  try {
    const auction = await Auction.findById(id);
    if (!auction) return res.status(404).json({ message: "Auction not found" });

    if (bidAmount <= auction.currentBid) {
      return res.status(400).json({ message: "Bid must be higher than current bid" });
    }

    auction.currentBid = bidAmount;
    auction.bids.push({ user: userId, amount: bidAmount, time: new Date() });
    await auction.save();

    res.status(200).json({ message: "Bid placed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
