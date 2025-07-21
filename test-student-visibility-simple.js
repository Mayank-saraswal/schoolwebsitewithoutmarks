#!/usr/bin/env node

/**
 * Simple Test Script for Student Visibility Fix
 * 
 * This script tests the basic functionality:
 * 1. Create a test student via debug endpoint
 * 2. Test teacher "My Students" API
 * 3. Test admin students API
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000';

// Test data
const TEST_STUDENT = {
  studentName: 'Test Student Fix',
  fatherName: 'Test Father Fix',
  motherName: 'Test Mother Fix',
  srNumber: 'SR2025FIX',
  address: 'Test Address, Test City, Test State - 123456',
  postalCode: '123456',
  parentMobile: '6666666666',
  aadharNumber: '888888888888',
  janAadharNumber: 'JANFIX123456',
  dateOfBirth: '2010-01-01',
  class: 'Class 10',
  medium: 'Hindi',
  hasBus: false,
  notes: 'Test student for fix verification'
};

const ADMIN_CREDS = {
  adminId: 'mayanksaraswal@gmail.com',
  password: 'HelloAdmin'
};

// Helper function
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
    
    console.log(`📊 Status: ${response.status}`);
    
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

async function testStudentCreation() {
  console.log('\n1️⃣ Creating test student via debug endpoint...');
  
  try {
    const response = await apiCall('/api/students/debug/create', {
      method: 'POST',
      body: JSON.stringify(TEST_STUDENT)
    });
    
    if (response.success) {
      console.log('✅ Test student created successfully');
      console.log(`👨‍🎓 Student: ${response.data.student.studentName}`);
      console.log(`🆔 SR Number: ${response.data.student.srNumber}`);
      console.log(`🎓 Medium: ${response.data.student.medium}`);
      console.log(`📅 Academic Year: ${response.data.student.academicYear}`);
      return response.data.student;
    }
  } catch (error) {
    console.error('❌ Student creation failed:', error.message);
    throw error;
  }
}

async function testTeacherStudentsList() {
  console.log('\n2️⃣ Testing teacher "My Students" API...');
  
  try {
    // Use debug teacher credentials (from debug endpoint)
    const response = await apiCall('/api/students/my-students', {
      headers: {
        'Authorization': 'Bearer debug-teacher-token' // This will be handled by debug middleware
      }
    });
    
    if (response.success) {
      console.log('✅ Teacher students list retrieved');
      console.log(`📊 Total students: ${response.data.length}`);
      console.log(`📈 Statistics:`, response.stats);
      console.log(`🔍 Filters applied:`, response.filters);
      
      // Check if our test student is in the list
      const ourStudent = response.data.find(s => 
        s.srNumber === TEST_STUDENT.srNumber
      );
      
      if (ourStudent) {
        console.log('✅ Test student found in teacher list');
        return true;
      } else {
        console.error('❌ Test student NOT found in teacher list');
        console.log('📋 Students found:');
        response.data.forEach(s => {
          console.log(`  - ${s.studentName} (${s.srNumber}) - ${s.medium} - Year ${s.academicYear}`);
        });
        return false;
      }
    }
  } catch (error) {
    console.error('❌ Teacher students list failed:', error.message);
    return false;
  }
}

async function testAdminStudentsList() {
  console.log('\n3️⃣ Testing admin students API...');
  
  try {
    // Login as admin
    const loginResponse = await apiCall('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify(ADMIN_CREDS)
    });
    
    if (loginResponse.success) {
      console.log('✅ Admin logged in successfully');
      
      // Get students with Hindi medium and current year
      const currentYear = new Date().getFullYear();
      const studentsResponse = await apiCall(`/api/admin/students?medium=Hindi&year=${currentYear}`);
      
      if (studentsResponse.success) {
        console.log('✅ Admin students list retrieved');
        console.log(`📊 Total students: ${studentsResponse.data.length}`);
        console.log(`📈 Statistics:`, studentsResponse.stats);
        console.log(`🔍 Filters applied:`, studentsResponse.filters);
        
        // Check if our test student is in the list
        const ourStudent = studentsResponse.data.find(s => 
          s.srNumber === TEST_STUDENT.srNumber
        );
        
        if (ourStudent) {
          console.log('✅ Test student found in admin list');
          return true;
        } else {
          console.error('❌ Test student NOT found in admin list');
          console.log('📋 Students found:');
          studentsResponse.data.forEach(s => {
            console.log(`  - ${s.studentName} (${s.srNumber}) - ${s.medium} - Year ${s.academicYear}`);
          });
          return false;
        }
      }
    }
  } catch (error) {
    console.error('❌ Admin students list failed:', error.message);
    return false;
  }
}

async function runSimpleTest() {
  console.log('🚀 Starting Simple Student Visibility Test');
  console.log('==========================================');
  
  let results = {
    creation: false,
    teacherList: false,
    adminList: false
  };
  
  try {
    // Test student creation
    const student = await testStudentCreation();
    results.creation = true;
    
    // Test teacher list
    results.teacherList = await testTeacherStudentsList();
    
    // Test admin list
    results.adminList = await testAdminStudentsList();
    
  } catch (error) {
    console.error('\n🚨 Test failed:', error.message);
  }
  
  // Print results
  console.log('\n📊 Test Results');
  console.log('================');
  console.log(`Student Creation: ${results.creation ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Teacher List: ${results.teacherList ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Admin List: ${results.adminList ? '✅ PASS' : '❌ FAIL'}`);
  
  const allPassed = Object.values(results).every(r => r === true);
  
  if (allPassed) {
    console.log('\n🎉 ALL TESTS PASSED! Student visibility fix is working.');
  } else {
    console.log('\n⚠️ SOME TESTS FAILED. Issues still exist.');
  }
  
  console.log('\n🏁 Test completed.');
  process.exit(allPassed ? 0 : 1);
}

// Run the test
if (require.main === module) {
  runSimpleTest().catch(error => {
    console.error('🚨 Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = { runSimpleTest };