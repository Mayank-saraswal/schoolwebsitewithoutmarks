import mongoose from 'mongoose';

const busRouteSchema = new mongoose.Schema({
  routeName: {
    type: String,
    required: [true, 'Route name is required'],
    unique: true,
    trim: true,
    maxlength: [100, 'Route name cannot exceed 100 characters']
  },
  routeCode: {
    type: String,
    required: [true, 'Route code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    validate: {
      validator: function(code) {
        return /^R[0-9]{3}$/.test(code);
      },
      message: 'Route code must be in format R001, R002, etc.'
    }
  },
  feeAmount: {
    type: Number,
    required: [true, 'Fee amount is required'],
    min: [0, 'Fee amount cannot be negative']
  },
  stops: [{
    stopName: {
      type: String,
      required: [true, 'Stop name is required'],
      trim: true
    },
    stopOrder: {
      type: Number,
      required: [true, 'Stop order is required'],
      min: [1, 'Stop order must be at least 1']
    },
    pickupTime: {
      type: String,
      required: [true, 'Pickup time is required'],
      validate: {
        validator: function(time) {
          return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
        },
        message: 'Pickup time must be in HH:MM format'
      }
    },
    dropTime: {
      type: String,
      required: [true, 'Drop time is required'],
      validate: {
        validator: function(time) {
          return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
        },
        message: 'Drop time must be in HH:MM format'
      }
    },
    landmark: {
      type: String,
      trim: true,
      default: ''
    },
    distance: {
      type: Number,
      min: [0, 'Distance cannot be negative'],
      default: 0 // Distance from school in km
    }
  }],
  driverInfo: {
    driverName: {
      type: String,
      required: [true, 'Driver name is required'],
      trim: true
    },
    driverMobile: {
      type: String,
      required: [true, 'Driver mobile is required'],
      validate: {
        validator: function(mobile) {
          return /^[6-9]\d{9}$/.test(mobile);
        },
        message: 'Please enter a valid 10-digit Indian mobile number'
      }
    },
    driverLicense: {
      type: String,
      required: [true, 'Driver license is required'],
      trim: true,
      uppercase: true
    },
    experienceYears: {
      type: Number,
      min: [0, 'Experience cannot be negative'],
      default: 0
    }
  },
  busInfo: {
    busNumber: {
      type: String,
      required: [true, 'Bus number is required'],
      trim: true,
      uppercase: true
    },
    busModel: {
      type: String,
      trim: true,
      default: ''
    },
    capacity: {
      type: Number,
      required: [true, 'Bus capacity is required'],
      min: [10, 'Bus capacity must be at least 10']
    },
    lastMaintenance: {
      type: Date,
      default: null
    },
    nextMaintenance: {
      type: Date,
      default: null
    }
  },
  totalDistance: {
    type: Number,
    min: [0, 'Total distance cannot be negative'],
    default: function() {
      return this.stops.reduce((total, stop) => Math.max(total, stop.distance), 0);
    }
  },
  estimatedTime: {
    type: Number, // in minutes
    min: [1, 'Estimated time must be at least 1 minute'],
    default: 60
  },
  isActive: {
    type: Boolean,
    default: true
  },
  academicYear: {
    type: String,
    default: function() {
      return new Date().getFullYear().toString();
    }
  },
  maxStudents: {
    type: Number,
    default: function() {
      return Math.floor(this.busInfo.capacity * 0.8); // 80% of capacity for safety
    }
  },
  currentStudents: {
    type: Number,
    default: 0,
    min: [0, 'Current students cannot be negative']
  },
  createdBy: {
    type: String,
    default: 'Admin'
  },
  lastUpdatedBy: {
    type: String,
    default: 'Admin'
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters'],
    default: ''
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
busRouteSchema.index({ routeName: 1 });
busRouteSchema.index({ routeCode: 1 });
busRouteSchema.index({ isActive: 1 });
busRouteSchema.index({ academicYear: 1 });
busRouteSchema.index({ feeAmount: 1 });

// Pre-save middleware to sort stops by order and calculate total distance
busRouteSchema.pre('save', function(next) {
  // Sort stops by stopOrder
  this.stops.sort((a, b) => a.stopOrder - b.stopOrder);
  
  // Calculate total distance
  this.totalDistance = this.stops.reduce((total, stop) => Math.max(total, stop.distance), 0);
  
  // Calculate max students (80% of bus capacity)
  if (this.busInfo && this.busInfo.capacity) {
    this.maxStudents = Math.floor(this.busInfo.capacity * 0.8);
  }
  
  next();
});

// Static method to get active routes
busRouteSchema.statics.getActiveRoutes = async function(academicYear = null) {
  const query = { isActive: true };
  
  if (academicYear) {
    query.academicYear = academicYear;
  } else {
    query.academicYear = new Date().getFullYear().toString();
  }
  
  return await this.find(query).sort({ routeName: 1 });
};

// Static method to get route by name or code
busRouteSchema.statics.getRouteByIdentifier = async function(identifier) {
  return await this.findOne({
    $or: [
      { routeName: identifier },
      { routeCode: identifier }
    ],
    isActive: true
  });
};

// Static method to get fee for a route
busRouteSchema.statics.getFeeForRoute = async function(routeIdentifier) {
  const route = await this.getRouteByIdentifier(routeIdentifier);
  return route ? route.feeAmount : 0;
};

// Instance method to check if route has capacity
busRouteSchema.methods.hasCapacity = function() {
  return this.currentStudents < this.maxStudents;
};

// Instance method to get available seats
busRouteSchema.methods.getAvailableSeats = function() {
  return Math.max(0, this.maxStudents - this.currentStudents);
};

// Instance method to get route summary
busRouteSchema.methods.getRouteSummary = function() {
  return {
    _id: this._id,
    routeName: this.routeName,
    routeCode: this.routeCode,
    feeAmount: this.feeAmount,
    totalStops: this.stops.length,
    totalDistance: this.totalDistance,
    estimatedTime: this.estimatedTime,
    maxStudents: this.maxStudents,
    currentStudents: this.currentStudents,
    availableSeats: this.getAvailableSeats(),
    hasCapacity: this.hasCapacity(),
    driverName: this.driverInfo.driverName,
    driverMobile: this.driverInfo.driverMobile,
    busNumber: this.busInfo.busNumber,
    isActive: this.isActive
  };
};

// Instance method to add student to route
busRouteSchema.methods.addStudent = function() {
  if (this.hasCapacity()) {
    this.currentStudents += 1;
    return true;
  }
  return false;
};

// Instance method to remove student from route
busRouteSchema.methods.removeStudent = function() {
  if (this.currentStudents > 0) {
    this.currentStudents -= 1;
    return true;
  }
  return false;
};

const BusRoute = mongoose.model('BusRoute', busRouteSchema);

export default BusRoute; 