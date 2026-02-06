# API Testing Guide

## Base URL
http://localhost:5000

## Authentication Endpoints

### 1. Signup
POST /api/auth/signup
Content-Type: application/json

{
  "email": "student@vitstudent.ac.in",
  "password": "password123",
  "fullName": "Student Name",
  "role": "student"
}

### 2. Login
POST /api/auth/login
Content-Type: application/json

{
  "email": "student@vitstudent.ac.in",
  "password": "password123"
}

### 3. Get Profile
GET /api/auth/profile
Authorization: Bearer YOUR_FIREBASE_TOKEN

### 4. Update Profile
PUT /api/auth/profile
Authorization: Bearer YOUR_FIREBASE_TOKEN
Content-Type: application/json

{
  "fullName": "Updated Name"
}

## Valid Email Domains
- @vit.ac.in
- @vitstudent.ac.in

## Valid Roles
- student
- professor