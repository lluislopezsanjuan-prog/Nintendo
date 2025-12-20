-- Database schema for Nintendo Loan Manager

CREATE TABLE IF NOT exists users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT exists games (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  platform VARCHAR(50),
  user_id INT,
  is_loaned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT exists loans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  game_id INT,
  lender_id INT,
  borrower_id INT,
  loan_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  return_date TIMESTAMP NULL,
  status ENUM('active', 'returned') DEFAULT 'active',
  FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
  FOREIGN KEY (lender_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (borrower_id) REFERENCES users(id) ON DELETE CASCADE
);
