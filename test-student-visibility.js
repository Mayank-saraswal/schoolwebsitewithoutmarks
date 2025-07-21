#!/usr/bin/env node

/**
 * Test Script for Student Visibility Issue
 * 
 * This script tests the complete flow:
 * 1. Create a test teacher
 * 2. Login as teacher
 * 3. Create a student
 * 4. Verify student appears in "My Students"
 * 5. Verify admin can see the student
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000';

// Test configuration
const TEST_CONFIG = {
  teacher: {
    fullName: 'Test Teacher Visibility',
    mobile: '8888888888',
    email: 'test.visibility@school.com',
    password: '123456',
    classTeacherOf: 'Class 10',
    medium: 'Hindi',
    address: 'Test Address for Visibility',
    qualification: 'B.Ed'
  },
  student: {
    studentName: 'Test Student Visibility',
    fatherName: 'Test Father Visibility',
    motherName: 'Test Mother Visibility',
    srNumber: 'SR2025TEST',
    address: 'Test Student Address, Test City, Test State - 123456',
    postalCode: '123456',
    parentMobile: '7777777777',
    aadharNumber: '999999999999',
    janAadharNumber: 'JANTEST123456',
    dateOfBirth: '2010-01-01',
    class: 'Class 10',
    medium: 'Hindi',
    hasBus: false,
    notes: 'Test student for visibility testing'
  },
  admin: {
    adminId: 'mayanksaraswal@gmail.com',
    password: 'HelloAdmin'
  }
};

// Helper function to make API calls
async function apiCall(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const defaultOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    credentials: 'include',
    ...options
  };

  console.log(`🌐 ${defaultOptions.method} ${url}`);
  
  try {
    const response = await fetch(url, defaultOptions);
    const data = await response.json();
    
    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      console.error('❌ API Error:', data);
      throw new Error(data.message || `HTTP ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error('🚨 Request failed:', error.message);
    throw error;
  }
}

// Test functions
async function setupTestData() {
  console.log('\n🧪 Setting up test data...');
  
  try {
    // Create test teacher
    console.log('\n1️⃣ Creating test teacher...');
    const teacherResponse = await apiCall('/api/teachers/register', {
      method: 'POST',
      body: JSON.stringify(TEST_CONFIG.teacher)
    });
    
    if (teacherResponse.success) {
      console.log('✅ Test teacher created successfully');
      console.log(`📝 Teacher ID: ${teacherResponse.data.teacher.teacherId}`);
      
      // Approve the teacher
      console.log('\n2️⃣ Approving test teacher...');
      
      // First login as admin
      const adminLoginResponse = await apiCall('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify(TEST_CONFIG.admin)
      });
      
      if (adminLoginResponse.success) {
        console.log('✅ Admin logged in successfully');
        
        // Get teacher requests to find our teacher
        const teacherRequestsResponse = await apiCall('/api/admin/teacher-requests');
        
        if (teacherRequestsResponse.success) {
          const ourTeacher = teacherRequestsResponse.data.find(t => 
            t.mobile === TEST_CONFIG.teacher.mobile
          );
          
          if (ourTeacher) {
            // Approve the teacher
            const approveResponse = await apiCall(`/api/admin/approve-teacher/${ourTeacher._id}`, {
              method: 'PATCH',
              body: JSON.stringify({ approvedBy: 'Test Admin' })
            });
            
            if (approveResponse.success) {
              console.log('✅ Test teacher approved successfully');
              return { teacherId: ourTeacher._id, teacherData: ourTeacher };
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('❌ Failed to setup test data:', error.message);
    throw error;
  }
}

async function testTeacherLogin() {
  console.log('\n3️⃣ Testing teacher login...');
  
  try {
    const loginResponse = await apiCall('/api/teachers/login', {
      method: 'POST',
      body: JSON.stringify({
        mobile: TEST_CONFIG.teacher.mobile,
        password: TEST_CONFIG.teacher.password
      })
    });
    
    if (loginResponse.success) {
      console.log('✅ Teacher login successful');
      console.log(`👨‍🏫 Logged in as: ${loginResponse.data.teacher.fullName}`);
      console.log(`🎓 Medium: ${loginResponse.data.teacher.medium}`);
      console.log(`📚 Class: ${loginResponse.data.teacher.classTeacherOf}`);
      return loginResponse.data.teacher;
    }
  } catch (error) {
    console.error('❌ Teacher login failed:', error.message);
    throw error;
  }
}

async function testStudentCreation() {
  console.log('\n4️⃣ Testing student creation...');
  
  try {
    const createResponse = await apiCall('/api/students/create', {
      method: 'POST',
      body: JSON.stringify(TEST_CONFIG.student)
    });
    
    if (createResponse.success) {
      console.log('✅ Student created successfully');
      console.log(`👨‍🎓 Student: ${createResponse.data.student.studentName}`);
      console.log(`🆔 SR Number: ${createResponse.data.student.srNumber}`);
      console.log(`🎓 Medium: ${createResponse.data.student.medium}`);
      console.log(`📚 Class: ${createResponse.data.student.class}`);
      console.log(`📅 Academic Year: ${createResponse.data.student.academicYear}`);
      return createResponse.data.student;
    }
  } catch (error) {
    console.error('❌ Student creation failed:', error.message);
    throw error;
  }
}

async function testMyStudentsList() {
  console.log('\n5️⃣ Testing "My Students" list...');
  
  try {
    const studentsResponse = await apiCall('/api/students/my-students');
    
    if (studentsResponse.success) {
      console.log('✅ My Students list retrieved successfully');
      console.log(`📊 Total students: ${studentsResponse.data.length}`);
      console.log(`📈 Statistics:`, studentsResponse.stats);
      
      // Check if our test student is in the list
      const ourStudent = studentsResponse.data.find(s => 
        s.srNumber === TEST_CONFIG.student.srNumber
      );
      
      if (ourStudent) {
        console.log('✅ Test student found in "My Students" list');
        console.log(`👨‍🎓 Found: ${ourStudent.studentName} (${ourStudent.srNumber})`);
        return true;
      } else {
        console.error('❌ Test student NOT found in "My Students" list');
        console.log('📋 Students in list:');
        studentsResponse.data.forEach(s => {
          console.log(`  - ${s.studentName} (${s.srNumber}) - ${s.medium} Medium`);
        });
        return false;
      }
    }
  } catch (error) {
    console.error('❌ Failed to get "My Students" list:', error.message);
    throw error;
  }
}

async function testAdminStudentsList() {
  console.log('\n6️⃣ Testing admin students list...');
  
  try {
    // Login as admin first
    const adminLoginResponse = await apiCall('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify(TEST_CONFIG.admin)
    });
    
    if (adminLoginResponse.success) {
      console.log('✅ Admin logged in successfully');
      
      // Get students with Hindi medium and current year
      const currentYear = new Date().getFullYear();
      const studentsResponse = await apiCall(`/api/admin/students?medium=Hindi&year=${currentYear}`);
      
      if (studentsResponse.success) {
        console.log('✅ Admin students list retrieved successfully');
        console.log(`📊 Total students: ${studentsResponse.data.length}`);
        console.log(`📈 Statistics:`, studentsResponse.stats);
        console.log(`🔍 Filters:`, studentsResponse.filters);
        
        // Check if our test student is in the list
        const ourStudent = studentsResponse.data.find(s => 
          s.srNumber === TEST_CONFIG.student.srNumber
        );
        
        if (ourStudent) {
          console.log('✅ Test student found in admin students list');
          console.log(`👨‍🎓 Found: ${ourStudent.studentName} (${ourStudent.srNumber})`);
          return true;
        } else {
          console.error('❌ Test student NOT found in admin students list');
          console.log('📋 Students in admin list:');
          studentsResponse.data.forEach(s => {
            console.log(`  - ${s.studentName} (${s.srNumber}) - ${s.medium} Medium - Year ${s.academicYear}`);
          });
          return false;
        }
      }
    }
  } catch (error) {
    console.error('❌ Failed to test admin students list:', error.message);
    throw error;
  }
}

async function cleanup() {
  console.log('\n🧹 Cleaning up test data...');
  
  try {
    // Delete test student and teacher
    const cleanupResponse = await apiCall('/api/admin/debug/clear-test-data', {
      method: 'POST',
      body: JSON.stringify({
        teacherMobile: TEST_CONFIG.teacher.mobile,
        studentSrNumber: TEST_CONFIG.student.srNumber
      })
    });
    
    console.log('✅ Test data cleanup completed');
  } catch (error) {
    console.log('⚠️ Cleanup failed (this is okay):', error.message);
  }
}

// Main test function
async function runVisibilityTest() {
  console.log('🚀 Starting Student Visibility Test');
  console.log('=====================================');
  
  let testResults = {
    setup: false,
    teacherLogin: false,
    studentCreation: false,
    myStudentsList: false,
    adminStudentsList: false
  };
  
  try {
    // Setup test data
    const setupResult = await setupTestData();
    testResults.setup = true;
    
    // Test teacher login
    const teacher = await testTeacherLogin();
    testResults.teacherLogin = true;
    
    // Test student creation
    const student = await testStudentCreation();
    testResults.studentCreation = true;
    
    // Test "My Students" list
    const myStudentsResult = await testMyStudentsList();
    testResults.myStudentsList = myStudentsResult;
    
    // Test admin students list
    const adminStudentsResult = await testAdminStudentsList();
    testResults.adminStudentsList = adminStudentsResult;
    
  } catch (error) {
    console.error('\n🚨 Test failed:', error.message);
  } finally {
    // Cleanup
    await cleanup();
  }
  
  // Print test results
  console.log('\n📊 Test Results Summary');
  console.log('=======================');
  console.log(`Setup Test Data: ${testResults.setup ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Teacher Login: ${testResults.teacherLogin ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Student Creation: ${testResults.studentCreation ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`My Students List: ${testResults.myStudentsList ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Admin Students List: ${testResults.adminStudentsList ? '✅ PASS' : '❌ FAIL'}`);
  
  const allPassed = Object.values(testResults).every(result => result === true);
  
  if (allPassed) {
    console.log('\n🎉 ALL TESTS PASSED! Student visibility is working correctly.');
  } else {
    console.log('\n⚠️ SOME TESTS FAILED. Student visibility issue still exists.');
    
    // Provide debugging suggestions
    console.log('\n🔧 Debugging Suggestions:');
    if (!testResults.myStudentsList) {
      console.log('- Check if teacher medium is properly set in JWT token');
      console.log('- Verify student creation includes correct medium and academic year');
      console.log('- Check if getMyStudents query filters are working correctly');
    }
    if (!testResults.adminStudentsList) {
      console.log('- Check if admin student query includes correct medium and year filters');
      console.log('- Verify academic year is being set correctly during student creation');
    }
  }
  
  console.log('\n🏁 Test completed.');
  process.exit(allPassed ? 0 : 1);
}

// Run the test
if (require.main === module) {
  runVisibilityTest().catch(error => {
    console.error('🚨 Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = { runVisibilityTest };