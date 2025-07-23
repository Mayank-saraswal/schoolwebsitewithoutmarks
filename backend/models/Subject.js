import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
  class: {
    type: String,
    required: true,
    enum: [
      'Nursery', 'LKG', 'UKG', 
      'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
      'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
      'Class 11 Science', 'Class 11 Arts', 'Class 11 Commerce',
      'Class 12 Science', 'Class 12 Arts', 'Class 12 Commerce'
    ]
  },
  medium: {
    type: String,
    required: true,
    enum: ['Hindi', 'English']
  },
  subjects: [{
    type: String,
    required: true
  }],
  academicYear: {
    type: String,
    default: () => new Date().getFullYear().toString()
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for efficient queries
subjectSchema.index({ class: 1, medium: 1, academicYear: 1 });

// Update the updatedAt field before saving
subjectSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static method to get subjects for a class and medium
subjectSchema.statics.getSubjectsForClass = async function(className, medium, academicYear = null) {
  const year = academicYear || new Date().getFullYear().toString();
  
  const subjectDoc = await this.findOne({
    class: className,
    medium: medium,
    academicYear: year,
    isActive: true
  });
  
  return subjectDoc ? subjectDoc.subjects : [];
};

// Static method to create default subjects for all classes
subjectSchema.statics.createDefaultSubjects = async function() {
  const defaultSubjects = {
    'Nursery': {
      'Hindi': ['हिन्दी', 'गणित', 'अंग्रेजी', 'चित्रकला', 'खेल'],
      'English': ['English', 'Mathematics', 'Hindi', 'Drawing', 'Games']
    },
    'LKG': {
      'Hindi': ['हिन्दी', 'गणित', 'अंग्रेजी', 'चित्रकला', 'खेल', 'कहानी'],
      'English': ['English', 'Mathematics', 'Hindi', 'Drawing', 'Games', 'Story']
    },
    'UKG': {
      'Hindi': ['हिन्दी', 'गणित', 'अंग्रेजी', 'चित्रकला', 'खेल', 'कहानी', 'सामान्य ज्ञान'],
      'English': ['English', 'Mathematics', 'Hindi', 'Drawing', 'Games', 'Story', 'General Knowledge']
    },
    'Class 1': {
      'Hindi': ['हिन्दी', 'गणित', 'अंग्रेजी', 'पर्यावरण अध्ययन', 'चित्रकला', 'खेल'],
      'English': ['English', 'Mathematics', 'Hindi', 'Environmental Studies', 'Drawing', 'Games']
    },
    'Class 2': {
      'Hindi': ['हिन्दी', 'गणित', 'अंग्रेजी', 'पर्यावरण अध्ययन', 'चित्रकला', 'खेल'],
      'English': ['English', 'Mathematics', 'Hindi', 'Environmental Studies', 'Drawing', 'Games']
    },
    'Class 3': {
      'Hindi': ['हिन्दी', 'गणित', 'अंग्रेजी', 'पर्यावरण अध्ययन', 'चित्रकला', 'खेल', 'संस्कृत'],
      'English': ['English', 'Mathematics', 'Hindi', 'Environmental Studies', 'Drawing', 'Games', 'Sanskrit']
    },
    'Class 4': {
      'Hindi': ['हिन्दी', 'गणित', 'अंग्रेजी', 'पर्यावरण अध्ययन', 'चित्रकला', 'खेल', 'संस्कृत'],
      'English': ['English', 'Mathematics', 'Hindi', 'Environmental Studies', 'Drawing', 'Games', 'Sanskrit']
    },
    'Class 5': {
      'Hindi': ['हिन्दी', 'गणित', 'अंग्रेजी', 'पर्यावरण अध्ययन', 'चित्रकला', 'खेल', 'संस्कृत'],
      'English': ['English', 'Mathematics', 'Hindi', 'Environmental Studies', 'Drawing', 'Games', 'Sanskrit']
    },
    'Class 6': {
      'Hindi': ['हिन्दी', 'गणित', 'अंग्रेजी', 'विज्ञान', 'सामाजिक विज्ञान', 'संस्कृत', 'चित्रकला', 'खेल'],
      'English': ['English', 'Mathematics', 'Hindi', 'Science', 'Social Science', 'Sanskrit', 'Drawing', 'Games']
    },
    'Class 7': {
      'Hindi': ['हिन्दी', 'गणित', 'अंग्रेजी', 'विज्ञान', 'सामाजिक विज्ञान', 'संस्कृत', 'चित्रकला', 'खेल'],
      'English': ['English', 'Mathematics', 'Hindi', 'Science', 'Social Science', 'Sanskrit', 'Drawing', 'Games']
    },
    'Class 8': {
      'Hindi': ['हिन्दी', 'गणित', 'अंग्रेजी', 'विज्ञान', 'सामाजिक विज्ञान', 'संस्कृत', 'चित्रकला', 'खेल'],
      'English': ['English', 'Mathematics', 'Hindi', 'Science', 'Social Science', 'Sanskrit', 'Drawing', 'Games']
    },
    'Class 9': {
      'Hindi': ['हिन्दी', 'गणित', 'अंग्रेजी', 'विज्ञान', 'सामाजिक विज्ञान', 'संस्कृत', 'चित्रकला', 'खेल'],
      'English': ['English', 'Mathematics', 'Hindi', 'Science', 'Social Science', 'Sanskrit', 'Drawing', 'Games']
    },
    'Class 10': {
      'Hindi': ['हिन्दी', 'गणित', 'अंग्रेजी', 'विज्ञान', 'सामाजिक विज्ञान', 'संस्कृत'],
      'English': ['English', 'Mathematics', 'Hindi', 'Science', 'Social Science', 'Sanskrit']
    },
    'Class 11 Science': {
      'Hindi': ['हिन्दी', 'अंग्रेजी', 'गणित', 'भौतिक विज्ञान', 'रसायन विज्ञान', 'जीव विज्ञान'],
      'English': ['Hindi', 'English', 'Mathematics', 'Physics', 'Chemistry', 'Biology']
    },
    'Class 11 Arts': {
      'Hindi': ['हिन्दी', 'अंग्रेजी', 'इतिहास', 'भूगोल', 'राजनीति विज्ञान', 'अर्थशास्त्र'],
      'English': ['Hindi', 'English', 'History', 'Geography', 'Political Science', 'Economics']
    },
    'Class 11 Commerce': {
      'Hindi': ['हिन्दी', 'अंग्रेजी', 'लेखाशास्त्र', 'व्यवसाय अध्ययन', 'अर्थशास्त्र', 'गणित'],
      'English': ['Hindi', 'English', 'Accountancy', 'Business Studies', 'Economics', 'Mathematics']
    },
    'Class 12 Science': {
      'Hindi': ['हिन्दी', 'अंग्रेजी', 'गणित', 'भौतिक विज्ञान', 'रसायन विज्ञान', 'जीव विज्ञान'],
      'English': ['Hindi', 'English', 'Mathematics', 'Physics', 'Chemistry', 'Biology']
    },
    'Class 12 Arts': {
      'Hindi': ['हिन्दी', 'अंग्रेजी', 'इतिहास', 'भूगोल', 'राजनीति विज्ञान', 'अर्थशास्त्र'],
      'English': ['Hindi', 'English', 'History', 'Geography', 'Political Science', 'Economics']
    },
    'Class 12 Commerce': {
      'Hindi': ['हिन्दी', 'अंग्रेजी', 'लेखाशास्त्र', 'व्यवसाय अध्ययन', 'अर्थशास्त्र', 'गणित'],
      'English': ['Hindi', 'English', 'Accountancy', 'Business Studies', 'Economics', 'Mathematics']
    }
  };

  const currentYear = new Date().getFullYear().toString();
  const createdSubjects = [];

  for (const [className, mediums] of Object.entries(defaultSubjects)) {
    for (const [medium, subjects] of Object.entries(mediums)) {
      // Check if subjects already exist
      const existing = await this.findOne({
        class: className,
        medium: medium,
        academicYear: currentYear
      });

      if (!existing) {
        const subjectDoc = new this({
          class: className,
          medium: medium,
          subjects: subjects,
          academicYear: currentYear,
          isActive: true
        });

        await subjectDoc.save();
        createdSubjects.push({
          class: className,
          medium: medium,
          subjectCount: subjects.length
        });
      }
    }
  }

  return createdSubjects;
};

// Instance method to get subject summary
subjectSchema.methods.getSubjectSummary = function() {
  return {
    class: this.class,
    medium: this.medium,
    subjectCount: this.subjects.length,
    subjects: this.subjects,
    academicYear: this.academicYear,
    isActive: this.isActive
  };
};

const Subject = mongoose.model('Subject', subjectSchema);

export default Subject;