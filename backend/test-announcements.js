import mongoose from 'mongoose';

// Define the announcement schema directly since we can't import ES modules
const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: [2020, 'Year must be 2020 or later'],
    max: [2030, 'Year cannot be later than 2030']
  },
  medium: {
    type: String,
    required: [true, 'Medium is required'],
    enum: {
      values: ['Hindi', 'English'],
      message: 'Medium must be either Hindi or English'
    }
  },
  visibility: {
    type: String,
    required: [true, 'Visibility is required'],
    enum: {
      values: ['public', 'dashboard'],
      message: 'Visibility must be either public or dashboard'
    },
    default: 'dashboard'
  },
  postedOn: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: String,
    required: [true, 'Created by admin is required']
  },
  createdByName: {
    type: String,
    required: [true, 'Admin name is required']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const Announcement = mongoose.model('Announcement', announcementSchema);

async function testAnnouncements() {
  try {
    await mongoose.connect('mongodb://localhost:27017/excellenceSchool');
    console.log('Connected to MongoDB');
    
    const announcements = await Announcement.find({});
    console.log('Total announcements:', announcements.length);
    
    announcements.forEach(ann => {
      console.log('- Title:', ann.title, '| Visibility:', ann.visibility, '| Active:', ann.isActive);
    });
    
    // Create a test announcement if none exist
    if (announcements.length === 0) {
      console.log('Creating test announcement...');
      const testAnnouncement = new Announcement({
        title: 'Test Announcement',
        description: 'This is a test announcement to verify the system is working.',
        year: 2025,
        medium: 'English',
        visibility: 'public',
        createdBy: 'test-admin',
        createdByName: 'Test Admin'
      });
      
      await testAnnouncement.save();
      console.log('Test announcement created successfully!');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testAnnouncements();