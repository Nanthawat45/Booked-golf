/**
 * @swagger
 * tags:
 *   name: Item
 *   description: การจัดการสินทรัพย์ (รถกอล์ฟ, ถุงกอล์ฟ)
 */

/* ---------- เพิ่ม Item ---------- */
/**
 * @swagger
 * /item/additem:
 *   post:
 *     summary: เพิ่มสินทรัพย์ใหม่ (รถกอล์ฟ/ถุงกอล์ฟ)
 *     tags: [Item]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - itemId
 *               - type 
 *             properties:
 *               itemId:
 *                 type: string
 *                 example: "GC001"
 *               type:
 *                 type: string
 *                 enum: [golfCar, golfBag]
 *                 example: "golfCar"
 *     responses:
 *       201:
 *         description: สร้างสินทรัพย์สำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: ข้อมูลไม่ถูกต้อง
 *       401:
 *         description: ไม่ได้รับอนุญาต (Unauthorized)
 *       403:
 *         description: ไม่มีสิทธิ์ (Forbidden)
 *       500:
 *         description: ข้อผิดพลาดภายในเซิร์ฟเวอร์
 */

/* ---------- ดูสรุปสถานะ Item ---------- */
/**
 * @swagger
 * /item/all-status:
 *   get:
 *     summary: ดูสรุปสถานะของสินทรัพย์ทั้งหมด
 *     tags: [Item]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: สรุปสถานะสำเร็จ
 *       401:
 *         description: ไม่ได้รับอนุญาต
 *       403:
 *         description: ไม่มีสิทธิ์
 *       500:
 *         description: ข้อผิดพลาดภายในเซิร์ฟเวอร์
 */