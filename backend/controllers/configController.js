import Subject from '../models/Subject.js';
import ClassFee from '../models/ClassFee.js';
import BusRoute from '../models/BusRoute.js';



// @desc    Get class fee for a specific class and medium
// @route   GET /api/config/fees/:class
// @access  Private (Teacher only)
export const getClassFee = async (req, res) => {
  try {
    const { class: className } = req.params;
    const { medium } = req.query;

    // Get teacher's medium if not provided in query
    const teacherMedium = medium || req.teacher.medium;

    if (!className) {
      return res.status(400).json({
        success: false,
        message: 'Class parameter is required'
      });
    }

    // Get fee structure for the class and medium
    const feeStructure = await ClassFee.getFeeStructureForClass(className, teacherMedium);

    if (!feeStructure) {
      return res.status(404).json({
        success: false,
        message: `No fee structure found for ${className} (${teacherMedium} Medium)`
      });
    }

    res.status(200).json({
      success: true,
      data: feeStructure.getFeeBreakdown()
    });

  } catch (error) {
    console.error('Get class fee error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch class fee',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get bus fee for a specific route
// @route   GET /api/config/bus-fee/:route
// @access  Private (Teacher only)
export const getBusFee = async (req, res) => {
  try {
    const { route: routeIdentifier } = req.params;

    if (!routeIdentifier) {
      return res.status(400).json({
        success: false,
        message: 'Route parameter is required'
      });
    }

    // Get bus route by name or code
    const busRoute = await BusRoute.getRouteByIdentifier(routeIdentifier);

    if (!busRoute) {
      return res.status(404).json({
        success: false,
        message: `Bus route '${routeIdentifier}' not found`
      });
    }

    res.status(200).json({
      success: true,
      data: {
        routeName: busRoute.routeName,
        routeCode: busRoute.routeCode,
        feeAmount: busRoute.feeAmount,
        hasCapacity: busRoute.hasCapacity(),
        availableSeats: busRoute.getAvailableSeats(),
        maxStudents: busRoute.maxStudents,
        currentStudents: busRoute.currentStudents
      }
    });

  } catch (error) {
    console.error('Get bus fee error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bus fee',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get all active bus routes
// @route   GET /api/config/bus-routes
// @access  Private (Teacher only)
export const getBusRoutes = async (req, res) => {
  try {
    const { academicYear } = req.query;

    // Get all active bus routes
    const busRoutes = await BusRoute.getActiveRoutes(academicYear);

    // Format response with route summaries
    const routeSummaries = busRoutes.map(route => route.getRouteSummary());

    res.status(200).json({
      success: true,
      data: routeSummaries,
      totalRoutes: routeSummaries.length,
      availableRoutes: routeSummaries.filter(route => route.hasCapacity).length
    });

  } catch (error) {
    console.error('Get bus routes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bus routes',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get complete configuration for student creation
// @route   GET /api/config/student-form/:class
// @access  Private (Teacher only)
export const getStudentFormConfig = async (req, res) => {
  try {
    const { class: className } = req.params;
    const { medium } = req.query; // Get medium from query params
    
    // Enhanced teacher context validation
    if (!req.teacher) {
      return res.status(401).json({
        success: false,
        message: 'Teacher authentication required / शिक्षक प्रमाणीकरण आवश्यक है'
      });
    }

    // Use medium from query params, fallback to teacher's medium, then to 'Hindi'
    const selectedMedium = medium || req.teacher.medium || 'Hindi';
    const academicYear = new Date().getFullYear().toString();

    if (!className) {
      return res.status(400).json({
        success: false,
        message: 'Class parameter is required / कक्षा पैरामीटर आवश्यक है'
      });
    }

    console.log(`Fetching config for: ${className}, Medium: ${selectedMedium}, Year: ${academicYear}`);

    // Initialize variables with defaults
    let subjects = [];
    let feeStructure = null;
    let busRoutes = [];
    let busRouteOptions = [];
    const warnings = [];

    // 1. Fetch subjects with error handling
    try {
      const subjectResult = await Subject.getSubjectsForClass(className, selectedMedium, academicYear);
      subjects = Array.isArray(subjectResult) ? subjectResult : [];
      console.log(`Found ${subjects.length} subjects for ${className} (${selectedMedium})`);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      warnings.push(`Error loading subjects for ${className} (${selectedMedium} Medium): ${error.message}`);
    }

    // 2. Fetch fee structure with error handling
    try {
      feeStructure = await ClassFee.getFeeStructureForClass(className, selectedMedium, academicYear);
      console.log(`Fee structure found for ${className} (${selectedMedium}):`, !!feeStructure);
      if (feeStructure) {
        console.log(`Fee details:`, feeStructure.getFeeBreakdown());
      } else {
        console.log(`No fee structure found for ${className} (${selectedMedium}) in ${academicYear}`);
        // Try current year if specific year fails
        if (academicYear !== new Date().getFullYear().toString()) {
          console.log('Trying current year...');
          feeStructure = await ClassFee.getFeeStructureForClass(className, selectedMedium);
        }
      }
    } catch (error) {
      console.error('Error fetching fee structure:', error);
      warnings.push(`Error loading fee structure for ${className} (${selectedMedium} Medium): ${error.message}`);
    }

    // 3. Fetch bus routes with error handling
    try {
      const busRouteResult = await BusRoute.getActiveRoutes(academicYear);
      busRoutes = Array.isArray(busRouteResult) ? busRouteResult : [];
      console.log(`Found ${busRoutes.length} active bus routes`);

      // Format bus routes for dropdown with capacity check
      busRouteOptions = busRoutes
        .filter(route => {
          try {
            return route && typeof route.hasCapacity === 'function' ? route.hasCapacity() : true;
          } catch (err) {
            console.error('Error checking route capacity:', err);
            return true; // Include route if capacity check fails
          }
        })
        .map(route => {
          try {
            return {
              value: route.routeName || 'Unknown Route',
              label: `${route.routeName || 'Unknown'} (₹${route.feeAmount || 0}) - ${
                typeof route.getAvailableSeats === 'function' ? route.getAvailableSeats() : '?'
              } seats available`,
              code: route.routeCode || 'N/A',
              fee: route.feeAmount || 0,
              availableSeats: typeof route.getAvailableSeats === 'function' ? route.getAvailableSeats() : 0
            };
          } catch (err) {
            console.error('Error formatting bus route:', err);
            return {
              value: route.routeName || 'Unknown Route',
              label: `${route.routeName || 'Unknown'} (₹${route.feeAmount || 0})`,
              code: route.routeCode || 'N/A',
              fee: route.feeAmount || 0,
              availableSeats: 0
            };
          }
        });
    } catch (error) {
      console.error('Error fetching bus routes:', error);
      warnings.push(`Error loading bus routes: ${error.message}`);
    }

    // 4. Add configuration warnings
    if (subjects.length === 0) {
      warnings.push(`No subjects configured for ${className} (${selectedMedium} Medium)`);
    }

    if (!feeStructure) {
      warnings.push(`No fee structure configured for ${className} (${selectedMedium} Medium)`);
    }

    if (busRouteOptions.length === 0) {
      warnings.push('No bus routes available with capacity');
    }

    // 5. Determine if configuration is complete
    const classFeeAmount = feeStructure ? 
      (typeof feeStructure.totalFee === 'number' ? feeStructure.totalFee : 0) : 0;
    
    console.log(`Class fee amount calculated: ${classFeeAmount}`);
    
    // Configuration is complete if we have either subjects OR fees (more flexible)
    const configComplete = subjects.length > 0 || classFeeAmount > 0;
    
    if (!configComplete) {
      warnings.push(`Please set up subjects and/or fees for ${className} (${selectedMedium} Medium) in admin panel`);
    }

    // 6. Prepare response data
    const responseData = {
      class: className,
      medium: selectedMedium,
      academicYear,
      subjects: subjects,
      classFee: classFeeAmount,
      feeBreakdown: feeStructure && typeof feeStructure.getFeeBreakdown === 'function' ? 
        feeStructure.getFeeBreakdown() : null,
      busRoutes: busRouteOptions,
      configComplete,
      warnings,
      debug: {
        subjectsCount: subjects.length,
        hasFeeStructure: !!feeStructure,
        busRoutesCount: busRoutes.length,
        teacherInfo: {
          teacherMedium: req.teacher.medium,
          selectedMedium: selectedMedium,
          hasTeacherContext: !!req.teacher
        }
      }
    };

    console.log('Config response:', JSON.stringify(responseData, null, 2));

    res.status(200).json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('Get student form config error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch student form configuration / छात्र फॉर्म कॉन्फ़िगरेशन लाने में विफल',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Fee Management Endpoints

// Set Class Fee
export const setClassFee = async (req, res) => {
  try {
    const { class: className, medium, academicYear, feeStructure, paymentSchedule, installments } = req.body;

    // Validate required fields
    if (!className || !medium || !feeStructure || !feeStructure.tuitionFee) {
      return res.status(400).json({
        success: false,
        message: 'कक्षा, माध्यम और शिक्षण फीस आवश्यक है / Class, medium and tuition fee are required'
      });
    }

    // Create or update class fee
    const classFeeData = {
      class: className,
      medium,
      academicYear: academicYear || new Date().getFullYear().toString(),
      feeStructure,
      paymentSchedule: paymentSchedule || 'Annual',
      installments: installments || [],
      lastUpdatedBy: req.user?.email || 'Admin'
    };

    const existingFee = await ClassFee.findOne({
      class: className,
      medium,
      academicYear: classFeeData.academicYear
    });

    let classFee;
    if (existingFee) {
      // Update existing
      Object.assign(existingFee, classFeeData);
      classFee = await existingFee.save();
    } else {
      // Create new
      classFee = new ClassFee(classFeeData);
      classFee = await classFee.save();
    }

    res.status(200).json({
      success: true,
      message: `${className} (${medium}) की फीस सफलतापूर्वक अपडेट की गई / Fee for ${className} (${medium}) updated successfully`,
      data: {
        classFee: classFee.getFeeBreakdown()
      }
    });

  } catch (error) {
    console.error('Error setting class fee:', error);
    res.status(500).json({
      success: false,
      message: 'कक्षा फीस सेट करने में त्रुटि / Error setting class fee',
      error: error.message
    });
  }
};

// Set Bus Route Fee
export const setBusRouteFee = async (req, res) => {
  try {
    const { routeIdentifier, feeAmount, academicYear } = req.body;

    // Validate required fields
    if (!routeIdentifier || feeAmount === undefined || feeAmount < 0) {
      return res.status(400).json({
        success: false,
        message: 'रूट और वैध फीस राशि आवश्यक है / Route and valid fee amount are required'
      });
    }

    // Find route by name or code
    const route = await BusRoute.findOne({
      $or: [
        { routeName: routeIdentifier },
        { routeCode: routeIdentifier }
      ],
      academicYear: academicYear || new Date().getFullYear().toString()
    });

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'बस रूट नहीं मिला / Bus route not found'
      });
    }

    // Update fee
    route.feeAmount = feeAmount;
    route.lastUpdatedBy = req.user?.email || 'Admin';
    await route.save();

    res.status(200).json({
      success: true,
      message: `${route.routeName} की बस फीस सफलतापूर्वक अपडेट की गई / Bus fee for ${route.routeName} updated successfully`,
      data: {
        route: route.getRouteSummary()
      }
    });

  } catch (error) {
    console.error('Error setting bus route fee:', error);
    res.status(500).json({
      success: false,
      message: 'बस रूट फीस सेट करने में त्रुटि / Error setting bus route fee',
      error: error.message
    });
  }
};

// Get Class Fees
export const getClassFees = async (req, res) => {
  try {
    const { medium, academicYear } = req.query;
    
    const query = { isActive: true };
    if (medium) query.medium = medium;
    if (academicYear) query.academicYear = academicYear;
    else query.academicYear = new Date().getFullYear().toString();

    const classFees = await ClassFee.find(query).sort({ class: 1 });

    res.status(200).json({
      success: true,
      message: 'Class fees retrieved successfully',
      data: {
        classFees: classFees.map(fee => fee.getFeeBreakdown()),
        total: classFees.length
      }
    });

  } catch (error) {
    console.error('Error getting class fees:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving class fees',
      error: error.message
    });
  }
};

// Get Bus Route Fees
export const getBusRouteFees = async (req, res) => {
  try {
    const { academicYear } = req.query;
    
    const query = { isActive: true };
    if (academicYear) query.academicYear = academicYear;
    else query.academicYear = new Date().getFullYear().toString();

    const busRoutes = await BusRoute.find(query).sort({ routeName: 1 });

    res.status(200).json({
      success: true,
      message: 'Bus route fees retrieved successfully',
      data: {
        busRoutes: busRoutes.map(route => route.getRouteSummary()),
        total: busRoutes.length
      }
    });

  } catch (error) {
    console.error('Error getting bus route fees:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving bus route fees',
      error: error.message
    });
  }
};

// Get Fee for Specific Class
export const getFeeForClass = async (req, res) => {
  try {
    const { class: className, medium, academicYear } = req.params;

    const fee = await ClassFee.getFeeStructureForClass(
      className, 
      medium, 
      academicYear || new Date().getFullYear().toString()
    );

    if (!fee) {
      return res.status(404).json({
        success: false,
        message: `${className} (${medium}) के लिए फीस कॉन्फ़िगरेशन नहीं मिली / Fee configuration not found for ${className} (${medium})`
      });
    }

    res.status(200).json({
      success: true,
      message: 'Fee retrieved successfully',
      data: {
        classFee: fee.getFeeBreakdown()
      }
    });

  } catch (error) {
    console.error('Error getting fee for class:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving class fee',
      error: error.message
    });
  }
};

// Get Fee for Specific Bus Route
export const getFeeForBusRoute = async (req, res) => {
  try {
    const { routeIdentifier } = req.params;

    const route = await BusRoute.getRouteByIdentifier(routeIdentifier);

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'बस रूट नहीं मिला / Bus route not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Bus route fee retrieved successfully',
      data: {
        route: route.getRouteSummary(),
        feeAmount: route.feeAmount
      }
    });

  } catch (error) {
    console.error('Error getting fee for bus route:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving bus route fee',
      error: error.message
    });
  }
};

// Bus Route Management Endpoints

// Create new bus route
export const createBusRoute = async (req, res) => {
  try {
    const { routeName, feeAmount } = req.body;

    console.log('Creating bus route with data:', { routeName, feeAmount });

    // Check if BusRoute model is available
    if (!BusRoute) {
      console.error('BusRoute model is not available');
      return res.status(500).json({
        success: false,
        message: 'Bus route model not available / बस रूट मॉडल उपलब्ध नहीं है'
      });
    }

    // Check MongoDB connection status
    const mongoose = (await import('mongoose')).default;
    console.log('MongoDB connection state:', mongoose.connection.readyState);
    console.log('MongoDB connection states: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting');
    
    if (mongoose.connection.readyState !== 1) {
      console.error('MongoDB is not connected. State:', mongoose.connection.readyState);
      return res.status(500).json({
        success: false,
        message: 'Database connection error / डेटाबेस कनेक्शन त्रुटि',
        connectionState: mongoose.connection.readyState
      });
    }

    // Validate required fields
    if (!routeName || !feeAmount || feeAmount < 0) {
      return res.status(400).json({
        success: false,
        message: 'रूट नाम और वैध फीस राशि आवश्यक है / Route name and valid fee amount are required'
      });
    }

    // Check if route name already exists - simplified
    try {
      console.log('Checking for existing route:', routeName.trim());
      const existingRoute = await BusRoute.findOne({ 
        routeName: routeName.trim(),
        isActive: true 
      });

      if (existingRoute) {
        console.log('Route already exists:', existingRoute._id);
        return res.status(400).json({
          success: false,
          message: 'यह रूट नाम पहले से मौजूद है / This route name already exists'
        });
      }
      console.log('Route name is available');
    } catch (findError) {
      console.warn('Could not check existing routes, proceeding anyway:', findError.message);
      // Continue with creation even if we can't check duplicates
    }

    // Create route code - simplified with fallback
    let routeCount = 0, routeCode;
    try {
      console.log('Counting existing routes...');
      routeCount = await BusRoute.countDocuments() || 0;
      console.log('Current route count:', routeCount);
    } catch (countError) {
      console.error('Error counting routes, using fallback:', countError);
      // Use timestamp as fallback if count fails
      routeCount = Date.now() % 1000;
    }
    
    routeCode = `R${(routeCount + 1).toString().padStart(3, '0')}`;
    console.log('Generated route code:', routeCode);

    // Create new bus route with all required fields properly set
    const busRouteData = {
      routeName: routeName.trim(),
      routeCode,
      feeAmount: parseFloat(feeAmount),
      stops: [], // Empty array is fine
      driverInfo: {
        driverName: 'To Be Assigned',
        driverMobile: '9999999999', // Valid Indian mobile number format
        driverLicense: 'TBD0001',   // Valid format
        experienceYears: 0
      },
      busInfo: {
        busNumber: `BUS${routeCode}`, // e.g., BUSR001
        busModel: 'Standard',
        capacity: 40,
        lastMaintenance: null,
        nextMaintenance: null
      },
      totalDistance: 0,
      estimatedTime: 60, // Default 60 minutes
      isActive: true,
      academicYear: new Date().getFullYear().toString(),
      maxStudents: 32, // 80% of 40 capacity
      currentStudents: 0,
      createdBy: req.admin?.name || req.user?.email || 'Admin',
      lastUpdatedBy: req.admin?.name || req.user?.email || 'Admin',
      notes: `Route created for ${routeName.trim()}`
    };

    // Ensure all required fields are properly set
    if (!busRouteData.routeName || !busRouteData.routeCode || !busRouteData.feeAmount) {
      return res.status(400).json({
        success: false,
        message: 'Missing required route data / आवश्यक रूट डेटा गुम है'
      });
    }

    console.log('Bus route data to save:', JSON.stringify(busRouteData, null, 2));

    const busRoute = new BusRoute(busRouteData);
    
    // Pre-save validation
    const validationError = busRoute.validateSync();
    if (validationError) {
      console.error('Validation error before save:', validationError);
      const validationErrors = Object.values(validationError.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: `Validation Error: ${validationErrors.join(', ')} / सत्यापन त्रुटि: ${validationErrors.join(', ')}`,
        validationErrors
      });
    }

    console.log('Saving bus route to database...');
    
    // Add timeout for save operation
    const savePromise = busRoute.save();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database save timeout')), 10000)
    );
    
    const savedRoute = await Promise.race([savePromise, timeoutPromise]);
    console.log('Bus route saved successfully:', savedRoute._id);

    res.status(201).json({
      success: true,
      message: `बस रूट "${routeName}" सफलतापूर्वक जोड़ा गया / Bus route "${routeName}" added successfully`,
      data: {
        route: savedRoute.getRouteSummary()
      }
    });

  } catch (error) {
    console.error('Error creating bus route:', error);
    console.error('Error stack:', error.stack);
    
    // More detailed error reporting
    if (error.name === 'ValidationError') {
      console.error('Mongoose validation error:', error.errors);
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: `Validation Error: ${validationErrors.join(', ')} / सत्यापन त्रुटि: ${validationErrors.join(', ')}`,
        error: error.message,
        validationErrors
      });
    }

    if (error.code === 11000) {
      console.error('Duplicate key error:', error.keyPattern);
      return res.status(400).json({
        success: false,
        message: 'Duplicate entry - route name or code already exists / डुप्लिकेट एंट्री - रूट नाम या कोड पहले से मौजूद है',
        error: error.message
      });
    }

    if (error.name === 'MongoNetworkError') {
      console.error('Database connection error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Database connection error / डेटाबेस कनेक्शन त्रुटि',
        error: 'Database connection failed'
      });
    }

    // Try fallback creation with minimal fields
    console.log('Attempting fallback route creation with minimal fields...');
    try {
      const fallbackRoute = await BusRoute.create({
        routeName: routeName.trim(),
        routeCode: `R${Date.now().toString().slice(-3)}`,
        feeAmount: parseFloat(feeAmount),
        stops: [],
        driverInfo: {
          driverName: 'To Be Assigned',
          driverMobile: '9999999999',
          driverLicense: 'TBD0001',
          experienceYears: 0
        },
        busInfo: {
          busNumber: `BUS${Date.now().toString().slice(-3)}`,
          busModel: 'Standard',
          capacity: 40
        }
      });

      console.log('Fallback route created successfully:', fallbackRoute._id);
      return res.status(201).json({
        success: true,
        message: `बस रूट "${routeName}" सफलतापूर्वक जोड़ा गया (fallback) / Bus route "${routeName}" added successfully (fallback)`,
        data: {
          route: {
            _id: fallbackRoute._id,
            routeName: fallbackRoute.routeName,
            routeCode: fallbackRoute.routeCode,
            feeAmount: fallbackRoute.feeAmount
          }
        }
      });
    } catch (fallbackError) {
      console.error('Fallback creation also failed:', fallbackError);
    }

    res.status(500).json({
      success: false,
      message: 'बस रूट बनाने में त्रुटि / Error creating bus route',
      error: error.message,
      errorType: error.name || 'UnknownError'
    });
  }
};

// Update bus route
export const updateBusRoute = async (req, res) => {
  try {
    const { id } = req.params;
    const { routeName, feeAmount } = req.body;

    // Validate required fields
    if (!routeName || !feeAmount || feeAmount < 0) {
      return res.status(400).json({
        success: false,
        message: 'रूट नाम और वैध फीस राशि आवश्यक है / Route name and valid fee amount are required'
      });
    }

    // Find the route
    const busRoute = await BusRoute.findById(id);
    if (!busRoute) {
      return res.status(404).json({
        success: false,
        message: 'बस रूट नहीं मिला / Bus route not found'
      });
    }

    // Check if route name already exists (excluding current route)
    const existingRoute = await BusRoute.findOne({ 
      routeName: routeName.trim(),
      _id: { $ne: id },
      isActive: true 
    });

    if (existingRoute) {
      return res.status(400).json({
        success: false,
        message: 'यह रूट नाम पहले से मौजूद है / This route name already exists'
      });
    }

    // Update route
    busRoute.routeName = routeName.trim();
    busRoute.feeAmount = parseFloat(feeAmount);
    busRoute.lastUpdatedBy = req.admin?.name || req.user?.email || 'Admin';
    
    await busRoute.save();

    res.status(200).json({
      success: true,
      message: `बस रूट "${routeName}" सफलतापूर्वक अपडेट किया गया / Bus route "${routeName}" updated successfully`,
      data: {
        route: busRoute.getRouteSummary()
      }
    });

  } catch (error) {
    console.error('Error updating bus route:', error);
    res.status(500).json({
      success: false,
      message: 'बस रूट अपडेट करने में त्रुटि / Error updating bus route',
      error: error.message
    });
  }
};

// Delete bus route
export const deleteBusRoute = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the route
    const busRoute = await BusRoute.findById(id);
    if (!busRoute) {
      return res.status(404).json({
        success: false,
        message: 'बस रूट नहीं मिला / Bus route not found'
      });
    }

    // Check if route is being used by any students
    const Student = (await import('../models/Student.js')).default;
    const studentsUsingRoute = await Student.countDocuments({ 
      busRoute: busRoute.routeName,
      isActive: true 
    });

    if (studentsUsingRoute > 0) {
      // Instead of preventing deletion, provide option to reassign students
      return res.status(400).json({
        success: false,
        message: `इस रूट का उपयोग ${studentsUsingRoute} छात्रों द्वारा किया जा रहा है। क्या आप छात्रों को "No Bus" में reassign करना चाहते हैं? / This route is being used by ${studentsUsingRoute} students. Do you want to reassign students to "No Bus"?`,
        studentsCount: studentsUsingRoute,
        allowForceDelete: true
      });
    }

    // Soft delete the route
    busRoute.isActive = false;
    busRoute.lastUpdatedBy = req.admin?.name || req.user?.email || 'Admin';
    await busRoute.save();

    res.status(200).json({
      success: true,
      message: `बस रूट "${busRoute.routeName}" सफलतापूर्वक हटाया गया / Bus route "${busRoute.routeName}" deleted successfully`
    });

  } catch (error) {
    console.error('Error deleting bus route:', error);
    res.status(500).json({
      success: false,
      message: 'बस रूट हटाने में त्रुटि / Error deleting bus route',
      error: error.message
    });
  }
};

// Force delete bus route (reassign students to no bus)
export const forceDeleteBusRoute = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the route
    const busRoute = await BusRoute.findById(id);
    if (!busRoute) {
      return res.status(404).json({
        success: false,
        message: 'बस रूट नहीं मिला / Bus route not found'
      });
    }

    // Reassign all students using this route to "No Bus"
    const Student = (await import('../models/Student.js')).default;
    const updateResult = await Student.updateMany(
      { 
        busRoute: busRoute.routeName,
        isActive: true 
      },
      { 
        $set: { 
          hasBus: false, 
          busRoute: null,
          busFee: { total: 0, paid: 0, pending: 0 }
        } 
      }
    );

    // Soft delete the route
    busRoute.isActive = false;
    busRoute.lastUpdatedBy = req.admin?.name || req.user?.email || 'Admin';
    await busRoute.save();

    res.status(200).json({
      success: true,
      message: `बस रूट "${busRoute.routeName}" सफलतापूर्वक हटाया गया और ${updateResult.modifiedCount} छात्रों को "No Bus" में reassign किया गया / Bus route "${busRoute.routeName}" deleted successfully and ${updateResult.modifiedCount} students reassigned to "No Bus"`
    });

  } catch (error) {
    console.error('Error force deleting bus route:', error);
    res.status(500).json({
      success: false,
      message: 'बस रूट हटाने में त्रुटि / Error deleting bus route',
      error: error.message
    });
  }
};

// Get all bus routes
export const getAllBusRoutes = async (req, res) => {
  try {
    const { academicYear } = req.query;
    
    const query = { isActive: true };
    if (academicYear) {
      query.academicYear = academicYear;
    }

    const busRoutes = await BusRoute.find(query).sort({ routeName: 1 });

    // Format response with simple route data for the form
    const routesData = busRoutes.map(route => ({
      _id: route._id,
      routeName: route.routeName,
      routeCode: route.routeCode,
      feeAmount: route.feeAmount,
      createdAt: route.createdAt,
      updatedAt: route.updatedAt
    }));

    res.status(200).json({
      success: true,
      message: 'Bus routes retrieved successfully',
      data: routesData,
      total: routesData.length
    });

  } catch (error) {
    console.error('Error getting bus routes:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving bus routes',
      error: error.message
    });
  }
};

// Get fee for a specific bus route
export const getBusRouteFee = async (req, res) => {
  try {
    const { routeName } = req.params;

    const route = await BusRoute.findOne({
      routeName: routeName,
      isActive: true
    });

    if (!route) {
      return res.status(404).json({
        success: false,
        message: `रूट "${routeName}" नहीं मिला / Route "${routeName}" not found`
      });
    }

    res.status(200).json({
      success: true,
      message: 'Route fee retrieved successfully',
      data: {
        routeName: route.routeName,
        feeAmount: route.feeAmount,
        hasCapacity: route.hasCapacity(),
        availableSeats: route.getAvailableSeats()
      }
    });

  } catch (error) {
    console.error('Error getting bus route fee:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving bus route fee',
      error: error.message
    });
  }
}; 



// @desc    Get subject options for dropdowns
// @route   GET /api/admin/subject-options
// @access  Private (Admin only)
export const getSubjectOptions = async (req, res) => {
  try {
    // Always return all available classes, not just existing ones in database
    const allClasses = [
      'Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4',
      'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
      'Class 11 Science', 'Class 11 Arts', 'Class 11 Commerce',
      'Class 12 Science', 'Class 12 Arts', 'Class 12 Commerce'
    ];
    
    // For mediums and years, we can get from database or use defaults
    const mediums = await Subject.distinct('medium');
    const years = await Subject.distinct('year');

    const defaultMediums = ['Hindi', 'English'];
    const currentYear = new Date().getFullYear();
    const defaultYears = [currentYear - 1, currentYear, currentYear + 1];

    console.log('Subject options request - Returning all classes:', allClasses.length);

    res.status(200).json({
      success: true,
      data: {
        classes: allClasses, // Always return all classes
        mediums: mediums.length > 0 ? mediums.sort() : defaultMediums,
        years: years.length > 0 ? years.map(Number).sort((a, b) => b - a) : defaultYears
      }
    });

  } catch (error) {
    console.error('Error getting subject options:', error);
    res.status(500).json({
      success: false,
      message: 'विकल्प प्राप्त करने में त्रुटि / Error retrieving options',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Test function for debugging bus route creation
export const testBusRouteCreation = async (req, res) => {
  try {
    console.log('Testing bus route creation...');
    
    // Check MongoDB connection
    const mongoose = (await import('mongoose')).default;
    console.log('MongoDB connection state in test:', mongoose.connection.readyState);
    
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({
        success: false,
        message: 'Database not connected',
        readyState: mongoose.connection.readyState
      });
    }

    // Try to create a simple route
    const testRouteData = {
      routeName: 'Test Route ' + Date.now(),
      routeCode: 'T001',
      feeAmount: 1000,
      stops: [],
      driverInfo: {
        driverName: 'Test Driver',
        driverMobile: '9999999999',
        driverLicense: 'TEST001',
        experienceYears: 0
      },
      busInfo: {
        busNumber: 'BUST001',
        busModel: 'Test Model',
        capacity: 40
      },
      isActive: true,
      academicYear: '2025'
    };

    console.log('Creating test route with data:', testRouteData);
    
    const testRoute = new BusRoute(testRouteData);
    const savedRoute = await testRoute.save();
    
    console.log('Test route created successfully:', savedRoute._id);
    
    res.status(200).json({
      success: true,
      message: 'Test route created successfully',
      data: savedRoute._id
    });

  } catch (error) {
    console.error('Test route creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Test failed',
      error: error.message,
      errorName: error.name
    });
  }
}; 