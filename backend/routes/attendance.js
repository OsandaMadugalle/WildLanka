import express from 'express';
import { Router } from 'express';
import { 
  getAllAttendance,
  getAttendanceByStaff,
  getAttendanceByDateRange,
  createAttendance,
  updateAttendance,
  deleteAttendance,
  bulkCreateAttendance,
  getAttendanceStats,
  checkIn,
  checkOut,
  getCurrentDayStatus,
  getMyAttendance,
  generateDailyReport,
  generateDailyReportPDF
} from '../controllers/attendanceController.js';
import { authenticateToken, requireAdmin, requireStaff } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Admin-only routes (require admin privileges)
router.get('/', requireAdmin, getAllAttendance);
router.get('/date-range', requireAdmin, getAttendanceByDateRange);
router.get('/stats', requireAdmin, getAttendanceStats);
router.get('/daily-report', requireAdmin, generateDailyReport);
router.get('/daily-report-pdf', requireAdmin, generateDailyReportPDF);
router.post('/bulk', requireAdmin, bulkCreateAttendance);
router.delete('/:id', requireAdmin, deleteAttendance);

// Staff and admin routes (allow staff to manage their own attendance)
router.get('/staff/:staffId', requireStaff, getAttendanceByStaff);
router.get('/my-attendance', requireStaff, getMyAttendance);
router.post('/', requireStaff, createAttendance);
router.put('/:id', requireStaff, updateAttendance);
router.post('/check-in', requireStaff, checkIn);
router.post('/check-out', requireStaff, checkOut);
router.get('/current-day/:staffId', requireStaff, getCurrentDayStatus);

export default router;
