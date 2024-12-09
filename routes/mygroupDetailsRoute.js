const express = require('express');
const mygroupDetailsRouter = express.Router();
const pool = require('../helpers/db.js');
const authenticateToken = require('../middleware/authenticateToken');

// Get group details (group name and description)
mygroupDetailsRouter.get('/:groupID', authenticateToken, async (req, res) => {
  const { groupID } = req.params;

  try {
    const query = 'SELECT * FROM Groups WHERE groupID = $1';
    const result = await pool.query(query, [groupID]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Group not found.' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching group details:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// Get join requests for a group
mygroupDetailsRouter.get('/:groupID/join-requests', authenticateToken, async (req, res) => {
  const { groupID } = req.params;

  try {
    const query = `
      SELECT u.userID, u.firstName, u.lastName
      FROM GroupJoinRequests gjr
      JOIN Users u ON gjr.userID = u.userID
      WHERE gjr.groupID = $1
    `;
    const result = await pool.query(query, [groupID]);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching join requests:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// Accept a join request
mygroupDetailsRouter.post('/:groupID/accept-request', authenticateToken, async (req, res) => {
  const { groupID } = req.params;
  const { userID } = req.body;

  try {
    const deleteRequestQuery = `
      DELETE FROM GroupJoinRequests
      WHERE groupID = $1 AND userID = $2
    `;
    const deleteResult = await pool.query(deleteRequestQuery, [groupID, userID]);

    if (deleteResult.rowCount === 0) {
      return res.status(404).json({ message: 'Join request not found.' });
    }

    const addMemberQuery = `
      INSERT INTO GroupMembers (groupID, userID, isPending)
      VALUES ($1, $2, FALSE)
      ON CONFLICT (groupID, userID) DO NOTHING
    `;
    await pool.query(addMemberQuery, [groupID, userID]);

    res.status(200).json({ message: 'Join request accepted.' });
  } catch (error) {
    console.error('Error accepting join request:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// Decline a join request
mygroupDetailsRouter.post('/:groupID/decline-request', authenticateToken, async (req, res) => {
  const { groupID } = req.params;
  const { userID } = req.body;

  try {
    const deleteRequestQuery = `
      DELETE FROM GroupJoinRequests
      WHERE groupID = $1 AND userID = $2
    `;
    const deleteResult = await pool.query(deleteRequestQuery, [groupID, userID]);

    if (deleteResult.rowCount === 0) {
      return res.status(404).json({ message: 'Join request not found.' });
    }

    res.status(200).json({ message: 'Join request declined.' });
  } catch (error) {
    console.error('Error declining join request:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// Get group members
mygroupDetailsRouter.get('/:groupID/members', authenticateToken, async (req, res) => {
  const { groupID } = req.params;

  try {
    const query = `
      SELECT u.userID, u.firstName, u.lastName
      FROM GroupMembers gm
      JOIN Users u ON gm.userID = u.userID
      WHERE gm.groupID = $1 AND gm.isPending = FALSE
    `;
    const result = await pool.query(query, [groupID]);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching group members:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// Remove a group member
mygroupDetailsRouter.delete('/:groupID/remove-member', authenticateToken, async (req, res) => {
  const { groupID } = req.params;
  const { userID } = req.body;

  try {
    const deleteMemberQuery = `
      DELETE FROM GroupMembers
      WHERE groupID = $1 AND userID = $2
    `;
    await pool.query(deleteMemberQuery, [groupID, userID]);

    const deleteJoinRequestQuery = `
      DELETE FROM GroupJoinRequests
      WHERE groupID = $1 AND userID = $2
    `;
    await pool.query(deleteJoinRequestQuery, [groupID, userID]);

    res.status(200).json({ message: 'Member removed successfully.' });
  } catch (error) {
    console.error('Error removing member:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

module.exports = mygroupDetailsRouter;
