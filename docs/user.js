/**
 * @swagger
 * tags:
 *   name: User
 *   description: การจัดการผู้ใช้งานระบบ
 */

/**
 * @swagger
 * /user/login:
 *   post:
 *     summary: เข้าสู่ระบบ
 *     tags: [User]
 *     requestBody:
 *       description: ข้อมูลสำหรับเข้าสู่ระบบ
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: u1@gmail.com
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: เข้าสู่ระบบสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       401:
 *         description: ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง
 */