import mongoose from 'mongoose';

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
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for better query performance
announcementSchema.index({ year: 1, medium: 1 });
announcementSchema.index({ visibility: 1 });
announcementSchema.index({ postedOn: -1 });
announcementSchema.index({ isActive: 1 });
announcementSchema.index({ createdBy: 1 });

// Static method to get announcements by filters
announcementSchema.statics.getFilteredAnnouncements = async function(filters = {}) {
  const query = { isActive: true };
  
  if (filters.year) {
    query.year = filters.year;
  }
  
  if (filters.medium) {
    query.medium = filters.medium;
  }
  
  if (filters.visibility) {
    query.visibility = filters.visibility;
  }
  
  return await this.find(query)
    .sort({ postedOn: -1 })
    .limit(filters.limit || 50);
};

// Static method to get public announcements for homepage
announcementSchema.statics.getPublicAnnouncements = async function(limit = 5) {
  return await this.find({
    isActive: true,
    visibility: 'public'
  })
  .sort({ postedOn: -1 })
  .limit(limit)
  .select('title description postedOn year medium');
};

// Static method to get dashboard announcements for specific year and medium
announcementSchema.statics.getDashboardAnnouncements = async function(year, medium, limit = 10) {
  return await this.find({
    isActive: true,
    year: year,
    medium: medium,
    $or: [
      { visibility: 'dashboard' },
      { visibility: 'public' }
    ]
  })
  .sort({ postedOn: -1 })
  .limit(limit)
  .select('title description postedOn visibility');
};

// Static method to get announcement statistics
announcementSchema.statics.getStats = async function(filters = {}) {
  const matchQuery = { isActive: true };
  
  if (filters.year) {
    matchQuery.year = filters.year;
  }
  
  if (filters.medium) {
    matchQuery.medium = filters.medium;
  }
  
  return await this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        public: { $sum: { $cond: [{ $eq: ['$visibility', 'public'] }, 1, 0] } },
        dashboard: { $sum: { $cond: [{ $eq: ['$visibility', 'dashboard'] }, 1, 0] } },
        thisMonth: {
          $sum: {
            $cond: [
              {
                $gte: ['$postedOn', new Date(new Date().getFullYear(), new Date().getMonth(), 1)]
              },
              1,
              0
            ]
          }
        },
        thisWeek: {
          $sum: {
            $cond: [
              {
                $gte: ['$postedOn', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)]
              },
              1,
              0
            ]
          }
        }
      }
    }
  ]);
};

// Instance method to get announcement summary
announcementSchema.methods.getSummary = function() {
  return {
    _id: this._id,
    title: this.title,
    description: this.description.length > 100 
      ? this.description.substring(0, 100) + '...' 
      : this.description,
    year: this.year,
    medium: this.medium,
    visibility: this.visibility,
    postedOn: this.postedOn,
    createdByName: this.createdByName
  };
};

// Instance method to check if announcement is recent (within 7 days)
announcementSchema.methods.isRecent = function() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  return this.postedOn > sevenDaysAgo;
};

const Announcement = mongoose.model('Announcement', announcementSchema);

export default Announcement; 