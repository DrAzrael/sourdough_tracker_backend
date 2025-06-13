// MongoDB initialization script
// This script runs when the MongoDB container starts for the first time

// Create the main database
db = db.getSiblingDB('sourdough_tracker');

// Create a user for the application
db.createUser({
  user: 'app_user',
  pwd: 'app_password',
  roles: [
    {
      role: 'readWrite',
      db: 'sourdough_tracker'
    }
  ]
});

// Create initial collections
db.createCollection('users');
db.createCollection('villages');
db.createCollection('village_stats');
db.createCollection('stat_types');
db.createCollection('user_states');

// Create indexes for better performance
db.users.createIndex({ "login": 1 }, { unique: true });
db.users.createIndex({ "roblox_username": 1 }, { unique: true });
db.villages.createIndex({ "x": 1, "y": 1 }, { unique: true });
db.village_stats.createIndex({ "village_id": 1, "stat_type_id": 1, "report_date_time": -1 });

print('MongoDB initialization completed'); 