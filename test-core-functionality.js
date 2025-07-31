#!/usr/bin/env node

/**
 * Core Functionality Test Script
 * Tests student management, announcements, and admin dashboard after teacher/exam removal
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';
const FRONTEND_URL = 'http://localhost:3000';

// Test configuration
const TEST_CONFIG = {
  adminCredentials: {
    username: 'admin',
    password: 'admin123'
  },
  testStudent: {
    name: 'Test Student',
    fatherName: 'Test Father',
    motherName: 'Test Mother',
    dateOfBirth: '2010-01-01',
    gender: 'Male',
    class: '5',
    medium: 'English',
    year: 2024,
    address: 'Test Address',
    phoneNumber: '9876543210',
    email: 'test@example.com'
  },
  testAnnouncement: {
    title: 'Test Announcement',
    content: 'This is a test announcement to verify functionality',
    priority: 'medium',
    targetAudience: 'all'
  }
};

class CoreFunctionalityTester {
  constructor() {
    this.authToken = null;
    this.testResults = {
      studentManagement: {
        create: false,
        read: false,
        update: false,
        delete: false
      },
      announcements: {
        create: false,
        read: false,
        update: false,
        delete: false
      },
      adminDashboard: {
        login: false,
        stats: false,
        navigation: false
      }
    };
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.authToken && { 'Authorization': `Bearer ${this.authToken}` })
      }
    };

    const response = await fetch(url, { ...defaultOptions, ...options });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    return await response.text();
  }

  async testAdminLogin() {
    console.log('\n🔐 Testing Admin Login...');
    try {
      const response = await this.makeRequest('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify(TEST_CONFIG.adminCredentials)
      });

      if (response.token) {
        this.authToken = response.token;
        this.testResults.adminDashboard.login = true;
        console.log('✅ Admin login successful');
        return true;
      } else {
        console.log('❌ Admin login failed - no token received');
        return false;
      }
    } catch (error) {
      console.log(`❌ Admin login failed: ${error.message}`);
      return false;
    }
  }

  async testStudentManagement() {
    console.log('\n👥 Testing Student Management...');
    let createdStudentId = null;

    // Test Create Student
    try {
      console.log('  📝 Testing student creation...');
      const createResponse = await this.makeRequest('/api/students', {
        method: 'POST',
        body: JSON.stringify(TEST_CONFIG.testStudent)
      });

      if (createResponse.student && createResponse.student._id) {
        createdStudentId = createResponse.student._id;
        this.testResults.studentManagement.create = true;
        console.log('  ✅ Student creation successful');
      } else {
        console.log('  ❌ Student creation failed - no student ID returned');
      }
    } catch (error) {
      console.log(`  ❌ Student creation failed: ${error.message}`);
    }

    // Test Read Students
    try {
      console.log('  📖 Testing student retrieval...');
      const readResponse = await this.makeRequest('/api/students');

      if (Array.isArray(readResponse) || (readResponse.students && Array.isArray(readResponse.students))) {
        this.testResults.studentManagement.read = true;
        console.log('  ✅ Student retrieval successful');
      } else {
        console.log('  ❌ Student retrieval failed - invalid response format');
      }
    } catch (error) {
      console.log(`  ❌ Student retrieval failed: ${error.message}`);
    }

    // Test Update Student (if we have a created student)
    if (createdStudentId) {
      try {
        console.log('  ✏️ Testing student update...');
        const updateData = { ...TEST_CONFIG.testStudent, name: 'Updated Test Student' };
        const updateResponse = await this.makeRequest(`/api/students/${createdStudentId}`, {
          method: 'PUT',
          body: JSON.stringify(updateData)
        });

        if (updateResponse.student || updateResponse.success) {
          this.testResults.studentManagement.update = true;
          console.log('  ✅ Student update successful');
        } else {
          console.log('  ❌ Student update failed');
        }
      } catch (error) {
        console.log(`  ❌ Student update failed: ${error.message}`);
      }

      // Test Delete Student
      try {
        console.log('  🗑️ Testing student deletion...');
        const deleteResponse = await this.makeRequest(`/api/students/${createdStudentId}`, {
          method: 'DELETE'
        });

        if (deleteResponse.success || deleteResponse.message) {
          this.testResults.studentManagement.delete = true;
          console.log('  ✅ Student deletion successful');
        } else {
          console.log('  ❌ Student deletion failed');
        }
      } catch (error) {
        console.log(`  ❌ Student deletion failed: ${error.message}`);
      }
    }
  }

  async testAnnouncementSystem() {
    console.log('\n📢 Testing Announcement System...');
    let createdAnnouncementId = null;

    // Test Create Announcement
    try {
      console.log('  📝 Testing announcement creation...');
      const createResponse = await this.makeRequest('/api/announcements', {
        method: 'POST',
        body: JSON.stringify(TEST_CONFIG.testAnnouncement)
      });

      if (createResponse.announcement && createResponse.announcement._id) {
        createdAnnouncementId = createResponse.announcement._id;
        this.testResults.announcements.create = true;
        console.log('  ✅ Announcement creation successful');
      } else if (createResponse._id) {
        createdAnnouncementId = createResponse._id;
        this.testResults.announcements.create = true;
        console.log('  ✅ Announcement creation successful');
      } else {
        console.log('  ❌ Announcement creation failed - no announcement ID returned');
      }
    } catch (error) {
      console.log(`  ❌ Announcement creation failed: ${error.message}`);
    }

    // Test Read Announcements
    try {
      console.log('  📖 Testing announcement retrieval...');
      const readResponse = await this.makeRequest('/api/announcements');

      if (Array.isArray(readResponse) || (readResponse.announcements && Array.isArray(readResponse.announcements))) {
        this.testResults.announcements.read = true;
        console.log('  ✅ Announcement retrieval successful');
      } else {
        console.log('  ❌ Announcement retrieval failed - invalid response format');
      }
    } catch (error) {
      console.log(`  ❌ Announcement retrieval failed: ${error.message}`);
    }

    // Test Update Announcement (if we have a created announcement)
    if (createdAnnouncementId) {
      try {
        console.log('  ✏️ Testing announcement update...');
        const updateData = { ...TEST_CONFIG.testAnnouncement, title: 'Updated Test Announcement' };
        const updateResponse = await this.makeRequest(`/api/announcements/${createdAnnouncementId}`, {
          method: 'PUT',
          body: JSON.stringify(updateData)
        });

        if (updateResponse.announcement || updateResponse.success) {
          this.testResults.announcements.update = true;
          console.log('  ✅ Announcement update successful');
        } else {
          console.log('  ❌ Announcement update failed');
        }
      } catch (error) {
        console.log(`  ❌ Announcement update failed: ${error.message}`);
      }

      // Test Delete Announcement
      try {
        console.log('  🗑️ Testing announcement deletion...');
        const deleteResponse = await this.makeRequest(`/api/announcements/${createdAnnouncementId}`, {
          method: 'DELETE'
        });

        if (deleteResponse.success || deleteResponse.message) {
          this.testResults.announcements.delete = true;
          console.log('  ✅ Announcement deletion successful');
        } else {
          console.log('  ❌ Announcement deletion failed');
        }
      } catch (error) {
        console.log(`  ❌ Announcement deletion failed: ${error.message}`);
      }
    }
  }

  async testAdminDashboardFeatures() {
    console.log('\n📊 Testing Admin Dashboard Features...');

    // Test Dashboard Stats
    try {
      console.log('  📈 Testing dashboard statistics...');
      const statsResponse = await this.makeRequest('/api/admin/stats');

      if (statsResponse && typeof statsResponse === 'object') {
        this.testResults.adminDashboard.stats = true;
        console.log('  ✅ Dashboard statistics successful');
      } else {
        console.log('  ❌ Dashboard statistics failed - invalid response');
      }
    } catch (error) {
      console.log(`  ❌ Dashboard statistics failed: ${error.message}`);
    }

    // Test Navigation/Routes (check if key endpoints are accessible)
    try {
      console.log('  🧭 Testing dashboard navigation...');

      // Test multiple endpoints to ensure navigation works
      const endpoints = ['/api/students', '/api/announcements'];
      let navigationWorking = true;

      for (const endpoint of endpoints) {
        try {
          await this.makeRequest(endpoint);
        } catch (error) {
          navigationWorking = false;
          console.log(`    ❌ Navigation test failed for ${endpoint}: ${error.message}`);
        }
      }

      if (navigationWorking) {
        this.testResults.adminDashboard.navigation = true;
        console.log('  ✅ Dashboard navigation successful');
      }
    } catch (error) {
      console.log(`  ❌ Dashboard navigation failed: ${error.message}`);
    }
  }

  async testFrontendAccessibility() {
    console.log('\n🌐 Testing Frontend Accessibility...');

    try {
      const response = await fetch(FRONTEND_URL);
      if (response.ok) {
        console.log('✅ Frontend is accessible');
        return true;
      } else {
        console.log('❌ Frontend is not accessible');
        return false;
      }
    } catch (error) {
      console.log(`❌ Frontend accessibility test failed: ${error.message}`);
      return false;
    }
  }

  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📋 CORE FUNCTIONALITY TEST REPORT');
    console.log('='.repeat(60));

    // Student Management Results
    console.log('\n👥 STUDENT MANAGEMENT:');
    console.log(`  Create: ${this.testResults.studentManagement.create ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  Read:   ${this.testResults.studentManagement.read ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  Update: ${this.testResults.studentManagement.update ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  Delete: ${this.testResults.studentManagement.delete ? '✅ PASS' : '❌ FAIL'}`);

    // Announcement System Results
    console.log('\n📢 ANNOUNCEMENT SYSTEM:');
    console.log(`  Create: ${this.testResults.announcements.create ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  Read:   ${this.testResults.announcements.read ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  Update: ${this.testResults.announcements.update ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  Delete: ${this.testResults.announcements.delete ? '✅ PASS' : '❌ FAIL'}`);

    // Admin Dashboard Results
    console.log('\n📊 ADMIN DASHBOARD:');
    console.log(`  Login:      ${this.testResults.adminDashboard.login ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  Stats:      ${this.testResults.adminDashboard.stats ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  Navigation: ${this.testResults.adminDashboard.navigation ? '✅ PASS' : '❌ FAIL'}`);

    // Overall Summary
    const totalTests = Object.values(this.testResults).reduce((acc, category) =>
      acc + Object.keys(category).length, 0);
    const passedTests = Object.values(this.testResults).reduce((acc, category) =>
      acc + Object.values(category).filter(result => result).length, 0);

    console.log('\n' + '='.repeat(60));
    console.log(`📊 OVERALL RESULTS: ${passedTests}/${totalTests} tests passed`);
    console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

    if (passedTests === totalTests) {
      console.log('🎉 ALL CORE FUNCTIONALITY TESTS PASSED!');
    } else {
      console.log('⚠️  Some tests failed. Please review the results above.');
    }

    console.log('='.repeat(60));

    return passedTests === totalTests;
  }

  async runAllTests() {
    console.log('🚀 Starting Core Functionality Tests...');
    console.log('Testing student management, announcements, and admin dashboard');

    // Test frontend accessibility first
    await this.testFrontendAccessibility();

    // Test admin login
    const loginSuccess = await this.testAdminLogin();
    if (!loginSuccess) {
      console.log('❌ Cannot proceed with tests - admin login failed');
      return false;
    }

    // Run all functionality tests
    await this.testStudentManagement();
    await this.testAnnouncementSystem();
    await this.testAdminDashboardFeatures();

    // Generate and return report
    return this.generateReport();
  }
}

// Run the tests
const tester = new CoreFunctionalityTester();
tester.runAllTests()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  });