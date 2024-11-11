-- Insert sample users
INSERT INTO Users (email, password, isOwner) VALUES
('alice@example.com', 'Password1', TRUE),  -- userID 1
('bob@example.com', 'Password2', FALSE),   -- userID 2
('charlie@example.com', 'Password3', TRUE), -- userID 3
('dave@example.com', 'Password4', FALSE);   -- userID 4


-- Insert sample groups
INSERT INTO GroupTable (groupName, ownerID) VALUES
('Sci-Fi Enthusiasts', 1),
('Action Lovers', 3);
