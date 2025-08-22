import express from 'express';
import {
  getAllPayroll,
  getPayrollByStaff,
  getPayrollByMonth,
  generatePayroll,
  createOrUpdatePayroll,
  updatePayrollStatus,
  deletePayroll,
  getPayrollStats,
  recalculatePayroll,
  refreshPayrollForMonth
} from '../controllers/payrollController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { getMyPayroll } from '../controllers/payrollController.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);
// Public staff access route must be defined before admin-only guard
router.get('/me', getMyPayroll);

// Admin-only routes
router.use(requireAdmin);

// Get all payroll records
router.get('/', getAllPayroll);

// Get payroll by staff ID
router.get('/staff/:staffId', getPayrollByStaff);

// Get payroll by month and year
router.get('/month/:month/:year', getPayrollByMonth);

// Get payroll statistics
router.get('/stats', getPayrollStats);

// Generate payroll for a specific month and year
router.post('/generate', generatePayroll);

// Create or update payroll record
router.post('/create', createOrUpdatePayroll);

// Update payroll status
router.patch('/:id/status', updatePayrollStatus);

// Recalculate payroll
router.post('/:id/recalculate', recalculatePayroll);

// Refresh all payroll records for a month
router.post('/refresh/:month/:year', refreshPayrollForMonth);

// Delete payroll record
router.delete('/:id', deletePayroll);

export default router;
