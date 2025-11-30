# API Endpoints

## Auth

### `POST /api/login`
- **Description:** User login for Students, Teachers, and Admins.
- **Request Body:**
  - `email` (string): User's email address.
  - `password` (string): User's password.
  - `role` (string): 'STUDENT', 'TEACHER', or 'ADMIN'.
- **Response:**
  - `id` (integer): User ID.
  - `name` (string): User's first name.
  - `surname` (string): User's last name.
  - `email` (string): User's email.
  - `role` (string): User's role.
  - `accountStatus` (string): Account status (e.g., 'aktif').
  - `joinDate` (string): Date of registration.

### `POST /api/register`
- **Description:** User registration for Students and Teachers.
- **Content-Type:** `multipart/form-data`
- **Request Body:**
  - `role` (string): 'STUDENT' or 'TEACHER'.
  - `name` (string): First name.
  - `surname` (string): Last name.
  - `email` (string): Email address.
  - `password` (string): Password.
  - `phone` (string): Phone number.
  - `birthDate` (string, optional): Date of birth .
  - `gender` (string, optional): Gender.
  - `grade` (string, optional): Grade (Student only).
  - `university` (string, optional): University (Teacher only).
  - `department` (string, optional): Department (Teacher only).
  - `profession` (string, optional): Profession (Teacher only).
  - `bio` (string, optional): Biography (Teacher only).
  - `document` (file, optional): Verification document (Teacher only).
- **Response:**
  - `userId` (integer): The ID of the newly created user.

## Common

### `GET /api/offerings`
- **Description:** Get all active teacher offerings.
- **Request:** None
- **Response:** Array of objects:
  - `id` (integer): Offering ID.
  - `teacherId` (integer): Teacher ID.
  - `subjectId` (integer): Subject ID.
  - `hourlyRate` (number): Cost per hour.
  - `subjectName` (string): Name of the subject.
  - `category` (string): Subject category.
  - `teacherName` (string): Teacher's first name.
  - `teacherSurname` (string): Teacher's last name.
  - `universite` (string): Teacher's university.
  - `rating` (number): Teacher's rating.
  - `bio` (string): Teacher's biography.

### `GET /api/subjects`
- **Description:** Get all active subjects.
- **Request:** None
- **Response:** Array of objects:
  - `id` (integer): Subject ID.
  - `name` (string): Subject name.
  - `category` (string): Subject category.

## Student

### `GET /api/student/offerings`
- **Description:** Get all active teacher offerings (Student view).
- **Request Params:**
  - `search` (string, optional): Search by subject name.
  - `category` (string, optional): Filter by category.
- **Response:** Array of objects:
  - `id` (integer)
  - `subjectName` (string)
  - `teacherName` (string)
  - `hourlyRate` (number)
  - `rating` (number)

### `GET /api/student/:id`
- **Description:** Get student profile details.
- **Request Params:**
  - `id` (integer): Student ID.
- **Response:**
  - `id` (integer): Student ID.
  - `name` (string): First name.
  - `surname` (string): Last name.
  - `email` (string): Email.
  - `phone` (string): Phone number.
  - `grade` (string): Grade level.
  - `birthDate` (string): Date of birth.
  - `gender` (string): Gender.

### `PUT /api/student/:id`
- **Description:** Update student profile details.
- **Request Params:**
  - `id` (integer): Student ID.
- **Request Body:**
  - `name` (string)
  - `surname` (string)
  - `phone` (string)
  - `grade` (string)
  - `birthDate` (string)
  - `gender` (string)
- **Response:**
  - `success` (boolean): true

### `GET /api/appointments/student/:id`
- **Description:** Get student's appointments.
- **Request Params:**
  - `id` (integer): Student ID.
- **Response:** Array of objects:
  - `id` (integer): Appointment ID.
  - `date` (string): Appointment date/time.
  - `durationMinutes` (integer): Duration.
  - `status` (string): Appointment status.
  - `zoomLink` (string): Zoom link.
  - `teacherName` (string): Teacher's full name.
  - `subjectName` (string): Subject name.
  - `price` (number): Cost.
  - `teacherId` (integer): Teacher ID.

### `POST /api/appointments`
- **Description:** Create a new appointment.
- **Request Body:**
  - `studentId` (integer)
  - `offeringId` (integer)
  - `date` (string): Appointment date/time.
- **Response:**
  - `message` (string): "Randevu oluşturuldu"

### `POST /api/appointments/review`
- **Description:** Submit a review for a completed appointment.
- **Request Body:**
  - `teacherId` (integer)
  - `studentId` (integer)
  - `rating` (number)
  - `comment` (string)
  - `appointmentId` (integer)
- **Response:**
  - `success` (boolean): true

### `POST /api/reviews`
- **Description:** Submit a review for a teacher.
- **Request Body:**
  - `teacherId` (integer)
  - `studentId` (integer)
  - `rating` (number)
  - `comment` (string)
- **Response:**
  - `success` (boolean): true

### `GET /api/payments/student/:id`
- **Description:** Get student's payment history.
- **Request Params:**
  - `id` (integer): Student ID.
- **Response:** Array of objects:
  - `id` (integer): Payment ID.
  - `amount` (number): Payment amount.
  - `status` (string): Payment status.
  - `date` (string): Appointment date.
  - `subjectName` (string): Subject name.

### `POST /api/payments/teacher/withdraw`
- **Description:** Withdraw teacher earnings.
- **Request Body:**
  - `paymentId` (integer): Payment ID to withdraw.
- **Response:**
  - `success` (boolean): true

### `POST /api/payments/pay`
- **Description:** Process a payment (Admin/System).
- **Request Body:**
  - `paymentId` (integer): Payment ID.
- **Response:**
  - `success` (boolean): true

## Teacher

### `GET /api/teacher/lessons`
- **Description:** Get all global lessons/subjects available for teachers to select.
- **Request:** None
- **Response:** Array of objects:
  - `id` (integer)
  - `name` (string)
  - `category` (string)
  - `level` (string)

### `GET /api/teacher/:id`
- **Description:** Get teacher profile details.
- **Request Params:**
  - `id` (integer): Teacher ID.
- **Response:**
  - `id` (integer)
  - `name` (string)
  - `surname` (string)
  - `email` (string)
  - `phone` (string)
  - `university` (string)
  - `department` (string)
  - `profession` (string)
  - `bio` (string)
  - `birthDate` (string)
  - `gender` (string)
  - `documentUrl` (string)

### `PUT /api/teacher/:id`
- **Description:** Update teacher profile details.
- **Request Params:**
  - `id` (integer): Teacher ID.
- **Request Body:**
  - `name` (string)
  - `surname` (string)
  - `phone` (string)
  - `university` (string)
  - `department` (string)
  - `profession` (string)
  - `bio` (string)
  - `birthDate` (string)
  - `gender` (string)
- **Response:**
  - `success` (boolean): true

### `POST /api/teacher/:id/upload-document`
- **Description:** Upload teacher verification document.
- **Request Params:**
  - `id` (integer): Teacher ID.
- **Request Body:**
  - `document` (file): The file to upload.
- **Response:**
  - `success` (boolean): true
  - `fileUrl` (string): URL of the uploaded file.

### `GET /api/appointments/teacher/:id`
- **Description:** Get teacher's appointments.
- **Request Params:**
  - `id` (integer): Teacher ID.
- **Response:** Array of objects:
  - `id` (integer)
  - `date` (string)
  - `durationMinutes` (integer)
  - `status` (string)
  - `studentName` (string)
  - `subjectName` (string)
  - `price` (number)

### `PUT /api/appointments/:id/status`
- **Description:** Update appointment status.
- **Request Params:**
  - `id` (integer): Appointment ID.
- **Request Body:**
  - `status` (string): New status (e.g., 'Tamamlandı', 'Öğrenci İptal').
- **Response:**
  - `success` (boolean): true

### `GET /api/teacher/:id/courses`
- **Description:** Get courses offered by a teacher.
- **Request Params:**
  - `id` (integer): Teacher ID.
- **Response:** Array of objects:
  - `id` (integer): Offering ID.
  - `subjectName` (string)
  - `category` (string)
  - `hourlyRate` (number)

### `POST /api/teacher/courses`
- **Description:** Add or update a course offering.
- **Request Body:**
  - `teacherId` (integer)
  - `subjectId` (integer)
  - `hourlyRate` (number)
- **Response:**
  - `success` (boolean): true

### `DELETE /api/teacher/courses/:id`
- **Description:** Soft delete a course offering.
- **Request Params:**
  - `id` (integer): Offering ID.
- **Response:**
  - `success` (boolean): true

### `GET /api/teacher/:id/busy-slots`
- **Description:** Get teacher's busy slots (appointments).
- **Request Params:**
  - `id` (integer): Teacher ID.
- **Response:** Array of objects:
  - `date` (string): Start time.
  - `duration` (integer): Duration in minutes.

### `GET /api/teacher/:id/availability`
- **Description:** Get teacher's availability hours.
- **Request Params:**
  - `id` (integer): Teacher ID.
- **Response:** Array of objects (from `ogretmen_calisma_saatleri` table).

### `POST /api/teacher/availability`
- **Description:** Set or update availability for a specific day.
- **Request Body:**
  - `teacherId` (integer)
  - `day` (integer): Day number.
  - `start` (string): Start time (e.g., "09:00").
  - `end` (string): End time (e.g., "17:00").
- **Response:**
  - `success` (boolean): true

### `DELETE /api/teacher/availability/:id`
- **Description:** Remove an availability slot.
- **Request Params:**
  - `id` (integer): Availability ID.
- **Response:**
  - `success` (boolean): true

### `GET /api/payments/teacher/:id`
- **Description:** Get teacher's payment/earnings history.
- **Request Params:**
  - `id` (integer): Teacher ID.
- **Response:** Array of objects:
  - `id` (integer)
  - `amount` (number)
  - `status` (string)
  - `date` (string)
  - `subjectName` (string)

## Admin

### `GET /api/admin/financial-management`
- **Description:** Get list of financial records (disputed or cancelled appointments).
- **Request:** None
- **Response:** Array of objects:
  - `id` (integer)
  - `date` (string)
  - `status` (string)
  - `studentName` (string)
  - `teacherName` (string)
  - `amount` (number)
  - `paymentStatus` (string)

### `POST /api/admin/financial-management/:id/resolve`
- **Description:** Resolve a financial dispute.
- **Request Params:**
  - `id` (integer): Appointment ID.
- **Request Body:**
  - `action` (string): 'refund' or 'pay_teacher'.
- **Response:**
  - `success` (boolean): true

### `GET /api/admin/users`
- **Description:** Get all users (Students and Teachers).
- **Request:** None
- **Response:** Array of objects:
  - `id` (integer)
  - `name` (string)
  - `surname` (string)
  - `email` (string)
  - `role` (string)
  - `accountStatus` (string)
  - `joinDate` (string)
  - `birthDate` (string, Teacher only)
  - `gender` (string, Teacher only)

### `PUT /api/admin/users/:id/status`
- **Description:** Update user account status.
- **Request Params:**
  - `id` (integer): User ID.
- **Request Body:**
  - `role` (string): 'STUDENT' or 'TEACHER'.
  - `status` (string): New status.
- **Response:**
  - `success` (boolean): true

### `GET /api/admin/teachers/pending`
- **Description:** Get list of teachers pending verification.
- **Request:** None
- **Response:** Array of objects:
  - `id` (integer)
  - `name` (string)
  - `surname` (string)
  - `university` (string)
  - `department` (string)
  - `profession` (string)
  - `documentUrl` (string)

### `PUT /api/admin/teachers/:id/verify`
- **Description:** Verify or reject a teacher.
- **Request Params:**
  - `id` (integer): Teacher ID.
- **Request Body:**
  - `verified` (boolean): true to verify, false to reject.
- **Response:**
  - `success` (boolean): true

### `PUT /api/users/:id/status`
- **Description:** Update user account status.
- **Request Params:**
  - `id` (integer): User ID.
- **Request Body:**
  - `role` (string): 'STUDENT' or 'TEACHER'.
  - `status` (string): New status.
- **Response:**
  - `success` (boolean): true

### `GET /api/teachers/pending`
- **Description:** Get list of teachers pending verification.
- **Request:** None
- **Response:** Array of objects:
  - `id` (integer)
  - `name` (string)
  - `surname` (string)
  - `university` (string)
  - `department` (string)
  - `profession` (string)
  - `documentUrl` (string)

### `PUT /api/teachers/:id/verify`
- **Description:** Verify or reject a teacher.
- **Request Params:**
  - `id` (integer): Teacher ID.
- **Request Body:**
  - `verified` (boolean): true to verify, false to reject.
- **Response:**
  - `success` (boolean): true

### `POST /api/admin/lessons`
- **Description:** Add a new lesson/subject.
- **Request Body:**
  - `name` (string)
  - `category` (string)
  - `level` (string)
- **Response:**
  - `id` (integer): New lesson ID.

### `PUT /api/admin/lessons/:id`
- **Description:** Update an existing lesson/subject.
- **Request Params:**
  - `id` (integer): Lesson ID.
- **Request Body:**
  - `name` (string)
  - `category` (string)
  - `level` (string)
- **Response:**
  - `success` (boolean): true

### `DELETE /api/admin/lessons/:id`
- **Description:** Soft delete a lesson/subject.
- **Request Params:**
  - `id` (integer): Lesson ID.
- **Response:**
  - `success` (boolean): true

### `GET /api/admin/stats`
- **Description:** Get system-wide statistics.
- **Request:** None
- **Response:**
  - `totalAppointments` (integer)
  - `totalRevenue` (number)
  - `totalUsers` (integer)
  - `activeTeachers` (integer)
  - `pendingTeachers` (integer)
