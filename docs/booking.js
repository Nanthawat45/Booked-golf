/**
 * @swagger
 * tags:
 *   - name: Booking
 *     description: จัดการการจองกอล์ฟ
 */

/* ---------- สร้างการจอง ---------- */
 /**
  * @swagger
  * /booking/book:
  *   post:
  *     summary: สร้างการจองใหม่
  *     tags: [Booking]
  *     security:
  *       - bearerAuth: []
  *     requestBody:
  *       required: true
  *       content:
  *         application/json:
  *           schema:
  *             $ref: '#/components/schemas/BookingRequest'
  *     responses:
  *       201:
  *         description: การจองสำเร็จ
  *         content:
  *           application/json:
  *             schema:
  *               $ref: '#/components/schemas/Booking'
  *       400:
  *         description: ข้อมูลไม่ถูกต้องหรืออุปกรณ์ไม่เพียงพอ
  */

/* ---------- ดูการจองทั้งหมดของผู้ใช้ ---------- */
 /**
  * @swagger
  * /booking/getbook:
  *   get:
  *     summary: ดึงข้อมูลการจองทั้งหมดของผู้ใช้
  *     tags: [Booking]
  *     security:
  *       - bearerAuth: []
  *     responses:
  *       200:
  *         description: รายการการจอง
  *         content:
  *           application/json:
  *             schema:
  *               type: array
  *               items:
  *                 $ref: '#/components/schemas/Booking'
  */

/* ---------- แก้ไข / ลบการจอง ---------- */
 /**
  * @swagger
  * /booking/{id}:
  *   put:
  *     summary: แก้ไขเวลาการจอง
  *     tags: [Booking]
  *     security:
  *       - bearerAuth: []
  *     parameters:
  *       - in: path
  *         name: id
  *         required: true
  *         schema:
  *           type: string
  *     requestBody:
  *       required: true
  *       content:
  *         application/json:
  *           schema:
  *             type: object
  *             properties:
  *               timeSlot:
  *                 type: string
  *             required: [timeSlot]
  *     responses:
  *       200:
  *         description: แก้ไขสำเร็จ
  *         content:
  *           application/json:
  *             schema:
  *               $ref: '#/components/schemas/Booking'
  *       400:
  *         description: ข้อมูลไม่ถูกต้อง
  *       404:
  *         description: ไม่พบการจอง
  *
  *   delete:
  *     summary: ลบการจอง
  *     tags: [Booking]
  *     security:
  *       - bearerAuth: []
  *     parameters:
  *       - in: path
  *         name: id
  *         required: true
  *         schema:
  *           type: string
  *     responses:
  *       200:
  *         description: ลบสำเร็จ
  *       404:
  *         description: ไม่พบการจอง
  */
