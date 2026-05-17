# JAYKIA Transportation Application

## Project Overview

JayKia is a transport company dedicated to providing safe, reliable, professional, and comfortable transportation services. The platform facilitates real-time communication and updates between clients and service providers to ensure a seamless travel experience.

## System Modules

The architecture is divided into several core modules to manage the lifecycle of a transport request:

- User Module: Handles user profiles, authentication (including Google OAuth), and account management with a 90-day soft-deletion policy.

- Booking Module: Manages the ride request process, including pickup/drop-off locations and specialized flight tracking for airport transfers.

- Payment Module: Supports multiple payment methods including Cash, Card, and Mpesa (STK Push), with provisions for deposit amounts and ulterior agreements.

- Role & Permission Module: A granular RBAC (Role-Based Access Control) system that allows admins to assign specific roles and permissions to users.

- Refunds & Feedback: Processes customer refund applications and collects 1-5 star ratings and comments to monitor service quality.

- Analytics: Provides administrative insights into monthly user growth and sales aggregates.

## User Types

1. Admins: Project owners and technical support with full access to CRM, analytics, and role assignments.

2. Customers: The primary users who book rides and manage their personal trip history.

3. Drivers: Planned for future updates; currently excluded from the MVP phase.

## Key Workflows

- Authentication: Users sign up or log in via standard credentials or Google OAuth.

- Booking & Flight Tracking: Customers book rides; if the trip is for a flight, users provide flight numbers and arrival/departure times.

- Cancellation Policy: Full refunds are available for cancellations made at least 6 hours before pickup; later cancellations may incur a fee.

- Administrative Oversight: Admins use a dedicated dashboard to manage users, flag accounts for indecency or failed payments, and approve refund requests.

## Technical Roadmap

- Version 1 (Current): Web-based platform.

- Future Updates: Integration of the Driver module and native mobile applications for Android and iOS.
