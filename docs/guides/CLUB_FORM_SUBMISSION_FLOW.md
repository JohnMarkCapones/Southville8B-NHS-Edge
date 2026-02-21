# Complete Club Form Submission Flow - Backend Analysis

## Overview
This document provides a comprehensive understanding of how students submit club forms,
how responses are stored, and the relationship between form submissions and club membership
in the Southville 8B NHS Edge backend API.

---

## 1. Backend Endpoint for Submitting Form Responses

### Endpoint Details

Route: POST /clubs/:clubId/forms/:formId/responses

File: src/clubs/controllers/club-forms.controller.ts (Lines 216-238)
